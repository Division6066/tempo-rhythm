import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { PushNotificationService } from "../services/pushNotification";

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

function getUserId(req: Request): string {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace("Bearer ", "") || "";
  return token;
}

router.get("/push/vapid-key", (_req, res): void => {
  const key = PushNotificationService.getVapidPublicKey();
  res.json({ vapidPublicKey: key });
});

router.post("/push/subscribe", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const { endpoint, keys } = req.body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      res.status(400).json({ error: "Invalid subscription data" });
      return;
    }

    const subscription = await PushNotificationService.subscribeWeb(userId, {
      endpoint,
      keys: { p256dh: keys.p256dh, auth: keys.auth },
    });

    res.json({ success: true, id: subscription.id });
  } catch (err) {
    console.error("[Push] Subscribe error:", err);
    res.status(500).json({ error: "Failed to subscribe" });
  }
});

router.post("/push/subscribe-expo", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const { expoToken } = req.body;

    if (!expoToken) {
      res.status(400).json({ error: "Expo token required" });
      return;
    }

    const subscription = await PushNotificationService.subscribeExpo(userId, expoToken);
    res.json({ success: true, id: subscription.id });
  } catch (err) {
    console.error("[Push] Expo subscribe error:", err);
    res.status(500).json({ error: "Failed to subscribe" });
  }
});

router.post("/push/unsubscribe", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const { endpoint, expoToken } = req.body;

    await PushNotificationService.unsubscribe(userId, endpoint, expoToken);
    res.json({ success: true });
  } catch (err) {
    console.error("[Push] Unsubscribe error:", err);
    res.status(500).json({ error: "Failed to unsubscribe" });
  }
});

export default router;
