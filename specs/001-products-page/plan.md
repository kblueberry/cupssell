# Implementation Plan: Products Page

**Branch**: `001-products-page` | **Date**: 2026-11-02 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-products-page/spec.md`

## Summary

Add an embedded Products route using the existing React Router and Shopify app setup.
Authenticate in the route loader, query the Admin GraphQL `products` connection for a
bounded page of product fields, and expose typed page data to a Polaris `s-table` UI. URL
cursor and direction parameters drive forward and backward pagination. The page renders
loading, error, empty, and populated states.

## Technical Context

**Language/Version**: TypeScript 5.9; Node.js >=22.12

**Primary Dependencies**: React Router 7.18; `@shopify/shopify-app-react-router` 4.x;
Shopify Admin GraphQL; Polaris web components already used in the app

**Storage**: N/A; products remain in Shopify and are fetched per route request

**Testing**: The repository has `npm run typecheck`, `npm run lint`, and `npm run build`, but
no test runner. Add focused automated loader and UI state coverage using a minimal Vitest setup
as part of implementation, verify Vitest compatibility with the installed Vite version, then
run the repository quality gates.

**Target Platform**: Embedded Shopify Admin app, server-rendered React Router routes

**Project Type**: Shopify web application

**Performance Goals**: Fetch no more than 25 products per request; request only product
fields rendered by the list and cursor metadata; issue one Admin GraphQL request per page
navigation

**Constraints**: Admin API access must occur in the authenticated server loader. Use the
Shopify AI Toolkit for platform guidance. Keep API response, loader, and UI data explicitly
typed with no `any`. Do not add Shopify tooling to the repository.

**Scale/Scope**: One new `/app/products` route and one navigation link; product browsing is
limited to cursor pages, with no search, filtering, sorting, or product details in this scope.

## Constitution Check

- **Maintainable Code**: Pass. The route uses the repository's route conventions and keeps
  query/page mapping at the server boundary.
- **Reliable Testing**: Pass with a small test-infrastructure addition. Add automated behavior
  coverage for loader states, cursor direction, and rendering; include typed compilation.
- **Consistent User Experience**: Pass. Use existing embedded navigation and Polaris web
  components; provide loading, error, empty, and result states.
- **Measured Performance**: Pass. The page requests a bounded 25 products and only required
  fields; cursor requests avoid loading the full catalog.
- **Shopify Platform Alignment**: Pass. Use Toolkit guidance, `authenticate.admin`, and the
  versioned Admin GraphQL configuration already in the app.

## Project Structure

### Documentation (this feature)

```text
specs/001-products-page/
├── plan.md
├── research.md
├── data-model.md
├── contracts/
│   └── products-page.md
└── quickstart.md
```

### Source Code (repository root)

```text
app/
├── routes/
│   ├── app.tsx                 # Add Products navigation link
│   └── app.products.tsx        # New loader, states, and Products list route
├── shopify.server.ts           # Existing authentication and API version
└── types/                      # Existing GraphQL codegen output location
```

**Structure Decision**: Use the existing flat React Router route convention. The route
`app/routes/app.products.tsx` maps to `/app/products` and participates in the authenticated
`app` layout. Place the query in the route's `#graphql` tagged string so configured Shopify
GraphQL codegen can generate operation variable and result types into `app/types`. Configure
the minimal Vitest setup alongside this route to satisfy the project's automated testing
principle without introducing a broad test platform.

## Complexity Tracking

No constitution violations or additional architectural components are proposed.
