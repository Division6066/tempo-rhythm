/** Fixed bounds for untrusted, in-memory history normalization. */
export const MAX_HISTORY_IMPORT_BYTES = 10 * 1024 * 1024;
export const MAX_HISTORY_CONVERSATIONS = 1000;
export const MAX_HISTORY_MESSAGES = 20000;
export const MAX_HISTORY_RECORDS = 300;
export const MAX_HISTORY_CONTENT_CHARS = 1000;
export const MAX_HISTORY_SOURCE_ID_CHARS = 128;

export type HistoryImportProvider = "chatgpt" | "claude";
export type HistoryImportRecord = {
  candidateId: string;
  provider: HistoryImportProvider;
  sourceConversationId: string;
  sourceMessageId: string;
  role: "user" | "assistant";
  content: string;
  occurredAtMs?: number;
  dateStatus: "valid" | "missing" | "invalid";
  contentTruncated: boolean;
};
export type HistoryImportCoverage = {
  conversations: number;
  scannedMessages: number;
  retainedRecords: number;
  omittedNonText: number;
  omittedRoles: number;
  omittedEmpty: number;
  omittedOverLimit: number;
  truncatedRecords: number;
  invalidDates: number;
  duplicateRecords: number;
};
export type HistoryImportResult =
  | {
      status: "rejected";
      code:
        | "empty"
        | "too_large"
        | "invalid_json"
        | "unsupported_shape"
        | "too_many_conversations"
        | "too_many_messages"
        | "invalid_identity"
        | "conflicting_identity";
      message: string;
    }
  | {
      status: "parsed";
      format: "chatgpt-mapping-v1" | "claude-chat-messages-v1";
      records: HistoryImportRecord[];
      coverage: HistoryImportCoverage;
      incomplete: boolean;
    };

type ObjectValue = Record<string, unknown>;
type SourceDate = Pick<HistoryImportRecord, "occurredAtMs" | "dateStatus">;
const MAX_DATE_MS = 8_640_000_000_000_000;
const isObject = (value: unknown): value is ObjectValue =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const own = (value: unknown, key: string): unknown =>
  isObject(value) && Object.hasOwn(value, key) ? value[key] : undefined;
const normalize = (text: string): string => text.replace(/\r\n/g, "\n").trim();
const compare = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

function reject(
  code: Extract<HistoryImportResult, { status: "rejected" }>["code"]
): HistoryImportResult {
  // Never interpolate input or JSON.parse exceptions into user-visible errors.
  return {
    status: "rejected",
    code,
    message: "This history could not be normalized. Check its format and limits.",
  };
}

function exceedsByteLimit(text: string): boolean {
  let bytes = 0;
  // for-of combines surrogate pairs; isolated surrogates use the U+FFFD byte width.
  for (const char of text) {
    const point = char.codePointAt(0)!;
    bytes += point <= 0x7f ? 1 : point <= 0x7ff ? 2 : point <= 0xffff ? 3 : 4;
    if (bytes > MAX_HISTORY_IMPORT_BYTES) return true;
  }
  return false;
}

function validId(value: unknown): value is string {
  if (typeof value !== "string" || value.trim().length === 0) return false;
  let length = 0;
  for (const char of value) {
    const point = char.codePointAt(0)!;
    if (point <= 31 || (point >= 127 && point <= 159)) return false;
    if (++length > MAX_HISTORY_SOURCE_ID_CHARS) return false;
  }
  return true;
}

// Iterative canonical encoding avoids recursive serialization of malformed dates/roles.
// Only JSON values and our scalar fields enter this transient comparison; nothing escapes.
function identityFingerprint(value: unknown): string {
  const pending: ({ value: unknown } | { token: string })[] = [{ value }];
  const tokens: string[] = [];
  while (pending.length > 0) {
    const frame = pending.pop()!;
    if ("token" in frame) {
      tokens.push(frame.token);
      continue;
    }
    const current = frame.value;
    if (Array.isArray(current)) {
      tokens.push("[");
      pending.push({ token: "]" });
      for (let i = current.length - 1; i >= 0; i--) pending.push({ value: current[i] });
    } else if (isObject(current)) {
      tokens.push("{");
      pending.push({ token: "}" });
      const keys = Object.keys(current).sort(compare);
      for (let i = keys.length - 1; i >= 0; i--) {
        const key = keys[i]!;
        pending.push({ value: current[key] }, { token: `${JSON.stringify(key)}:` });
      }
    } else {
      tokens.push(`${typeof current}:${JSON.stringify(current)};`);
      // JSON encodes both infinities as null; preserve their distinct source values.
      if (typeof current === "number" && !Number.isFinite(current)) tokens.push(String(current));
    }
  }
  return tokens.join("");
}

