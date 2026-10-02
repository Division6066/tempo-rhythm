export function GET() {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA;
  const commit = sha ? sha.slice(0, 7) : "local";

  return Response.json({
    ok: true,
    service: "tempo-web",
    proof: "P-CLAUDE",
    commit,
  });
}
