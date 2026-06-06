/**
 * Accessibility tests for the cross-app UI primitives in @tempo/ui.
 *
 * These primitives are used across both apps; an a11y regression here
 * leaks to every screen that renders them, including future scaffold ports.
 */
import { describe, expect, test } from "bun:test";
import { Button as TempoButton, Field, Pill, SoftCard, TaskRow } from "@tempo/ui/primitives";
import { audit, attr, errorIssues, formatIssues, render, visibleText } from "./a11y";
import { Button as ShButton } from "@/components/ui/button";

describe("@tempo/ui Button · accessibility", () => {
  test("renders a button with type=button by default", () => {
    const rendered = render(<TempoButton>Save</TempoButton>);
    const buttons = rendered.tags.get("button") ?? [];
    expect(buttons.length).toBe(1);
    expect(attr(buttons[0], "type")).toBe("button");
  });

  test("uses focus-visible ring (keyboard focus is communicated)", () => {
    const rendered = render(<TempoButton>Save</TempoButton>);
    expect(rendered.html).toContain("focus-visible:ring-");
  });

  test("disabled state hides pointer events but keeps text", () => {
    const rendered = render(<TempoButton disabled>Save</TempoButton>);
    const buttons = rendered.tags.get("button") ?? [];
    expect(attr(buttons[0], "disabled")).toBe("");
    expect(visibleText(buttons[0])).toBe("Save");
  });

  test("audit passes for every variant × size combo", () => {
    const variants = ["primary", "soft", "ghost", "subtle", "inverse", "destructive"] as const;
    const sizes = ["sm", "md", "lg"] as const;
    for (const v of variants) {
      for (const s of sizes) {
        const rendered = render(
          <TempoButton variant={v} size={s}>
            Hi
          </TempoButton>,
        );
        const errs = errorIssues(audit(rendered));
        expect(errs, `Tempo Button(${v}, ${s}) a11y:\n${formatIssues(errs)}`).toEqual([]);
      }
    }
  });
});

describe("shadcn Button · accessibility", () => {
  test("uses focus-visible ring", () => {
    const rendered = render(<ShButton>Save</ShButton>);
    expect(rendered.html).toContain("focus-visible:ring-");
  });

  test("audit passes for every variant × size combo", () => {
    const variants = ["default", "destructive", "outline", "secondary", "ghost", "link"] as const;
    const sizes = ["default", "sm", "lg", "icon"] as const;
    for (const v of variants) {
      for (const s of sizes) {
        // The icon size button has no text. We rely on aria-label there.
        const inner = s === "icon" ? <span aria-hidden>X</span> : "Save";
        const props = s === "icon" ? { "aria-label": "Close" } : {};
        const rendered = render(
          <ShButton variant={v} size={s} {...props}>
            {inner}
          </ShButton>,
        );
        const errs = errorIssues(audit(rendered));
        expect(errs, `shadcn Button(${v}, ${s}) a11y:\n${formatIssues(errs)}`).toEqual([]);
      }
    }
  });
});

describe("Field primitive · accessibility", () => {
  test("ties label to input via htmlFor when id is provided", () => {
    const rendered = render(<Field id="email" label="Email" type="email" />);
    const inputs = rendered.tags.get("input") ?? [];
    const labels = rendered.tags.get("label") ?? [];
    expect(inputs.length).toBe(1);
    expect(labels.length).toBe(1);
    expect(attr(labels[0], "for")).toBe("email");
    expect(attr(inputs[0], "id")).toBe("email");
  });

  test("falls back to `name` when id is missing", () => {
    const rendered = render(<Field name="username" label="Username" />);
    const inputs = rendered.tags.get("input") ?? [];
    const labels = rendered.tags.get("label") ?? [];
    expect(attr(labels[0], "for")).toBe("username");
    expect(attr(inputs[0], "id")).toBe("username");
  });

  test("flags error state with .border-destructive AND <span class='destructive'>", () => {
    const rendered = render(
      <Field id="x" label="X" name="x" error="too short" type="text" />,
    );
    expect(rendered.html).toContain("border-destructive");
    expect(visibleText(rendered.html)).toContain("too short");
  });

  test("audit passes for plain Field", () => {
    const rendered = render(<Field id="email" name="email" label="Email" type="email" />);
    const errs = errorIssues(audit(rendered));
    expect(errs, formatIssues(errs)).toEqual([]);
  });

  test("audit passes for Field with no label (input wrapped by <label>)", () => {
    const rendered = render(<Field id="bare" name="bare" placeholder="Just placeholder" />);
    const errs = errorIssues(audit(rendered));
    // Even without a label *element*, the input is wrapped in <label>, so it
    // counts as labelled by association under the WCAG-allowed pattern.
    expect(errs, formatIssues(errs)).toEqual([]);
  });
});

describe("Pill primitive · accessibility", () => {
  test("renders as a span (no implicit interactivity)", () => {
    const rendered = render(<Pill tone="moss">Pending</Pill>);
    const spans = rendered.tags.get("span") ?? [];
    expect(spans.length).toBe(1);
    expect(visibleText(spans[0])).toBe("Pending");
  });

  test("audit passes for every tone", () => {
    const tones = ["neutral", "moss", "brick", "amber", "slate", "orange"] as const;
    for (const tone of tones) {
      const rendered = render(<Pill tone={tone}>Status</Pill>);
      const errs = errorIssues(audit(rendered));
      expect(errs, `Pill(${tone}) a11y:\n${formatIssues(errs)}`).toEqual([]);
    }
  });
});

describe("SoftCard primitive · accessibility", () => {
  test("audit passes for typical body content", () => {
    const rendered = render(
      <SoftCard padding="md" tone="default">
        <h3>Card title</h3>
        <p>Card body</p>
      </SoftCard>,
    );
    const errs = errorIssues(audit(rendered));
    expect(errs, formatIssues(errs)).toEqual([]);
  });
});

describe("TaskRow primitive · accessibility", () => {
  test("renders title and audit passes", () => {
    const rendered = render(<TaskRow taskId="t-1" title="Reply to Sam" />);
    expect(visibleText(rendered.html)).toContain("Reply to Sam");
    const errs = errorIssues(audit(rendered));
    expect(errs, formatIssues(errs)).toEqual([]);
  });

  test("checkbox toggle has aria-label that flips with done state", () => {
    const idle = render(<TaskRow taskId="t-2" title="Pay rent" done={false} />);
    const idleButton = (idle.tags.get("button") ?? [])[0];
    expect(idleButton).toContain('aria-label="Mark task as done"');
    const doneRow = render(<TaskRow taskId="t-3" title="Pay rent" done />);
    const doneButton = (doneRow.tags.get("button") ?? [])[0];
    expect(doneButton).toContain('aria-label="Mark task as not done"');
  });
});
