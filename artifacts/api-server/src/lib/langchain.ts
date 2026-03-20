import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence, RunnableLambda } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

export const defaultTextSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
  separators: ["\n\n", "\n", ". ", " ", ""],
});

export async function splitText(text: string): Promise<Document[]> {
  return defaultTextSplitter.createDocuments([text]);
}

export async function splitDocuments(
  texts: string[],
  metadatas?: Record<string, string>[]
): Promise<Document[]> {
  return defaultTextSplitter.createDocuments(texts, metadatas);
}

export const summarizeTemplate = PromptTemplate.fromTemplate(
  "Summarize the following text concisely:\n\n{text}\n\nSummary:"
);

export const extractTemplate = PromptTemplate.fromTemplate(
  "Extract key information from the following text:\n\n{text}\n\nKey information:"
);

export function createPromptChain(template: PromptTemplate) {
  return RunnableSequence.from([template, new StringOutputParser()]);
}

export const splitAndChunkChain = RunnableLambda.from(async (input: { text: string }) => {
  const docs = await splitText(input.text);
  return {
    chunks: docs.map((d) => d.pageContent),
    count: docs.length,
    metadata: docs.map((d) => d.metadata),
  };
});

export { Document, PromptTemplate, RunnableSequence, RunnableLambda, StringOutputParser };