function sourceDate(value: unknown, provider: HistoryImportProvider): SourceDate {
  if (value === null || value === undefined) return { dateStatus: "missing" };
  const invalid: SourceDate = { dateStatus: "invalid" };
  if (provider === "chatgpt") {
    if (typeof value !== "number" || !Number.isFinite(value)) return invalid;
    const ms = value * 1000;
    return Number.isFinite(ms) && Math.abs(ms) <= MAX_DATE_MS
      ? { dateStatus: "valid", occurredAtMs: ms }
      : invalid;
  }
  if (typeof value !== "string") return invalid;
  const match =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!match) return invalid;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);
  const zone = match[8]!;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > days[month - 1]! ||
    hour > 23 ||
    minute > 59 ||
    second > 59
  )
    return invalid;
  if (zone !== "Z" && (Number(zone.slice(1, 3)) > 23 || Number(zone.slice(4)) > 59)) return invalid;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? { dateStatus: "valid", occurredAtMs: ms } : invalid;
}

/**
 * RAM-ONLY: normalize source text for review. All content is untrusted data;
 * this inactive utility neither extracts facts nor saves or executes anything.
 * Counts refer to scanned occurrences; duplicateRecords counts repeated IDs.
 * omittedNonText counts non-text parts/attachments (or a non-text message body).
 * Truncation and over-limit counts refer to unique, canonically ordered records.
 */
