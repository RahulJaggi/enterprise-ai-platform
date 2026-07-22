import { MemoryMessage } from '../memory/models/message';

export type PromptTemplateType = 'default' | 'assistant' | 'system';

export interface BuildPromptOptions {
  userPrompt: string;
  templateType?: PromptTemplateType;
  systemPromptOverride?: string;
  context?: string;
  history?: MemoryMessage[];
}

export interface FormattedPrompt {
  prompt: string;
  systemPrompt?: string;
}
