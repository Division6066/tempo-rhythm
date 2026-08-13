import type { Metadata } from "next";
import { VoiceCaptureLab } from "@/components/voice/VoiceCaptureLab";

export const metadata: Metadata = {
  title: "Voice lab — Tempo Flow",
};

export default function VoiceLabPage() {
  return <VoiceCaptureLab />;
}
