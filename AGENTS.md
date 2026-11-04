# AGENTS.md

## Repository Expectations
- **Primary Language / Stack**: TypeScript (Node.js >=22.12), React 18.3.1, React Router, @shopify/shopify-app-react-router 4.x, Shopify Admin GraphQL, Polaris web components.

## Build & Test Commands
- **Install dependencies**: `npm install`
- **Run dev server**: `npm run dev`
- **Run unit tests**: `npm run test`
- **Lint & Typecheck**: `npm run lint && npm run typecheck` (Always run before completing a task)
- **Shopify AI Toolkit**: Use the [Shopify AI Toolkit](https://shopify.dev/docs/apps/build/ai-toolkit) for all Shopify API and platform work. If missing, install it in the agent host per that page (or `npx skills add Shopify/shopify-ai-toolkit --list` for skill-compatible hosts) — do not add tooling to this repo.


## Architecture & Code Guidelines
- **Directory Structure**:
  - Shopify app page routes live in `app/routes/`. Page layout file starts with `app.{page_name}.tsx` 
  - Page related components live in the `app/features/{feature_name}/ui`, types - in the `app/features/{feature_name}/types`, utils - in the `app/features/{feature_name}/utils`, GraphQL queries - in the `app/features/{feature_name}/api`
- Page component file is named with `app.{page_name}.tsx`.
- Utility functions files are named in kebab-case (e.g `pagination-helpers.ts`), GraphQl queries files are added with name `api.server.ts`, API and other page-needed types definitions are added to `index.ts` 

## Development workflow
This project uses Spec Kit (spec-driven development). 
Rules:
- Do not write implementation code before a spec and plan exist for the feature.
- Specs live in `specs/<feature>/`. Read them before changing related code.
- Project principles are in `.specify/memory/constitution.md`. Follow them.
- Small bug fixes, typos, and dependency bumps don't need the full flow.
- If the implementation diverges from the spec, update the spec first.

## Do-Not-List (Critical Rules)
- Do not install new npm packages without asking or justifying the bundle size impact.
- Do not add unnecessary comments to self-explanatory code.
- Do not commit `.env` or any secrets.

