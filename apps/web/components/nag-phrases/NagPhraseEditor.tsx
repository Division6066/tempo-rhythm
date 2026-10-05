"use client";

import { useAction, useConvexAuth, useMutation, useQuery } from "convex/react";
import { useId, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { splitByStatus, validatePhraseText } from "./phraseInput";

const SAVE_ERROR = "That didn't save. Try again?";
const SUGGEST_ERROR = "Suggestions didn't come through. Try again?";
const EMPTY_SUGGEST = "Add a phrase of your own first so suggestions can come from your words.";

type DraftSuggestion = { key: string; text: string };

function errorText(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return fallback;
}

function PhraseLine({ text }: { text: string }) {
  return <li className="text-sm text-foreground">{text}</li>;
}

function ChoiceRow({
  text,
  busy,
  onAccept,
  onReject,
}: {
  text: string;
  busy: boolean;
  onAccept: () => void;
  onReject: () => void;
}) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-2">
      <span className="text-sm text-foreground">{text}</span>
      <span className="flex gap-2">
        <Button type="button" size="sm" onClick={onAccept} disabled={busy}>
          Accept
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onReject} disabled={busy}>
          Reject
        </Button>
      </span>
    </li>
  );
}

export function NagPhraseEditor({ nagId }: { nagId: Id<"nags"> }) {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const nags = useQuery(api.nags.list, isAuthenticated ? {} : "skip");
  const addPhrase = useMutation(api.nags.addPhrase);
  const decidePhrase = useMutation(api.nags.decidePhrase);
  const proposePhrases = useAction(api.nags.proposePhrases);

  const inputId = useId();
  const errorId = useId();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<DraftSuggestion[]>([]);
  const [didSuggest, setDidSuggest] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const keyRef = useRef(0);
  const lock = useRef(false);

  const nag = nags?.find((row) => row._id === nagId);
  const grouped = splitByStatus(nag?.phrases ?? []);
  const hasOwnWords = grouped.accepted.some((phrase) => phrase.source === "user");
  const showEmptySuggest = suggestions.length === 0 && (!hasOwnWords || didSuggest);
  const busy = busyKey !== null;

  async function runLocked(key: string, fallback: string, work: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true;
    setBusyKey(key);
    setError(null);
    try {
      await work();
    } catch (err) {
      setError(errorText(err, fallback));
    } finally {
      lock.current = false;
      setBusyKey(null);
    }
  }

  function onDraftSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const check = validatePhraseText(draft);
    if (!check.ok) {
      setError(check.message);
      return;
    }
    const text = check.text;
    void runLocked("add-own", SAVE_ERROR, async () => {
      await addPhrase({ nagId, text, source: "user" });
      setDraft("");
    });
  }

  function onSuggest() {
    void runLocked("suggest", SUGGEST_ERROR, async () => {
      const result = await proposePhrases({ nagId });
      setDidSuggest(true);
      setSuggestions(
        result.proposals.map((text) => {
          keyRef.current += 1;
          return { key: `suggest-${keyRef.current}`, text };
        }),
      );
    });
  }

  function onAcceptSuggestion(item: DraftSuggestion) {
    void runLocked(item.key, SAVE_ERROR, async () => {
      const { phraseId } = await addPhrase({ nagId, text: item.text, source: "derived" });
      setSuggestions((prev) => prev.filter((row) => row.key !== item.key));
      await decidePhrase({ nagId, phraseId, decision: "accept" });
    });
  }

  function onRejectSuggestion(item: DraftSuggestion) {
    setSuggestions((prev) => prev.filter((row) => row.key !== item.key));
    setError(null);
  }

  function onDecideSaved(phraseId: string, decision: "accept" | "reject") {
    void runLocked(phraseId, SAVE_ERROR, async () => {
      await decidePhrase({ nagId, phraseId, decision });
    });
  }

  if (authLoading || (isAuthenticated && nags === undefined)) {
    return (
      <section aria-busy="true" aria-labelledby="nag-phrases-heading" className="max-w-xl">
        <h2 id="nag-phrases-heading" className="font-heading text-xl font-semibold text-foreground">
          Phrases
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">Loading this nag.</p>
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <section aria-labelledby="nag-phrases-heading" className="max-w-xl">
        <h2 id="nag-phrases-heading" className="font-heading text-xl font-semibold text-foreground">
          Phrases
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to write phrases for this nag.</p>
      </section>
    );
  }

  if (!nag) {
    return (
      <section aria-labelledby="nag-phrases-heading" className="max-w-xl">
        <h2 id="nag-phrases-heading" className="font-heading text-xl font-semibold text-foreground">
          Phrases
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">This nag isn't on your list.</p>
      </section>
    );
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>
          <h2 id="nag-phrases-heading" className="font-semibold text-2xl leading-none tracking-tight">
            {nag.label}
          </h2>
        </CardTitle>
        <CardDescription>
          Phrases are your own words. A suggestion is saved only after you accept it.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <form className="flex flex-col gap-3" onSubmit={onDraftSubmit}>
          <Label htmlFor={inputId}>Your words</Label>
          <Input
            id={inputId}
            name="phrase"
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              setError(null);
            }}
            placeholder="In your own words"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            disabled={busy}
            autoComplete="off"
          />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={busy}>
              Add phrase
            </Button>
            <Button type="button" variant="outline" onClick={onSuggest} disabled={busy}>
              Suggest from my words
            </Button>
          </div>
          {error ? (
            <p id={errorId} role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </form>

        <section aria-labelledby="nag-suggested-heading" className="flex flex-col gap-2">
          <h3 id="nag-suggested-heading" className="font-medium text-sm text-foreground">
            Suggested
          </h3>
          {showEmptySuggest ? (
            <p className="text-sm text-muted-foreground">{EMPTY_SUGGEST}</p>
          ) : null}
          {suggestions.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {suggestions.map((item) => (
                <ChoiceRow
                  key={item.key}
                  text={item.text}
                  busy={busy}
                  onAccept={() => onAcceptSuggestion(item)}
                  onReject={() => onRejectSuggestion(item)}
                />
              ))}
            </ul>
          ) : null}
        </section>

        <section aria-labelledby="nag-accepted-heading" className="flex flex-col gap-2">
          <h3 id="nag-accepted-heading" className="font-medium text-sm text-foreground">
            Accepted
          </h3>
          {grouped.accepted.length > 0 ? (
            <ul className="flex flex-col gap-1">
              {grouped.accepted.map((phrase) => (
                <PhraseLine key={phrase.id} text={phrase.text} />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">None yet.</p>
          )}
        </section>

        <section aria-labelledby="nag-proposed-heading" className="flex flex-col gap-2">
          <h3 id="nag-proposed-heading" className="font-medium text-sm text-foreground">
            Proposed
          </h3>
          {grouped.proposed.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {grouped.proposed.map((phrase) => (
                <ChoiceRow
                  key={phrase.id}
                  text={phrase.text}
                  busy={busy}
                  onAccept={() => onDecideSaved(phrase.id, "accept")}
                  onReject={() => onDecideSaved(phrase.id, "reject")}
                />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">None yet.</p>
          )}
        </section>

        <details className="text-sm">
          <summary id="nag-rejected-heading" className="cursor-pointer font-medium text-foreground">
            Rejected
          </summary>
          {grouped.rejected.length > 0 ? (
            <ul className="mt-2 flex flex-col gap-1">
              {grouped.rejected.map((phrase) => (
                <PhraseLine key={phrase.id} text={phrase.text} />
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-muted-foreground">None yet.</p>
          )}
        </details>
      </CardContent>
    </Card>
  );
}
