/**
 * Vitest and Testing Library are not dependencies in this repo, and package.json
 * is outside this ticket's scope. bun:test plus react-dom covers the same checks.
 */
import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";

type Listener = (event: TestEvent) => void;

class TestEvent {
  bubbles = true;
  cancelable = true;
  defaultPrevented = false;
  cancelBubble = false;
  eventPhase = 3;
  timeStamp = Date.now();
  button = 0;
  buttons = 1;
  detail = 1;
  clientX = 0;
  clientY = 0;
  pageX = 0;
  pageY = 0;
  screenX = 0;
  screenY = 0;
  ctrlKey = false;
  shiftKey = false;
  altKey = false;
  metaKey = false;
  view: unknown = globalThis;
  relatedTarget: null = null;
  currentTarget: TestNode | null = null;
  srcElement: TestNode;
  constructor(
    public type: string,
    public target: TestNode
  ) {
    this.srcElement = target;
  }
  preventDefault() {
    this.defaultPrevented = true;
  }
  stopPropagation() {
    this.cancelBubble = true;
  }
  persist() {}
  isDefaultPrevented() {
    return this.defaultPrevented;
  }
  getModifierState() {
    return false;
  }
}

class TestNode {
  nodeType = 1;
  childNodes: TestNode[] = [];
  parentNode: TestNode | null = null;
  nextSibling: TestNode | null = null;
  previousSibling: TestNode | null = null;
  firstChild: TestNode | null = null;
  lastChild: TestNode | null = null;
  ownerDocument: TestNode;
  namespaceURI = "http://www.w3.org/1999/xhtml";
  attributes: Record<string, string> = {};
  style = { setProperty() {}, getPropertyValue: () => "" };
  className = "";
  id = "";
  value = "";
  disabled = false;
  href = "";
  type = "";
  nodeValue: string | null = null;
  defaultView: unknown = globalThis;
  activeElement: TestNode | null = null;
  body: TestNode | null = null;
  documentElement: TestNode | null = null;
  private listeners: Record<string, Listener[]> = {};

  constructor(
    public nodeName: string,
    owner: TestNode | null
  ) {
    this.tagName = nodeName;
    this.ownerDocument = owner ?? this;
  }

  tagName: string;

  get options(): TestNode[] {
    const opts: TestNode[] = [];
    const visit = (node: TestNode) => {
      if (node.tagName === "OPTION") opts.push(node);
      for (const child of node.childNodes) visit(child);
    };
    for (const child of this.childNodes) visit(child);
    return opts;
  }

  get textContent(): string {
    if (this.nodeType === 3) return this.nodeValue ?? "";
    return this.childNodes.map((child) => child.textContent).join("");
  }

  set textContent(value: string) {
    this.childNodes = [];
    this.firstChild = null;
    this.lastChild = null;
    if (value) {
      const text = this.ownerDocument.createTextNode(value);
      this.appendChild(text);
    }
  }

  appendChild(child: TestNode) {
    if (child.parentNode) child.parentNode.removeChild(child);
    child.parentNode = this;
    const prev = this.lastChild;
    if (prev) {
      prev.nextSibling = child;
      child.previousSibling = prev;
    } else {
      this.firstChild = child;
    }
    child.nextSibling = null;
    this.lastChild = child;
    this.childNodes.push(child);
    return child;
  }

  insertBefore(child: TestNode, ref: TestNode | null) {
    if (!ref) return this.appendChild(child);
    if (child.parentNode) child.parentNode.removeChild(child);
    const index = this.childNodes.indexOf(ref);
    if (index < 0) return this.appendChild(child);
    child.parentNode = this;
    this.childNodes.splice(index, 0, child);
    const prev = ref.previousSibling;
    child.previousSibling = prev;
    child.nextSibling = ref;
    ref.previousSibling = child;
    if (prev) prev.nextSibling = child;
    else this.firstChild = child;
    return child;
  }

