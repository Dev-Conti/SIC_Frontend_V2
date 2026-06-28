import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src/docs/index.md');
const content = fs.readFileSync(filePath, 'utf8');

const DocumentationPage = () => (
  <div>
    <h1>Documentação do Projeto SIC-Conti V2</h1>
    <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
  </div>
);

export default DocumentationPage;
