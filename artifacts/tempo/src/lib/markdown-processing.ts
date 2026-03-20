import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import remarkGfm from "remark-gfm";
import rehypeParse from "rehype-parse";
import rehypeStringify from "rehype-stringify";
import rehypeSanitize from "rehype-sanitize";
import type { Root as MdastRoot } from "mdast";
import type { Root as HastRoot } from "hast";

export const markdownProcessor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkStringify);

export const htmlProcessor = unified()
  .use(rehypeParse, { fragment: true })
  .use(rehypeSanitize)
  .use(rehypeStringify);

export async function parseMarkdown(markdown: string): Promise<MdastRoot> {
  const result = await markdownProcessor.parse(markdown);
  return result as MdastRoot;
}

export async function markdownToString(markdown: string): Promise<string> {
  const result = await markdownProcessor.process(markdown);
  return String(result);
}

export async function sanitizeHtml(html: string): Promise<string> {
  const result = await htmlProcessor.process(html);
  return String(result);
}
