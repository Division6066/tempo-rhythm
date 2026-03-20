import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";

const router: IRouter = Router();

function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace("Bearer ", "");
  if (!token || !token.startsWith("tempo-session-")) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  next();
}

const recentRequests = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

function rateLimit(req: Request, res: Response, next: NextFunction): void {
  const key = req.ip || "unknown";
  const now = Date.now();
  const timestamps = (recentRequests.get(key) || []).filter(t => now - t < RATE_LIMIT_WINDOW_MS);

  if (timestamps.length >= RATE_LIMIT_MAX) {
    res.status(429).json({ error: "Too many TTS requests. Please try again later." });
    return;
  }

  timestamps.push(now);
  recentRequests.set(key, timestamps);
  next();
}

router.post("/tts", requireAuth, rateLimit, async (req, res): Promise<void> => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string") {
      res.status(400).json({ error: "text is required" });
      return;
    }

    const truncated = text.slice(0, 4000);
    const { textToSpeech } = await import("@workspace/integrations-openai-ai-server/audio");
    const { audio, contentType } = await textToSpeech(truncated);

    const audioBuffer = Buffer.from(audio, "base64");
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", audioBuffer.length);
    res.send(audioBuffer);
  } catch (err: unknown) {
    console.error("TTS error:", err);
    res.status(500).json({ error: "Failed to generate speech" });
  }
});

export default router;
