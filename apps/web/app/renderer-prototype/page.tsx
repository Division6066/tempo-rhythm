import type { Metadata } from "next";
import { PageSpecPrototypeClient } from "@/components/page-spec/PageSpecPrototypeClient";

export const metadata: Metadata = {
  title: "JSON Renderer Prototype — Tempo Flow",
  description: "Prototype Markdown and JSON rendering for flexible Tempo page specs.",
};

export default function Page() {
  return <PageSpecPrototypeClient />;
}
