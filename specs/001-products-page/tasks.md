---
description: "Implementation tasks for the Products page feature"
---

# Tasks: Products Page

**Input**: Design documents from `specs/001-products-page/`

**Prerequisites**: `plan.md`, `spec.md`; supporting context in `research.md`, `data-model.md`, `contracts/`, and `quickstart.md`.

**Tests**: Included because the implementation plan and project constitution require automated coverage for new behavior.

## Phase 1: Setup

**Purpose**: Add the minimal test tooling required by the feature.

- [X] T001 Add a Vite-compatible Vitest version and test script in `package.json` (verify compatibility with the installed Vite 6 version).
- [X] T002 [P] Configure Vitest and its test environment in `vite.config.ts`.

---

## Phase 2: Foundational

**Purpose**: Establish typed product-page boundaries shared by the stories.

- [X] T003 Define typed product row, page-info, success, and failure data contracts in `app/routes/app.products.tsx`.
- [X] T004 Validate optional cursor and direction search parameters in `app/routes/app.products.tsx`, defaulting absent parameters to the first page and handling malformed values as a recoverable error.

**Checkpoint**: Shared route data shape and cursor input rules are defined.

---

## Phase 3: User Story 1 - Browse store products (Priority: P1) 🎯 MVP

**Goal**: Show product titles, statuses, and optional images in the embedded app.

**Independent Test**: For a store with products, the first page lists each product's title and status and shows an image only when available; a store with no products shows an empty state.

### Tests for User Story 1

- [X] T005 [P] [US1] Add loader success and empty-result coverage in `app/routes/app.products.test.tsx`.
- [X] T006 [P] [US1] Add rendered product list, optional image, and empty-state coverage in `app/routes/app.products.test.tsx`.

### Implementation for User Story 1

- [X] T007 [US1] Add the Products navigation link to `app/routes/app.tsx`.
- [X] T008 [US1] Implement the authenticated products loader and typed `#graphql` query for `id`, `title`, `status`, `featuredMedia { ... on MediaImage { image { url altText } } }`, and required page-info cursors in `app/routes/app.products.tsx`.
- [X] T009 [US1] Render a Polaris `s-table` product list with title, status, and optional accessible image in `app/routes/app.products.tsx`.
- [X] T010 [US1] Render the successful zero-product empty state in `app/routes/app.products.tsx`.

**Checkpoint**: Merchants can navigate to Products and review a populated or empty catalog page.

---

## Phase 4: User Story 3 - Understand loading and failures (Priority: P1)

**Goal**: Give visible feedback while route navigation is pending and when the Admin API request fails.

**Independent Test**: Delay navigation to observe the table loading state; simulate transport and GraphQL errors to confirm a clear retryable error state appears.

### Tests for User Story 3

- [X] T011 [P] [US3] Add transport failure, GraphQL error, retry, and pending-navigation state coverage in `app/routes/app.products.test.tsx`.

### Implementation for User Story 3

- [X] T012 [US3] Map transport and GraphQL failures to a typed user-safe route error state in `app/routes/app.products.tsx`.
- [X] T013 [US3] Render a retryable Polaris error banner and bind React Router pending navigation to the table loading property in `app/routes/app.products.tsx`.

**Checkpoint**: Pending and failed requests provide visible, recoverable feedback.

---

## Phase 5: User Story 2 - Navigate product pages (Priority: P2)

**Goal**: Navigate adjacent result pages with forward and backward Shopify cursors.

**Independent Test**: With more than 25 products, Next and Previous load adjacent pages without gaps or duplicates; unavailable directions are disabled at the first and last pages.

### Tests for User Story 2

- [X] T014 [P] [US2] Add cursor direction, page boundary, and adjacent-page navigation coverage in `app/routes/app.products.test.tsx`.

### Implementation for User Story 2

- [X] T015 [US2] Query `first: 25` with `after` or `last: 25` with `before` according to validated URL parameters in `app/routes/app.products.tsx`.
- [X] T016 [US2] Render Next and Previous controls from page-info flags and cursors, navigating with URL search parameters in `app/routes/app.products.tsx`.

**Checkpoint**: Merchants can move through cursor pages, with each control unavailable when its adjacent page does not exist.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Generate operation types and verify the implementation against the design.

- [X] T017 Regenerate Shopify GraphQL operation types for the route using `npm run graphql-codegen` and use the generated variable/result types in `app/routes/app.products.tsx`.
- [X] T018 [P] Confirm the feature introduces no `any` in `app/routes/app.products.tsx` or `app/routes/app.products.test.tsx`.
- [X] T019 Run the focused Vitest suite, `npm run typecheck`, `npm run lint`, and `npm run build`; resolve feature-related failures.
- [ ] T020 Validate the embedded Products route scenarios in `specs/001-products-page/quickstart.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1) precedes all later phases.
- Foundational (Phase 2) depends on Setup and blocks user-story implementation.
- User stories follow in listed priority order for the initial implementation; US3's error and loading states also apply to the US1 route.
- Polish (Phase 6) depends on all user stories.

### User Story Dependencies

- **US1 (P1)**: Starts after Phase 2; delivers the MVP catalog route.
- **US3 (P1)**: Starts after Phase 2 and uses the route established by US1.
- **US2 (P2)**: Starts after Phase 2; extends the loader and UI introduced by US1.

### Parallel Opportunities

- T001 and T002 touch separate files and can be completed in parallel.
- T005 and T006 cover separate behavior areas but share a test file; coordinate edits or complete sequentially if working in one checkout.
- T011 and T014 share the same test file and should be applied sequentially in one checkout.
- Story work is logically separable after foundational work, but US3 and US2 modify the same route as US1 and should be sequenced in a single checkout.

## Parallel Example: User Story 1

```text
T005: Add loader success and empty-result coverage in app/routes/app.products.test.tsx
T006: Add rendered list and empty-state coverage in app/routes/app.products.test.tsx
```

These tests share a file; parallel execution requires coordinated changes or separate branches.

## Implementation Strategy

### MVP First (US1)

1. Complete setup and foundational tasks.
2. Complete US1 tests and implementation.
3. Validate the populated and empty catalog states independently.

### Incremental Delivery

1. Add US3 loading and recoverable failure feedback.
2. Add US2 cursor navigation.
3. Regenerate operation types and run repository quality gates.

## Notes

- Every task has a checkbox, sequential ID, applicable story label, and concrete file path.
- `[P]` marks work on a distinct file that can proceed independently.
- Shopify Admin API implementation must follow the repository instruction to use the Shopify AI Toolkit; do not add toolkit dependencies to the repository.

## Phase 7: Convergence

- [ ] T021 Add tests for absent, empty, duplicate, and overlong cursor parameters; verify malformed cursors avoid Admin GraphQL and the first-page request omits cursor variables in `app/routes/app.products.test.tsx` per FR-007 and Constitution II (missing).
- [ ] T022 Show and test a visible pending state in the `/app` layout while the Products route loader is pending in `app/routes/app.tsx` and `app/routes/app.products.test.tsx` per FR-004 and US3/AC1 (partial).
- [ ] T023 Distinguish a true empty catalog from a zero-result cursor page and provide first-page recovery when page info indicates prior products in `app/routes/app.products.tsx` per the catalog-change edge case (partial).
