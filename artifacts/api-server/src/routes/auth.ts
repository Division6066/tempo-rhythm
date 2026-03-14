import { Router, type IRouter } from "express";

const router: IRouter = Router();

const BETA_USERS = [
  { username: "admin1234567", password: "admin1234567", displayName: "Admin", email: "admin@tempo.app" },
  { username: "beta1", password: "beta1234567", displayName: "Sarah Chen", email: "sarah@tempo.app" },
  { username: "beta2", password: "beta1234567", displayName: "Alex Rivera", email: "alex@tempo.app" },
  { username: "beta3", password: "beta1234567", displayName: "Jordan Kim", email: "jordan@tempo.app" },
  { username: "beta4", password: "beta1234567", displayName: "Taylor Nguyen", email: "taylor@tempo.app" },
  { username: "beta5", password: "beta1234567", displayName: "Morgan Patel", email: "morgan@tempo.app" },
  { username: "beta6", password: "beta1234567", displayName: "Casey Brooks", email: "casey@tempo.app" },
  { username: "beta7", password: "beta1234567", displayName: "Riley Tanaka", email: "riley@tempo.app" },
  { username: "beta8", password: "beta1234567", displayName: "Jamie Osei", email: "jamie@tempo.app" },
  { username: "beta9", password: "beta1234567", displayName: "Drew Nakamura", email: "drew@tempo.app" },
  { username: "beta10", password: "beta1234567", displayName: "Quinn Torres", email: "quinn@tempo.app" },
];

function buildUserProfile(user: typeof BETA_USERS[0]) {
  return {
    username: user.username,
    displayName: user.displayName,
    email: user.email,
    role: user.username === "admin1234567" ? "admin" : "beta_tester",
    plan: "pro",
    planDetails: {
      name: "Pro",
      price: "$9/mo",
      features: [
        "Unlimited AI Planning",
        "Two-Way Calendar Sync",
        "Focus Analytics",
        "Voice Notes & Transcription",
        "Advanced Task Filters",
        "Custom Templates",
        "Priority Support",
      ],
      isBetaTester: true,
      trialEndsAt: null,
    },
  };
}

router.post("/auth/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const user = BETA_USERS.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    const profile = buildUserProfile(user);
    return res.json({
      success: true,
      user: profile,
      token: `tempo-session-${user.username}`,
    });
  }

  return res.status(401).json({ error: "Invalid username or password" });
});

router.get("/auth/me", (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace("Bearer ", "");

  if (token?.startsWith("tempo-session-")) {
    const username = token.replace("tempo-session-", "");
    const user = BETA_USERS.find((u) => u.username === username);

    if (user) {
      return res.json({
        authenticated: true,
        user: buildUserProfile(user),
      });
    }
  }

  return res.status(401).json({ authenticated: false, error: "Not authenticated" });
});

router.post("/auth/signup", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }

  const existing = BETA_USERS.find((u) => u.email === email);
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists" });
  }

  const username = email.split("@")[0] + Math.random().toString(36).slice(2, 8);
  const newUser = { username, password, displayName: name, email };
  BETA_USERS.push(newUser);

  const profile = buildUserProfile(newUser);
  return res.json({
    success: true,
    user: profile,
    token: `tempo-session-${username}`,
  });
});

router.post("/auth/onboarding", (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace("Bearer ", "");

  if (!token?.startsWith("tempo-session-")) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const username = token.replace("tempo-session-", "");
  const user = BETA_USERS.find((u) => u.username === username);

  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }

  const { challenge, focusTime, dailyTaskCount } = req.body;
  return res.json({
    success: true,
    preferences: { challenge, focusTime, dailyTaskCount },
  });
});

router.get("/auth/users", (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace("Bearer ", "");

  if (token !== "tempo-session-admin1234567") {
    return res.status(403).json({ error: "Admin access required" });
  }

  const users = BETA_USERS.map((u) => ({
    ...buildUserProfile(u),
    password: undefined,
  }));

  return res.json({ users });
});

export default router;
