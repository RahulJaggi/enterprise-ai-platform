import { IPromptTemplate } from '../prompt.interface';
import { FormattedPrompt } from '../prompt.types';
import { DEFAULT_ENTERPRISE_SYSTEM_PROMPT } from './system.prompt';

export class DefaultPromptTemplate implements IPromptTemplate {
  readonly templateType = 'default';
  readonly defaultSystemPrompt = DEFAULT_ENTERPRISE_SYSTEM_PROMPT;

  format(userPrompt: string, context?: string): FormattedPrompt {
    let finalPrompt = userPrompt;
    if (context && context.trim().length > 0) {
      finalPrompt = `Context:\n${context.trim()}\n\nQuestion:\n${userPrompt}`;
    }

    return {
      prompt: finalPrompt,
      systemPrompt: this.defaultSystemPrompt,
    };
  }
}
