import { NextRequest, NextResponse } from "next/server";

const MAX_FILE_SIZE = 25 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Voice transcription is not configured. OPENAI_API_KEY is required." },
      { status: 503 }
    );
  }

  try {
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large. Maximum size is 25MB." }, { status: 413 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as Blob | null;
    if (!file) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large. Maximum size is 25MB." }, { status: 413 });
    }

    const whisperForm = new FormData();
    whisperForm.append("file", file, "recording.webm");
    whisperForm.append("model", "whisper-1");

    const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
    const res = await fetch(`${baseUrl}/audio/transcriptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: whisperForm,
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Transcription service error" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({ text: data.text || "" });
  } catch {
    return NextResponse.json(
      { error: "Transcription failed" },
      { status: 500 }
    );
  }
}
