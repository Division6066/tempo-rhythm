import { Router, type IRouter } from "express";
import { splitText } from "../lib/langchain";
import { Document } from "llamaindex";

const router: IRouter = Router();

router.get("/lib-status", async (_req, res): Promise<void> => {
  if (process.env["NODE_ENV"] === "production") {
    res.status(404).json({ error: "Not available in production" });
    return;
  }
  const status: Record<string, { available: boolean; test?: string }> = {};

  try {
    const chunks = await splitText("Hello world. This is a test of the text splitter.");
    status.langchain = { available: true, test: `Split into ${chunks.length} chunk(s)` };
  } catch (e) {
    status.langchain = { available: false, test: String(e) };
  }

  try {
    const doc = new Document({ text: "test document", metadata: { source: "test" } });
    status.llamaindex = { available: true, test: `Document created: ${doc.text.length} chars` };
  } catch (e) {
    status.llamaindex = { available: false, test: String(e) };
  }

  try {
    const { getInstructorClient } = await import("../lib/instructor");
    const client = getInstructorClient();
    status.instructor = { available: true, test: `Client initialized: ${!!client}` };
  } catch (e) {
    status.instructor = { available: false, test: String(e) };
  }

  try {
    const bullmq = await import("../lib/bullmq");
    status.bullmq = { available: true, test: `Queue factory available, worker factory available` };
  } catch (e) {
    status.bullmq = { available: false, test: String(e) };
  }

  res.json(status);
});

export default router;
