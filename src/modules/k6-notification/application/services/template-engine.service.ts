import { Injectable } from '@nestjs/common';

@Injectable()
export class TemplateEngineService {
  /**
   * Renders a template string by replacing {{variable}} placeholders with values.
   * Performance target: < 50ms
   */
  render(template: string, variables: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    }
    return result;
  }
}
