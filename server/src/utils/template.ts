import fs          from 'fs';
import path        from 'path';
import { fileURLToPath } from 'url';
import Handlebars  from 'handlebars';
import { env }     from '../config/env.js';

const TEMPLATES_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '../templates');

const readTemplate = (filename: string): string =>
  fs.readFileSync(path.join(TEMPLATES_DIR, filename), 'utf8');

const baseLayout = readTemplate('layouts/base.html');
const baseTemplate = Handlebars.compile(baseLayout);

export const renderTemplate = (
  templateName: string,
  variables:    Record<string, unknown>
): string => {
  const templateContent = readTemplate(templateName);
  const contentTemplate = Handlebars.compile(templateContent);

  // Render inner content first
  const content = contentTemplate({ ...variables });

  // Inject into base layout
  return baseTemplate({
    content,
    appName: env.APP_NAME,
    year:    new Date().getFullYear(),
    ...variables,
  });
};