# AGENTS.md

## Repository Expectations
- **Primary Language / Stack**: TypeScript (Node.js >=22.12), React 18.3.1, React Router, @shopify/shopify-app-react-router 4.x, Shopify Admin GraphQL, Polaris web components.

## Build & Test Commands
- **Install dependencies**: `npm install`
- **Run dev server**: `npm run dev`
- **Run unit tests**: `npm run test`
- **Lint & Typecheck**: `npm run lint && npm run typecheck` (Always run before completing a task)

## Architecture & Code Guidelines
- **Directory Structure**:
  - Shopify app page routes live in `app/routes/`.
  - Page related components live in the `app/features/{feature_name}/ui`, types - in the `app/features/{feature_name}/types`, utils - in the `app/features/{feature_name}/utils`, GraphQL queries - in the `app/features/{feature_name}/api`
- Page component file is named with `app.{page_name}.tsx`.
- Utility functions files are named in kebab-case (e.g `pagination-helpers.ts`), GraphQL queries files are added with name `api.server.ts`, API and other page-needed types definitions are added to `index.ts` 

## Development workflow
This project uses Spec Kit (spec-driven development). For any non-trivial feature, follow this order:

1. `$speckit-specify` – write the spec (what and why, not how)
2. `$speckit-clarify` – resolve open questions before planning
3. `$speckit-plan` – technical plan (routes, GraphQL queries, data model)
4. `$speckit-tasks` – break the plan into tasks
5. `$speckit-analyze` – check spec, plan and tasks for consistency (optional)
6. `$speckit-implement` – execute the tasks

Rules:
- Use the [Shopify AI Toolkit](https://shopify.dev/docs/apps/build/ai-toolkit) for all Shopify API and platform work, in both the plan and implement steps. If missing, install it in the agent host per that page (or `npx skills add Shopify/shopify-ai-toolkit --list` for skill-compatible hosts). Do not add tooling to this repo.
- Do not write implementation code before a spec and plan exist for the feature.
- Specs live in `specs/<feature>/`. Read them before changing related code.
- Project principles are in `.specify/memory/constitution.md`. Follow them.
- Small bug fixes, typos, and dependency bumps don't need the full flow.
- If the implementation diverges from the spec, update the spec first.
- Run `npm run lint && npm run typecheck && npm run test` after each task group during `implement`, not only at the very end.

## Do-Not-List (Critical Rules)
- Do not install new npm packages without asking or justifying the bundle size impact.
- Do not add unnecessary comments to self-explanatory code.
- Do not commit `.env` or any secrets.
- Do not edit files in specs/ by hand unless updating the spec as described above