  removeChild(child: TestNode) {
    const index = this.childNodes.indexOf(child);
    if (index >= 0) this.childNodes.splice(index, 1);
    if (child.previousSibling) child.previousSibling.nextSibling = child.nextSibling;
    if (child.nextSibling) child.nextSibling.previousSibling = child.previousSibling;
    if (this.firstChild === child) this.firstChild = child.nextSibling;
    if (this.lastChild === child) this.lastChild = child.previousSibling;
    child.parentNode = null;
    child.nextSibling = null;
    child.previousSibling = null;
    return child;
  }

  setAttribute(name: string, value: string) {
    this.attributes[name] = String(value);
    if (name === "class") this.className = String(value);
    if (name === "id") this.id = String(value);
    if (name === "href") this.href = String(value);
    if (name === "value") this.value = String(value);
    if (name === "disabled") this.disabled = true;
  }

  getAttribute(name: string) {
    if (name === "href" && this.href) return this.href;
    return this.attributes[name] ?? null;
  }

  removeAttribute(name: string) {
    delete this.attributes[name];
    if (name === "disabled") this.disabled = false;
  }

  hasAttribute(name: string) {
    return Object.hasOwn(this.attributes, name);
  }

  addEventListener(type: string, fn: Listener, options?: boolean | { capture?: boolean }) {
    const capture = typeof options === "boolean" ? options : Boolean(options?.capture);
    const key = capture ? `${type}:capture` : type;
    let bucket = this.listeners[key];
    if (!bucket) {
      bucket = [];
      this.listeners[key] = bucket;
    }
    bucket.push(fn);
  }

  removeEventListener(type: string, fn: Listener, options?: boolean | { capture?: boolean }) {
    const capture = typeof options === "boolean" ? options : Boolean(options?.capture);
    const key = capture ? `${type}:capture` : type;
    this.listeners[key] = (this.listeners[key] ?? []).filter((item) => item !== fn);
  }

  dispatchEvent(event: TestEvent) {
    const path: TestNode[] = [];
    let node: TestNode | null = event.target;
    while (node) {
      path.push(node);
      node = node.parentNode;
    }
    for (const current of path) {
      event.currentTarget = current;
      for (const fn of [...(current.listeners[event.type] ?? [])]) fn(event);
      if (event.cancelBubble) break;
    }
    return !event.defaultPrevented;
  }

  click() {
    this.dispatchEvent(new TestEvent("click", this));
  }

  focus() {}
  blur() {}
  contains(other: TestNode) {
    let node: TestNode | null = other;
    while (node) {
      if (node === this) return true;
      node = node.parentNode;
    }
    return false;
  }
  getRootNode() {
    return this.ownerDocument;
  }
  cloneNode() {
    return new TestNode(this.nodeName, this.ownerDocument);
  }
  compareDocumentPosition() {
    return 0;
  }
  createElement(tag: string) {
    return new TestNode(tag.toUpperCase(), this.ownerDocument);
  }
  createElementNS(_ns: string, tag: string) {
    return this.createElement(tag);
  }
  createTextNode(text: string) {
    const node = new TestNode("#text", this.ownerDocument);
    node.nodeType = 3;
    node.nodeValue = text;
    return node;
  }
  createComment(text: string) {
    const node = new TestNode("#comment", this.ownerDocument);
    node.nodeType = 8;
    node.nodeValue = text;
    return node;
  }
  querySelector() {
    return null;
  }
  querySelectorAll() {
    return [];
  }
  getElementById() {
    return null;
  }
}

class TestElement extends TestNode {}

function installTestDom() {
  const documentNode = new TestNode("#document", null);
  documentNode.nodeType = 9;
  documentNode.ownerDocument = documentNode;
  const documentElement = new TestElement("HTML", documentNode);
  const body = new TestElement("BODY", documentNode);
  documentNode.appendChild(documentElement);
  documentElement.appendChild(body);
  documentNode.documentElement = documentElement;
  documentNode.body = body;
  documentNode.activeElement = body;
  const globals = globalThis as Record<string, unknown>;
  globals.window = globalThis;
  globals.document = documentNode;
  globals.HTMLElement = TestElement;
  globals.Element = TestElement;
  globals.Node = TestNode;
  globals.HTMLIFrameElement = class HTMLIFrameElement extends TestElement {};
  globals.navigator = { userAgent: "bun-test" };
  globals.location = { protocol: "http:", href: "http://localhost/" };
  globals.getComputedStyle = () => ({ getPropertyValue: () => "" });
  globals.MutationObserver = class {
    observe() {}
    disconnect() {}
  };
  globals.IS_REACT_ACT_ENVIRONMENT = true;
  return documentNode;
}

