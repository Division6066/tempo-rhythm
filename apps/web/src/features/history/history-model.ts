export type HistoryMessageRole = "user" | "assistant" | "system";

export type HistoryMessage = {
  id: string;
  conversationId: string;
  role: HistoryMessageRole;
  content: string;
  createdAt: number;
};

export type HistoryConversation = {
  id: string;
  title: string;
  companionName: string;
  updatedAt: number;
  createdAt: number;
  messages: HistoryMessage[];
};

export type HistoryConversationSearchResult = HistoryConversation & {
  matchingMessageCount: number;
};

export function normalizeSearchQuery(query: string): string {
  return query.trim().toLocaleLowerCase();
}

export function filterHistoryConversations(
  conversations: HistoryConversation[],
  rawQuery: string,
): HistoryConversationSearchResult[] {
  const query = normalizeSearchQuery(rawQuery);

  return conversations.flatMap((conversation) => {
    if (!query) {
      return [{ ...conversation, matchingMessageCount: 0 }];
    }

    const titleMatches = conversation.title.toLocaleLowerCase().includes(query);
    const companionMatches = conversation.companionName.toLocaleLowerCase().includes(query);
    const matchingMessageCount = conversation.messages.reduce((count, message) => {
      return message.content.toLocaleLowerCase().includes(query) ? count + 1 : count;
    }, 0);

    if (titleMatches || companionMatches || matchingMessageCount > 0) {
      return [{ ...conversation, matchingMessageCount }];
    }

    return [];
  });
}

export function getConversationPreview(messages: HistoryMessage[]): string {
  const firstUserOrAssistantMessage = messages.find((message) => message.role !== "system");
  if (firstUserOrAssistantMessage) {
    return truncateText(firstUserOrAssistantMessage.content, 140);
  }

  return "No messages have been added to this thread yet.";
}

export function formatHistoryDate(timestamp: number): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

export function companionNameFromTechnique(technique: string | undefined): string {
  if (!technique) {
    return "Tempo companion";
  }

  return technique
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toLocaleUpperCase() + part.slice(1))
    .join(" ");
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 3).trimEnd()}...`;
}
