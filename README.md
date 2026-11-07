# IntentVault

A PayBox plugin that gives AI agents **persistent financial memory**.

PayBox currently lets agents pay, swap, and sign.
What it doesn't have is long-term financial context: rules, budgets, and ongoing plans that survive across conversations.

IntentVault adds that missing layer.

## What it does

The plugin exposes three simple tools:

| Tool | Purpose |
|------|---------|
| `list_intents` | Returns the user's active financial intents and rules |
| `check_against_intents` | Checks whether a proposed action conflicts with those intents |
| `create_intent` | Creates a new financial intent (demo mode) |

### Example intents
- Keep discretionary spending under $300 this month
- Never auto-approve payments to new merchants above $100
- DCA $50 USDC into SOL every Friday

Agents can query these intents and check proposed actions against them before executing payments.

## Current status

This is a **demo version**. Intents are currently hardcoded so the concept can be shown clearly.
A production version would store intents in a persistent, user-scoped database.

## How to run

Requires Node.js 24 and pnpm 11.11.0. On Windows, use WSL2 (the starter does not run on plain Windows).

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm build
```

## Credit

Built on the PayBox plugin starter (v1.0.2) from developer.paybox.sh.