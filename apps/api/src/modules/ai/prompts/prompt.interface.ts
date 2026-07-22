import { BuildPromptOptions, FormattedPrompt } from './prompt.types';

export interface IPromptTemplate {
  readonly templateType: string;
  readonly defaultSystemPrompt: string;
  format(userPrompt: string, context?: string): FormattedPrompt;
}

export interface IPromptService {
  buildPrompt(options: BuildPromptOptions): FormattedPrompt;
}
