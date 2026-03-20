import {
  Document,
  VectorStoreIndex,
  storageContextFromDefaults,
} from "llamaindex";

let indexInstance: VectorStoreIndex | null = null;

export async function getOrCreateIndex(): Promise<VectorStoreIndex> {
  if (indexInstance) return indexInstance;

  const storageContext = await storageContextFromDefaults({});
  indexInstance = await VectorStoreIndex.init({ storageContext });
  return indexInstance;
}

export async function ingestDocuments(
  texts: string[],
  metadata?: Record<string, string>[]
): Promise<VectorStoreIndex> {
  const documents = texts.map(
    (text, i) =>
      new Document({
        text,
        metadata: metadata?.[i] ?? {},
      })
  );

  const index = await VectorStoreIndex.fromDocuments(documents);
  indexInstance = index;
  return index;
}

export async function queryIndex(
  query: string,
  topK: number = 3
): Promise<string> {
  const index = await getOrCreateIndex();
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query({ query });
  return response.message.content as string;
}

export { Document, VectorStoreIndex };
