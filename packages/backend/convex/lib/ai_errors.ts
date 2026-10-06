export class AiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiError";
  }
}

export class AiAuthError extends AiError {
  constructor(message: string) {
    super(message);
    this.name = "AiAuthError";
  }
}

export class AiRateLimitedError extends AiError {
  retryAfterMs?: number;
  constructor(message: string, retryAfterMs?: number) {
    super(message);
    this.name = "AiRateLimitedError";
    this.retryAfterMs = retryAfterMs;
  }
}

export class AiContextTooLargeError extends AiError {
  constructor(message: string) {
    super(message);
    this.name = "AiContextTooLargeError";
  }
}

export class AiUpstreamError extends AiError {
  status: number;
  upstream: string;
  constructor(message: string, status: number, upstream: string) {
    super(message);
    this.name = "AiUpstreamError";
    this.status = status;
    this.upstream = upstream;
  }
}
