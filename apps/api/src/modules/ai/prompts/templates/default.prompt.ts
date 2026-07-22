import { IPromptTemplate } from '../prompt.interface';
import { FormattedPrompt } from '../prompt.types';
import { DEFAULT_ENTERPRISE_SYSTEM_PROMPT } from './system.prompt';
import { MemoryMessage } from '../../memory/models/message';

export class DefaultPromptTemplate implements IPromptTemplate {
  readonly templateType = 'default';
  readonly defaultSystemPrompt = DEFAULT_ENTERPRISE_SYSTEM_PROMPT;

  format(userPrompt: string, context?: string, history?: MemoryMessage[]): FormattedPrompt {
    let finalPrompt = userPrompt;

    if (history && history.length > 0) {
      const historyFormatted = history
        .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');
      finalPrompt = `Conversation History:\n${historyFormatted}\n\nQuestion:\n${userPrompt}`;
    }

    if (context && context.trim().length > 0) {
      finalPrompt = `Context:\n${context.trim()}\n\n${finalPrompt}`;
    }

    return {
      prompt: finalPrompt,
      systemPrompt: this.defaultSystemPrompt,
    };
  }
}
