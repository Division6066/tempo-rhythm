export const consentPoints = [
  "connector_scope",
  "voice_permission",
  "trial_conversion",
  "refund_policy",
] as const;

export type ConsentPoint = (typeof consentPoints)[number];

export type ConsentCopy = {
  point: ConsentPoint;
  eyebrow: string;
  title: string;
  body: string;
  acknowledgment: string;
  buttonLabel: string;
};

export const consentCopy = {
  connector_scope: {
    point: "connector_scope",
    eyebrow: "Connector scope",
    title: "Connectors only use the scope you approve",
    body: "When you connect another tool, Tempo can only use the specific access listed for that connector. You can remove the connection later from Integrations.",
    acknowledgment: "I understand this connector uses only the scope shown here.",
    buttonLabel: "Acknowledge connector scope",
  },
  voice_permission: {
    point: "voice_permission",
    eyebrow: "Voice permission",
    title: "Voice starts only when you choose it",
    body: "Tempo asks before using your microphone. Voice input is used to turn what you say into Tempo actions or notes; you can stop or skip voice at any time.",
    acknowledgment: "I understand when voice input is used and that I can stop it.",
    buttonLabel: "Acknowledge voice use",
  },
  trial_conversion: {
    point: "trial_conversion",
    eyebrow: "Trial conversion",
    title: "Trial billing is only placeholder text right now",
    body: "This phase does not charge payments. Any trial-conversion copy you see is a stub so we can test the consent moment before real billing is connected.",
    acknowledgment: "I understand this trial conversion text is a no-charge placeholder.",
    buttonLabel: "Acknowledge trial note",
  },
  refund_policy: {
    point: "refund_policy",
    eyebrow: "Refund policy",
    title: "Refund copy is a placeholder this phase",
    body: "Refund language is shown as stub text while payments are not active. No payment or refund request is submitted from this consent step.",
    acknowledgment: "I understand refund text is a placeholder until payments are active.",
    buttonLabel: "Acknowledge refund note",
  },
} satisfies Record<ConsentPoint, ConsentCopy>;

export function getConsentCopy(point: ConsentPoint): ConsentCopy {
  const copy = consentCopy[point];
  if (!copy) {
    throw new Error("Unknown consent point.");
  }
  return copy;
}
