export type ConversationStarter = {
  id: string;
  label: string;
  message: string;
  helper: string;
};

export const conversationStarters: ConversationStarter[] = [
  {
    id: "tiny-next-step",
    label: "Find one tiny next step",
    message:
      "I am here, and I want help choosing one gentle next step. Please keep it small.",
    helper: "Best when everything feels too wide or noisy.",
  },
  {
    id: "body-check",
    label: "Do a quick body check",
    message:
      "Can you help me check what my body might need before I plan anything?",
    helper: "A soft reset before decisions.",
  },
  {
    id: "name-the-pile",
    label: "Name the pile",
    message:
      "I have a mixed pile in my head. Help me name what is in it without judging it.",
    helper: "Good for brain-dump energy.",
  },
];