export function parseHistoryImport(
  text: string,
  provider: HistoryImportProvider
): HistoryImportResult {
  if (exceedsByteLimit(text)) return reject("too_large");
  if (text.trim().length === 0) return reject("empty");
  let root: unknown;
  try {
    root = JSON.parse(text);
  } catch {
    return reject("invalid_json");
  }
  if (!Array.isArray(root) || (provider !== "chatgpt" && provider !== "claude"))
    return reject("unsupported_shape");
  if (root.length > MAX_HISTORY_CONVERSATIONS) return reject("too_many_conversations");
  const coverage: HistoryImportCoverage = {
    conversations: root.length,
    scannedMessages: 0,
    retainedRecords: 0,
    omittedNonText: 0,
    omittedRoles: 0,
    omittedEmpty: 0,
    omittedOverLimit: 0,
    truncatedRecords: 0,
    invalidDates: 0,
    duplicateRecords: 0,
  };
  const conversations: { id: string; nodes: [string, unknown][] }[] = [];
  // Check the entire scan budget before normalizing any messages.
  for (const conversation of root) {
    const container = own(conversation, provider === "chatgpt" ? "mapping" : "chat_messages");
    if (provider === "chatgpt" ? !isObject(container) : !Array.isArray(container))
      return reject("unsupported_shape");
    const firstId = own(conversation, provider === "chatgpt" ? "id" : "uuid");
    const secondId = provider === "chatgpt" ? own(conversation, "conversation_id") : undefined;
    if (
      (firstId !== undefined && !validId(firstId)) ||
      (secondId !== undefined && !validId(secondId))
    )
      return reject("invalid_identity");
    if (firstId !== undefined && secondId !== undefined && firstId !== secondId)
      return reject("conflicting_identity");
    const id = firstId ?? secondId;
    if (!validId(id)) return reject("invalid_identity");
    const nodes = Object.entries(container as ObjectValue);
    coverage.scannedMessages += nodes.length;
    if (coverage.scannedMessages > MAX_HISTORY_MESSAGES) return reject("too_many_messages");
    conversations.push({ id, nodes });
  }
  const identities = new Map<string, string>();
  const records: HistoryImportRecord[] = [];
  for (const conversation of conversations) {
    for (const [key, node] of conversation.nodes) {
      const message = provider === "chatgpt" ? own(node, "message") : node;
      if (provider === "chatgpt" && (message === null || message === undefined)) continue;
      if (!isObject(message)) return reject("unsupported_shape");
      const messageId =
        provider === "chatgpt" && !Object.hasOwn(message, "id")
          ? key
          : own(message, provider === "chatgpt" ? "id" : "uuid");
      if (!validId(messageId)) return reject("invalid_identity");
      const sourceRole =
        provider === "chatgpt" ? own(own(message, "author"), "role") : own(message, "sender");
      const role =
        provider === "claude"
          ? sourceRole === "human"
            ? "user"
            : sourceRole === "assistant"
              ? "assistant"
              : undefined
          : sourceRole;
      const dateValue = own(message, provider === "chatgpt" ? "create_time" : "created_at");
      const date = sourceDate(dateValue, provider);
      let content = "";
      let nonText = 0;
      if (provider === "chatgpt") {
        const body = own(message, "content");
        const parts = own(body, "parts");
        if (own(body, "content_type") === "text" && Array.isArray(parts)) {
          const strings: string[] = [];
          for (const part of parts) {
            if (typeof part === "string") strings.push(part);
            else nonText++;
          }
          content = strings.join("\n");
        } else nonText++;
      } else {
        const plainText = own(message, "text");
        const parts = own(message, "content");
        const strings: string[] = [];
        if (Array.isArray(parts)) {
          for (const part of parts) {
            const partText = own(part, "text");
            if (own(part, "type") === "text" && typeof partText === "string")
              strings.push(partText);
            else nonText++;
          }
        } else if (parts !== undefined && parts !== null) nonText++;
        content =
          typeof plainText === "string" && normalize(plainText) !== ""
            ? plainText
            : strings.join("\n");
        const attachments = own(message, "attachments");
        if (Array.isArray(attachments)) nonText += attachments.length;
        else if (attachments !== undefined && attachments !== null) nonText++;
      }
      content = normalize(content);
      const candidateId = JSON.stringify(["history-v1", provider, conversation.id, messageId]);
      // Compare complete normalized text before truncation/selection, including omitted roles.
      // Invalid source dates retain their value only inside this temporary conflict check.
      const fingerprint = identityFingerprint([
        sourceRole,
        content,
        date.dateStatus,
        date.occurredAtMs,
        date.dateStatus === "invalid" ? dateValue : null,
      ]);
      const previous = identities.get(candidateId);
      if (previous !== undefined && previous !== fingerprint) return reject("conflicting_identity");
      coverage.omittedNonText += nonText;
      if (date.dateStatus === "invalid") coverage.invalidDates++;
      if (role !== "user" && role !== "assistant") coverage.omittedRoles++;
      else if (content === "") coverage.omittedEmpty++;
      if (previous !== undefined) {
        coverage.duplicateRecords++;
        continue;
      }
      identities.set(candidateId, fingerprint);
      if ((role !== "user" && role !== "assistant") || content === "") continue;
      records.push({
        candidateId,
        provider,
        sourceConversationId: conversation.id,
        sourceMessageId: messageId,
        role,
        content,
        ...date,
        contentTruncated: false,
      });
    }
  }
  records.sort(
    (a, b) =>
      compare(a.sourceConversationId, b.sourceConversationId) ||
      compare(a.sourceMessageId, b.sourceMessageId)
  );
  coverage.omittedOverLimit = Math.max(0, records.length - MAX_HISTORY_RECORDS);
  const retained = records.slice(0, MAX_HISTORY_RECORDS);
  for (const record of retained) {
    const points = Array.from(record.content);
    if (points.length > MAX_HISTORY_CONTENT_CHARS) {
      record.content = points.slice(0, MAX_HISTORY_CONTENT_CHARS).join("");
      record.contentTruncated = true;
      coverage.truncatedRecords++;
    }
  }
  coverage.retainedRecords = retained.length;
  return {
    status: "parsed",
    format: provider === "chatgpt" ? "chatgpt-mapping-v1" : "claude-chat-messages-v1",
    records: retained,
    coverage,
    incomplete:
      coverage.omittedNonText +
        coverage.omittedRoles +
        coverage.omittedEmpty +
        coverage.omittedOverLimit +
        coverage.truncatedRecords +
        coverage.invalidDates +
        coverage.duplicateRecords >
      0,
  };
}
