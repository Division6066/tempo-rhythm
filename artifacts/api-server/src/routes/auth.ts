import { Router, type IRouter } from "express";

const router: IRouter = Router();

const ADMIN_USER = {
  username: "admin",
  password: "admin1234567",
};

router.post("/auth/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  if (username === ADMIN_USER.username && password === ADMIN_USER.password) {
    return res.json({
      success: true,
      user: { username: ADMIN_USER.username, role: "admin" },
      token: "tempo-admin-session",
    });
  }

  return res.status(401).json({ error: "Invalid username or password" });
});

router.get("/auth/me", (req, res) => {
  const authHeader = req.headers.authorization;

  if (authHeader === "Bearer tempo-admin-session") {
    return res.json({
      authenticated: true,
      user: { username: ADMIN_USER.username, role: "admin" },
    });
  }

  return res.status(401).json({ authenticated: false, error: "Not authenticated" });
});

export default router;
