export type ScreenCategory =
  | "Flow"
  | "Library"
  | "You"
  | "Settings"
  | "Marketing"
  | "Auth";

export type ConvexTagType =
  | "@convex-mutation-needed"
  | "@convex-action-needed"
  | "@convex-query-needed";

export type ControlTag =
  | {
      type: "@behavior";
      value: string;
    }
  | {
      type: ConvexTagType;
      value: string;
    }
  | {
      type: "@navigate";
      value: string;
    }
  | {
      type: "@provider-needed";
      value: string;
    }
  | {
      type: "@schema-delta";
      value: string;
    }
  | {
      type: "@tier-caps";
      value: string;
    }
  | {
      type: "@prd";
      value: string;
    }
  | {
      type: "@source";
      value: string;
    }
  | {
      type: "@confirm";
      value: string;
    };

export type ScreenControlFixture = {
  id: string;
  label: string;
  intent: string;
  tags: [
    Extract<ControlTag, { type: "@behavior" }>,
    ...Array<Exclude<ControlTag, { type: "@behavior" }>>,
  ];
};

export type ScreenFixture = {
  id: string;
  title: string;
  category: ScreenCategory;
  route: string;
  summary: string;
  owner: "cursor-cloud-1";
  tier: "A";
  prdRefs: string[];
  sourceRefs: string[];
  controls: ScreenControlFixture[];
};

export type MobileScreenFixture = {
  id: string;
  title: string;
  route: string;
  sourceRefs: string[];
  controls: ScreenControlFixture[];
};
