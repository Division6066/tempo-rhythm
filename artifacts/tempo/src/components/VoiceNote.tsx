import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";

interface VoiceNoteProps {
  onTranscription: (text: string) => void;
}

export function VoiceNote({ onTranscription }: VoiceNoteProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      console.error("Microphone access denied");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.webm");

      const baseUrl = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
      const res = await fetch(`${baseUrl}/api/transcribe`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        onTranscription(data.text || "[No transcription available]");
      } else {
        onTranscription("[Voice note recorded - transcription unavailable]");
      }
    } catch {
      onTranscription("[Voice note recorded - transcription error]");
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {isTranscribing ? (
        <Button variant="outline" size="sm" disabled className="gap-2">
          <Loader2 size={14} className="animate-spin" />
          Transcribing...
        </Button>
      ) : isRecording ? (
        <Button
          variant="outline"
          size="sm"
          onClick={stopRecording}
          className="gap-2 border-destructive text-destructive"
        >
          <Square size={14} />
          Stop
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={startRecording}
          className="gap-2"
        >
          <Mic size={14} />
          Voice
        </Button>
      )}
    </div>
  );
}
