# Knowledge Base — Top-Level Index

**Last updated:** 2026-04-18 (scaffold)
**Owner:** human-amit

## Entry points by goal

| If your goal is... | Start here |
|---|---|
| Pick the next batch of work | [`tickets/_INDEX.md`](tickets/_INDEX.md) |
| Design a UI component | [`brand/_INDEX.md`](brand/_INDEX.md) → [`brand/visual-tokens.md`](brand/visual-tokens.md) |
| Write marketing / UI copy | [`brand/voice.md`](brand/voice.md) |
| Understand what "done" means for Phase 1 MVP | [`prds/README.md`](prds/README.md) → `docs/brain/PRDs/PRD_Phase_1_MVP.md` |
| Know what you absolutely must not do | [`rules/README.md`](rules/README.md) → `docs/HARD_RULES.md` |
| Run a 45-minute multi-agent session | [`agents-playbook/workflow-sunday-morning.md`](agents-playbook/workflow-sunday-morning.md) |
| Know when to stop and ask Amit | [`agents-playbook/checkpoints.md`](agents-playbook/checkpoints.md) |
| Understand each sub-agent's job | [`agents-playbook/sub-agents.md`](agents-playbook/sub-agents.md) |

## Folder map

```
docs/knowledge/
├── README.md                       ← what this is, who reads it
├── _INDEX.md                       ← you are here
├── brand/
│   ├── _INDEX.md
│   ├── identity.md                 ← who Tempo is, positioning, no-shame principle
│   ├── voice.md                    ← tone rules for UI copy + AI explanations
│   ├── visual-tokens.md            ← color / type / spacing / motion
│   └── do-and-dont.md              ← concrete examples, anti-patterns
├── tickets/
│   ├── _INDEX.md                   ← grouped by time, parallelizability, deps, cluster
│   └── T-XXXX.md                   ← one per todo/in-progress task (filled by Phase 3 agent)
├── prds/
│   └── README.md                   ← pointer to docs/brain/PRDs/
├── rules/
│   └── README.md                   ← pointer to docs/HARD_RULES.md + .cursor/rules/*
├── agents-playbook/
│   ├── workflow-sunday-morning.md  ← /whats-next → 45 min → 3 agents flow
│   ├── checkpoints.md              ← when agents must pause for human OK
│   └── sub-agents.md               ← roles of each tempo-* verification agent
└── sources/
    └── README.md                   ← drop raw folders/docs here for ingestion
```

## Skill auto-attach map

These Cursor skills are installed and auto-activate on matching work:

- **UI / design work** → `frontend-design`, `web-design-guidelines`, `tailwind-design-system`, `design-system-patterns`, `theme-factory`, `extract-design-system`, `vercel-react-best-practices`, plus the forthcoming `tempo-brand` skill.
- **Convex backend** → `convex`, `convex-quickstart`, `convex-setup-auth`, `convex-create-component`, `convex-migration-helper`, `convex-performance-audit`.
- **Mobile (Expo + React Native)** → `vercel-react-native-skills`, `vercel-react-view-transitions`.
- **Deployment** → `deploy-to-vercel`, `vercel-cli-with-tokens`, `vercel-composition-patterns`.
- **AI / RAG features** → `rag-implementation`, `embedding-strategies`, `hybrid-search-implementation`, `deep-research`, `memory-management`.
- **Security + compliance** → `stride-analysis-patterns`, `attack-tree-construction`, `threat-mitigation-mapping`, `security-requirement-extraction`, `secrets-management`, `gdpr-data-handling`, `auth-implementation-patterns`.
- **Accessibility** → `accessibility-compliance`, `wcag-audit-patterns`.
- **Writing / coauthoring** → `doc-coauthoring`, `brand-voice-enforcement`, plus the forthcoming `tempo-brand` skill.
- **Skill + MCP authoring** → `skill-creator`, `mcp-builder`.
- **Test + validate** → `webapp-testing`.

Cursor auto-attaches a skill when the task description triggers its description. You do not need to manually invoke them.
