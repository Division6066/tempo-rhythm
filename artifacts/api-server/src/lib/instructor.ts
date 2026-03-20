import Instructor from "@instructor-ai/instructor";
import OpenAI from "openai";
import { z } from "zod";

let instructorClient: ReturnType<typeof Instructor> | null = null;

export function getInstructorClient(): ReturnType<typeof Instructor> {
  if (instructorClient) return instructorClient;

  const apiKey = process.env["OPENAI_API_KEY"];
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is required for instructor-js");
  }

  const openai = new OpenAI({ apiKey });

  instructorClient = Instructor({
    client: openai,
    mode: "TOOLS",
  });

  return instructorClient;
}

export const TaskExtractionSchema = z.object({
  tasks: z.array(
    z.object({
      title: z.string().describe("The task title"),
      priority: z.enum(["high", "medium", "low"]).describe("Task priority"),
      estimatedMinutes: z.number().nullable().describe("Estimated time in minutes"),
      tags: z.array(z.string()).describe("Relevant tags"),
    })
  ),
});

export const EntityExtractionSchema = z.object({
  entities: z.array(
    z.object({
      name: z.string().describe("Entity name"),
      type: z.string().describe("Entity type (person, place, organization, etc)"),
      context: z.string().describe("Brief context about the entity"),
    })
  ),
});

export type TaskExtraction = z.infer<typeof TaskExtractionSchema>;
export type EntityExtraction = z.infer<typeof EntityExtractionSchema>;

export async function extractStructured<T extends z.AnyZodObject>(
  text: string,
  schema: T,
  systemPrompt: string = "Extract structured information from the text."
): Promise<z.infer<T>> {
  const client = getInstructorClient();

  const result = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: text },
    ],
    response_model: {
      schema,
      name: "extraction",
    },
  });

  return result;
}

export { z };
