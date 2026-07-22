import { Injectable, Logger } from '@nestjs/common';
import { IPromptService, IPromptTemplate } from './prompt.interface';
import { BuildPromptOptions, FormattedPrompt, PromptTemplateType } from './prompt.types';
import { DefaultPromptTemplate } from './templates/default.prompt';
import { AssistantPromptTemplate } from './templates/assistant.prompt';

@Injectable()
export class PromptService implements IPromptService {
  private readonly logger = new Logger(PromptService.name);
  private readonly templates = new Map<PromptTemplateType, IPromptTemplate>();

  constructor() {
    this.registerTemplate(new DefaultPromptTemplate());
    this.registerTemplate(new AssistantPromptTemplate());
  }

  private registerTemplate(template: IPromptTemplate): void {
    this.templates.set(template.templateType as PromptTemplateType, template);
  }

  buildPrompt(options: BuildPromptOptions): FormattedPrompt {
    const templateType = options.templateType || 'assistant';
    const template = this.templates.get(templateType) || this.templates.get('default')!;

    this.logger.debug(
      `Building prompt using template [${templateType}], HasContext: ${Boolean(options.context)}, HistoryLength: ${options.history?.length ?? 0}`,
    );

    const formatted = template.format(options.userPrompt, options.context, options.history);

    if (options.systemPromptOverride && options.systemPromptOverride.trim().length > 0) {
      formatted.systemPrompt = options.systemPromptOverride.trim();
    }

    return formatted;
  }
}