const documentNode = installTestDom();

const push = mock((_href: string) => {});

type CreateArgs = {
  name: string;
  description?: string;
  periodType: "daily" | "weekly" | "monthly" | "none";
  body: string;
};

type UpdateArgs = CreateArgs & { templateId: string };

const createTemplate = mock(async (_args: CreateArgs | UpdateArgs) => "templates_1");
const updateTemplate = mock(async (_args: CreateArgs | UpdateArgs) => "templates_1");

type TemplateFixture = {
  templateId: string;
  source: "starter" | "user";
  name: string;
  description?: string;
  periodType: "daily" | "weekly" | "monthly" | "none";
  sections: string[];
  body: string;
};

let templateResult: TemplateFixture | null | undefined;
let activeMutation: (args: CreateArgs | UpdateArgs) => Promise<string> = createTemplate;

mock.module("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

mock.module("@/lib/useUserReady", () => ({ useUserReady: () => true }));

mock.module("convex/react", () => ({
  useQuery: (_ref: unknown, args: unknown) => {
    if (args === "skip") return undefined;
    return templateResult;
  },
  useMutation: () => activeMutation,
}));

const { TemplateForm } = await import("./TemplateForm");
const { TemplateBuilderScreen, TemplateEditorScreen } = await import("./TemplateBuilder");

const dailyTemplate: TemplateFixture = {
  templateId: "starter:daily-page",
  source: "starter",
  name: "Daily page",
  description: "A short outline for one day.",
  periodType: "daily",
  sections: ["Intention", "Schedule", "Notes"],
  body: "# Today\n\n## Intention\nOne line for what would make today feel complete.\n\n- [ ] Morning\n",
};

const userTemplate: TemplateFixture = {
  templateId: "jd7userdaily",
  source: "user",
  name: "My daily",
  description: "Personal",
  periodType: "weekly",
  sections: ["Focus"],
  body: "## Focus\nOne thing.\n",
};

function walk(node: TestNode, visit: (node: TestNode) => void) {
  visit(node);
  for (const child of node.childNodes) walk(child, visit);
}

function findButton(root: TestNode, label: string): TestNode {
  const found: TestNode[] = [];
  walk(root, (node) => {
    if (node.tagName === "BUTTON" && node.textContent.includes(label)) found.push(node);
  });
  const button = found[0];
  if (!button) throw new Error(`Missing button: ${label}`);
  return button;
}

function findById(root: TestNode, id: string): TestNode {
  const found: TestNode[] = [];
  walk(root, (node) => {
    if (node.id === id || node.getAttribute("id") === id) found.push(node);
  });
  const match = found[0];
  if (!match) throw new Error(`Missing #${id}`);
  return match;
}

function findByAria(root: TestNode, label: string): TestNode {
  const found: TestNode[] = [];
  walk(root, (node) => {
    if (node.getAttribute("aria-label") === label) found.push(node);
  });
  const match = found[0];
  if (!match) throw new Error(`Missing aria-label: ${label}`);
  return match;
}

let root: Root | null = null;
let host: TestNode | null = null;

async function renderNode(node: ReactElement) {
  host = documentNode.createElement("div");
  documentNode.body?.appendChild(host);
  root = createRoot(host as unknown as HTMLElement);
  await act(async () => {
    root?.render(node);
  });
  return host;
}

describe("TemplateForm", () => {
  beforeEach(() => {
    templateResult = undefined;
    activeMutation = createTemplate;
    push.mockReset();
    createTemplate.mockReset();
    updateTemplate.mockReset();
    createTemplate.mockImplementation(async () => "templates_1");
    updateTemplate.mockImplementation(async () => "templates_1");
  });

  afterEach(async () => {
    await act(async () => {
      root?.unmount();
    });
    if (host?.parentNode) host.parentNode.removeChild(host);
    root = null;
    host = null;
  });

  test("disables Save until the name is non-empty", async () => {
    const view = await renderNode(
      (
        <TemplateForm
          initial={{ name: "", description: "", periodType: "daily", body: "" }}
          onSave={() => undefined}
        />
      ) as ReactElement
    );
    expect(findButton(view, "Save").disabled).toBe(true);
    expect(view.textContent).not.toContain("{");

    await act(async () => {
      root?.render(
        (
          <TemplateForm
            key="spaces"
            initial={{ name: "   ", description: "", periodType: "daily", body: "" }}
            onSave={() => undefined}
          />
        ) as ReactElement
      );
    });
    expect(findButton(view, "Save").disabled).toBe(true);

    await act(async () => {
      root?.render(
        (
          <TemplateForm
            key="named"
            initial={{ name: "Evening page", description: "", periodType: "none", body: "" }}
            onSave={() => undefined}
          />
        ) as ReactElement
      );
    });
    expect(findButton(view, "Save").disabled).toBe(false);
  });

  test("creates a template from the starter values, then opens the library", async () => {
    templateResult = dailyTemplate;
    const view = await renderNode(
      (<TemplateBuilderScreen fromId="starter:daily-page" />) as ReactElement
    );
    expect(view.textContent).toContain("Your copy");
    expect(findById(view, "template-name").value).toBe("Daily page");
    const preview = findByAria(view, "Preview");
    expect(preview.textContent).toContain("Intention");
    expect(preview.textContent).toContain("Morning");
    expect(preview.textContent).not.toContain("# Today");
    expect(preview.textContent).not.toContain('"body"');
    expect(findButton(view, "Save").disabled).toBe(false);

    await act(async () => {
      findButton(view, "Save").click();
    });

    expect(createTemplate).toHaveBeenCalledTimes(1);
    expect(createTemplate).toHaveBeenCalledWith({
      name: "Daily page",
      description: "A short outline for one day.",
      periodType: "daily",
      body: dailyTemplate.body,
    });
    expect(push).toHaveBeenCalledWith("/templates");
  });

  test("shows a starter as read-only and opens the builder for a copy", async () => {
    templateResult = dailyTemplate;
    activeMutation = updateTemplate;
    const view = await renderNode(
      (<TemplateEditorScreen templateId="starter:daily-page" />) as ReactElement
    );
    expect(view.textContent).toContain("This starter is read-only");
    expect(view.textContent).toContain("Make my own copy");
    expect(findById(view, "template-name").disabled).toBe(true);
    expect(findById(view, "template-description").disabled).toBe(true);
    expect(findById(view, "template-period").disabled).toBe(true);
    expect(findById(view, "template-body").disabled).toBe(true);
    expect(view.textContent).not.toContain('"templateId"');

    await act(async () => {
      findButton(view, "Make my own copy").click();
    });
    expect(updateTemplate).not.toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith("/templates/builder?from=starter%3Adaily-page");
  });

  test("updates a user template and shows a calm not-found state", async () => {
    templateResult = null;
    const missing = await renderNode(
      (<TemplateEditorScreen templateId="missing" />) as ReactElement
    );
    expect(missing.textContent).toContain("This template was not found");
    expect(missing.textContent).not.toContain("{");

    await act(async () => {
      root?.unmount();
    });
    if (host?.parentNode) host.parentNode.removeChild(host);

    templateResult = userTemplate;
    activeMutation = updateTemplate;
    const view = await renderNode(
      (<TemplateEditorScreen templateId="jd7userdaily" />) as ReactElement
    );
    expect(findById(view, "template-name").disabled).toBe(false);
    await act(async () => {
      findButton(view, "Save").click();
    });
    expect(updateTemplate).toHaveBeenCalledWith({
      templateId: "jd7userdaily",
      name: "My daily",
      description: "Personal",
      periodType: "weekly",
      body: userTemplate.body,
    });
    expect(view.textContent).toContain("Saved.");
    expect(push).not.toHaveBeenCalled();
  });
});
