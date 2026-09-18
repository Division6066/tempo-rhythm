export async function POST(request: Request) {
  const authorization = request.headers.get("authorization");
  const body = (await request.json().catch(() => null)) as {
    messages?: Array<{ content?: string; role?: string }>;
  } | null;

  if (!authorization?.startsWith("Bearer ")) {
    return Response.json({ error: "Missing provider authorization header." }, { status: 401 });
  }

  const prompt = body?.messages?.[0]?.content?.trim();

  return Response.json({
    choices: [
      {
        message: {
          content: prompt
            ? "Mock provider heard the saved key."
            : "Mock provider received the saved key.",
        },
      },
    ],
  });
}
