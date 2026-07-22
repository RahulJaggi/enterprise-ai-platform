import {
  Injectable,
  Logger,
  ServiceUnavailableException,
  GatewayTimeoutException,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IAiProvider, AiCompletionRequest, AiCompletionResponse } from './ollama.interface';

interface OllamaChatResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

interface OllamaErrorResponse {
  error?: string;
}

@Injectable()
export class OllamaProvider implements IAiProvider {
  readonly providerName = 'ollama';
  private readonly logger = new Logger(OllamaProvider.name);

  private readonly baseUrl: string;
  private readonly defaultModel: string;
  private readonly timeoutMs: number;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('OLLAMA_BASE_URL', 'http://localhost:11434');
    this.defaultModel = this.configService.get<string>('OLLAMA_DEFAULT_MODEL', 'qwen2.5:7b');
    this.timeoutMs = this.configService.get<number>('OLLAMA_TIMEOUT_MS', 30000);
  }

  async generateCompletion(request: AiCompletionRequest): Promise<AiCompletionResponse> {
    const startTime = Date.now();
    const targetModel = request.model || this.defaultModel;
    const endpoint = `${this.baseUrl}/api/chat`;

    this.logger.debug(
      `Dispatching prompt to Ollama provider [Model: ${targetModel}, PromptLength: ${request.prompt.length} chars]`,
    );

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: targetModel,
          messages: [
            ...(request.systemPrompt ? [{ role: 'system', content: request.systemPrompt }] : []),
            { role: 'user', content: request.prompt },
          ],
          stream: false,
        }),
        signal: AbortSignal.timeout(this.timeoutMs),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let parsedMessage = errorText;

        try {
          const parsed = JSON.parse(errorText) as OllamaErrorResponse;
          if (parsed.error) {
            parsedMessage = parsed.error;
          }
        } catch {
          // Keep raw errorText if not JSON
        }

        this.logger.error(
          `Ollama HTTP error [Status: ${response.status}, Model: ${targetModel}]: ${parsedMessage}`,
        );

        if (response.status === 404) {
          throw new NotFoundException(
            `Ollama model '${targetModel}' not found. Please run 'ollama pull ${targetModel}' or set OLLAMA_DEFAULT_MODEL in your environment. Details: ${parsedMessage}`,
          );
        }

        if (response.status === 400) {
          throw new BadRequestException(
            `Invalid request sent to Ollama provider: ${parsedMessage}`,
          );
        }

        throw new InternalServerErrorException(
          `Ollama provider error (${response.status}): ${parsedMessage}`,
        );
      }

      const data = (await response.json()) as OllamaChatResponse;
      const durationMs = Date.now() - startTime;

      this.logger.log(
        `Ollama response generated successfully [Model: ${data.model}, Duration: ${durationMs}ms, OutputChars: ${data.message?.content?.length ?? 0}]`,
      );

      return {
        text: data.message?.content || '',
        model: data.model,
        durationMs,
      };
    } catch (error: unknown) {
      const durationMs = Date.now() - startTime;

      if (error instanceof Error && error.name === 'TimeoutError') {
        this.logger.error(
          `Ollama provider timed out after ${this.timeoutMs}ms [Duration: ${durationMs}ms]`,
        );
        throw new GatewayTimeoutException(
          `Ollama model provider timed out after ${this.timeoutMs}ms`,
        );
      }

      if (
        error instanceof Error &&
        (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed'))
      ) {
        this.logger.error(
          `Ollama service connection refused at ${this.baseUrl} [Duration: ${durationMs}ms]`,
        );
        throw new ServiceUnavailableException(
          `Ollama LLM service is unreachable at ${this.baseUrl}. Verify that Ollama is running.`,
        );
      }

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ServiceUnavailableException ||
        error instanceof GatewayTimeoutException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown provider error';
      this.logger.error(`Ollama generation failed: ${errorMessage}`);
      throw new InternalServerErrorException(
        `Failed to generate completion from Ollama provider: ${errorMessage}`,
      );
    }
  }
}
