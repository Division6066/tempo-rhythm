---
name: founder-control-loop
description: Use when shipping quickly with AI coding tools and you need founder-safe guardrails for scope, cost, compliance, reliability, and values without losing momentum.
---

# Founder Control Loop (Price + Scope Sanity Check)

## Purpose
Ship fast without surprise bills, scope chaos, compliance mistakes, or architecture bloat.

## Audience
Non-technical founders (ADHD/dyslexia friendly) using AI-assisted coding.

## Operating principle
Speed is good.
Uncontrolled speed is expensive.

## Decision precedence (highest to lowest)
1. Legal/compliance requirements
2. Product values and privacy commitments
3. Critical-path reliability and uptime
4. Scope clarity and sequencing
5. Performance targets
6. Cost optimization
7. Convenience/default defaults

If two priorities conflict, the higher one wins.

## Communication contract (mandatory)
- Start with TL;DR (max 3 bullets).
- Use plain English.
- One decision at a time.
- Max 7 bullets per section.
- Always include: Do now, Watch out, Can wait.

## Gate 0: Compliance fit (mandatory, first)
Before recommending any tool/config, check:
- HIPAA required?
- GDPR required?
- ISO 27001 required?
- SOC 2 buyer requirement present?

For required frameworks, verify:
- Contract support (BAA, DPA as applicable)
- Encryption at rest/in transit
- Access controls and audit logs
- Retention/deletion controls
- Data residency needs

Compliance override:
- If Tool A is cheaper but not compliant, reject Tool A.
- Choose compliant Tool B regardless of cost.

## Gate 1: Values consistency (mandatory)
Check product claims vs tooling:
- If product claims privacy-first, do not recommend surveillance-style tracking.
- If product claims open-source/privacy-friendly posture, avoid contradictory vendor choices.

Values override:
- Reject tools that violate core product principles, even if cheaper/easier.

## Gate 2: Architecture sanity check (mandatory)
Ask:
- Is this architecture the simplest one that can work?
- Can one layer/service be removed with no user-facing loss?
- Are we adding complexity before proving demand?

Rule:
- Prefer the simplest architecture that satisfies current requirements.
- No future-proof complexity unless tied to a near-term requirement.

## Gate 3: New tool scan (timeboxed)
When considering a new tool:
- Timebox scan to 15-30 minutes.
- Compare current tool vs candidate on:
  - compliance fit
  - reliability
  - cost
  - migration risk
  - lock-in risk

Rule:
- Do not switch tools without material benefit to critical goals.

## Gate 4: Open-source reuse gate
Before adopting OSS:
- License compatibility
- Maintenance activity
- Security posture
- Bus factor/risk
- Integration effort

Rule:
- Reuse OSS when it reduces time/cost and passes trust checks.
- Do not import abandoned or risky repos to save short-term effort.

## Gate 5: Build strategy selection (Snowball vs Avalanche)
Default: Snowball.
- Build thin vertical slice end-to-end first.
- Validate value quickly.
- Expand in small increments.

Use Avalanche only when required:
- Compliance/security/platform constraints force foundation-first work.
- Core infra must exist before any meaningful slice can run.

## Gate 6: Component sequencing (for apps with multiple parts)
For each component, score:
- User value now (1-5)
- Dependency unlock power (1-5)
- Risk reduction impact (1-5)
- Complexity cost (1-5, lower is better)

Priority formula:
- (Value + Unlock + Risk Reduction) - Complexity

Start with highest score that enables end-to-end validation earliest.

## Gate 7: Tool + configuration fit
After tool selection, validate config:
- Project stage: prototype / early users / paying users / scale
- Critical path: yes/no
- Required cadence: deploy speed, update frequency
- Required SLO/SLA: uptime/latency targets

Rule:
- Default to minimal viable configuration.
- Upgrade tier/config only when architecture, SLA, or user impact requires it.

## Gate 8: Budget sanity (stage-aware)
Budget must match project stage and business context:
- Prototype/solo: strict lean spend
- Early paid: optimize cost first, protect essentials
- Revenue-critical/client-facing: pay for reliability on critical path

Cost-vs-reliability rule:
- If cheaper option risks critical-path reliability, choose the more reliable option.

## Required output format (every recommendation)
1. TL;DR (for complete beginner)
2. Why this recommendation (simple technical explanation)
3. Why now (stage + scope fit)
4. Decision needed now (single clear choice)
5. Do now (max 3 steps)
6. Watch out (top 2 risks)
7. Can wait (defer list)
8. If we skip this, likely consequence (one line)
9. Next checkpoint

## Red flags (force pause + explicit founder confirmation)
- Compliance unclear
- Privacy/value contradiction detected
- Critical-path reliability unresolved
- Expensive tier chosen without requirement
- Scope expanded without priority justification
- Duplicate/concurrent deployment waste likely

## Success criteria
- No surprise infra invoices
- Scope remains controlled and intentional
- Compliance-safe toolchain for required standards
- Values and implementation stay aligned
- Founder can explain decisions in plain English
