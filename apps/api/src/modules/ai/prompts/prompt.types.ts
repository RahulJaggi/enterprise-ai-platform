export type PromptTemplateType = 'default' | 'assistant' | 'system';

export interface BuildPromptOptions {
  userPrompt: string;
  templateType?: PromptTemplateType;
  systemPromptOverride?: string;
  context?: string;
}

export interface FormattedPrompt {
  prompt: string;
  systemPrompt?: string;
}
