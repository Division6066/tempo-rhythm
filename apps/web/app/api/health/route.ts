function commitFromEnv(): string {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA;
  return sha ? sha.slice(0, 7) : "local";
}

export function GET(): Response {
  return Response.json({
    ok: true,
    service: "tempo-web",
    proof: "P-CLAUDE",
    commit: commitFromEnv(),
  });
}
