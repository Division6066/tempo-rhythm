import { Router, type Request, type Response } from "express";

const router = Router();

router.post("/voice/tts", async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace("Bearer ", "");
  if (!token || !token.startsWith("tempo-session-")) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const { text } = req.body;
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return res.status(400).json({ error: "Text is required" });
  }

  if (text.length > 5000) {
    return res.status(400).json({ error: "Text too long (max 5000 characters)" });
  }

  try {
    const { textToSpeech } = await import(
      "@workspace/integrations-openai-ai-server/audio"
    );

    const audioBuffer = await textToSpeech(text, "alloy", "mp3");

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": String(audioBuffer.length),
    });
    return res.send(audioBuffer);
  } catch (error) {
    console.error("TTS error:", error);
    return res.status(500).json({ error: "Text-to-speech failed" });
  }
});

export default router;
