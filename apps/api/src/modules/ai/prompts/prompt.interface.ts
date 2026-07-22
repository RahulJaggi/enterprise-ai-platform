import { BuildPromptOptions, FormattedPrompt } from './prompt.types';
import { MemoryMessage } from '../memory/models/message';

export interface IPromptTemplate {
  readonly templateType: string;
  readonly defaultSystemPrompt: string;
  format(userPrompt: string, context?: string, history?: MemoryMessage[]): FormattedPrompt;
}

export interface IPromptService {
  buildPrompt(options: BuildPromptOptions): FormattedPrompt;
}
