import { Router, type Request, type Response } from "express";
import multer from "multer";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }
  entry.count++;
  return true;
}

router.post("/transcribe", upload.single("file"), async (req: Request, res: Response) => {
  try {
    const clientIp = req.ip || req.socket.remoteAddress || "unknown";
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({ error: "Too many requests. Please try again later." });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    if (req.file.size > 10 * 1024 * 1024) {
      return res.status(413).json({ error: "File too large. Maximum 10MB." });
    }

    const { ensureCompatibleFormat, speechToText } = await import(
      "@workspace/integrations-openai-ai-server/audio"
    );

    const { buffer, format } = await ensureCompatibleFormat(req.file.buffer);
    const text = await speechToText(buffer, format);

    return res.json({ text });
  } catch (error) {
    console.error("Transcription error:", error);
    return res.status(500).json({ error: "Transcription failed" });
  }
});

export default router;
