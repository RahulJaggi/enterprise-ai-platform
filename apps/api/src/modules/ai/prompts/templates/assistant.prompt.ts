import { IPromptTemplate } from '../prompt.interface';
import { FormattedPrompt } from '../prompt.types';
import { DEFAULT_ENTERPRISE_SYSTEM_PROMPT } from './system.prompt';

export class AssistantPromptTemplate implements IPromptTemplate {
  readonly templateType = 'assistant';
  readonly defaultSystemPrompt = DEFAULT_ENTERPRISE_SYSTEM_PROMPT;

  format(userPrompt: string, context?: string): FormattedPrompt {
    let finalPrompt = userPrompt;
    if (context && context.trim().length > 0) {
      finalPrompt = `Background Context:\n${context.trim()}\n\nUser Request:\n${userPrompt}`;
    }

    return {
      prompt: finalPrompt,
      systemPrompt: this.defaultSystemPrompt,
    };
  }
}
