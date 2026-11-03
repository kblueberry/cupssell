# Research: Products Page

## Decision 1: Use the Admin GraphQL `products` connection

- **Decision**: Query products through the authenticated server-side Admin GraphQL client
  returned by `authenticate.admin(request)`. Request `id`, `title`, `status`, and
  `featuredImage { url altText }`, with connection cursors and `pageInfo`.
- **Rationale**: The existing React Router Shopify package provides this authentication
  pattern. Shopify documents `products` as a paginated connection intended for product
  catalog browsing.
- **Alternatives considered**: REST Admin API is excluded by the user request and is legacy
  for new public apps. Browser-side Admin API access would violate the server-loader
  requirement.
- **References**: [Shopify Admin GraphQL `products` query](https://shopify.dev/docs/api/admin-graphql/latest/queries/products),
  [React Router Admin GraphQL example](https://shopify.dev/docs/api/admin-graphql/latest).

## Decision 2: Use cursor pagination in both directions

- **Decision**: Use `first: 25` with `after` for Next and `last: 25` with `before` for
  Previous. Include `hasNextPage`, `hasPreviousPage`, `startCursor`, and `endCursor`; Next
  uses the current `endCursor`, Previous uses the current `startCursor`.
- **Rationale**: Shopify connections expose page information and cursors for forward and
  backward pagination. A bounded page limits response size and request cost.
- **Alternatives considered**: Offset/page-number pagination is not available for these
  Shopify GraphQL connections; loading the complete catalog is unbounded and unnecessary.
- **References**: [Shopify GraphQL pagination](https://shopify.dev/docs/api/usage/pagination-graphql).

## Decision 3: Use repository GraphQL code generation for operation types

- **Decision**: Put the operation in a `#graphql` string in the route and use the existing
  `npm run graphql-codegen` workflow. Consume generated operation result and variable types;
  avoid `any` and avoid maintaining an independent handwritten schema mirror.
- **Rationale**: `.graphqlrc.ts` already configures `@shopify/api-codegen-preset`, Admin API
  `ApiVersion.July26`, route documents, and `app/types` output. Shopify documents that tagged
  operations generate TypeScript variables and return types.
- **Alternatives considered**: Handwritten query-response types can drift from the schema;
  introducing another codegen configuration duplicates existing project setup.
- **References**: [Shopify typing GraphQL operations](https://shopify.dev/docs/api/shopify-app-remix/v2/guide-graphql-types),
  repository `.graphqlrc.ts`.

## Decision 4: Use Polaris `s-table` with built-in pagination and states

- **Decision**: Render the page with existing `s-page`, `s-section`, and `s-table` web
  components. Use `paginate`, `hasNextPage`, and `hasPreviousPage`, with `nextpage` and
  `previouspage` events to navigate using URL cursors. Bind React Router pending navigation
  state to the table's `loading` property. Use `s-empty-state` for empty results and
  `s-banner` for retryable errors. Add a `/app/products` navigation link to `app/routes/app.tsx`.
- **Rationale**: Current routes already use Polaris `s-` web components and embedded app
  navigation. `s-table` provides responsive table/list layouts, pagination controls, and a
  built-in loading state; Shopify recommends explicit empty and retryable error feedback.
- **Alternatives considered**: Adding `@shopify/polaris` would add an unneeded dependency and
  depart from the repository's existing component conventions.
- **References**: Existing `app/routes/app._index.tsx`; [Shopify table component](https://shopify.dev/docs/api/app-home/v1.0/web-components/layout-and-structure/table),
  [Shopify empty state](https://shopify.dev/docs/api/app-home/latest/web-components/feedback-and-status-indicators/empty-state),
  [Shopify banner](https://shopify.dev/docs/api/app-home/latest/web-components/feedback-and-status-indicators/banner).

## Decision 5: Keep failures in an explicit route UI state

- **Decision**: Represent expected Admin API and GraphQL failures as a typed error branch in
  loader data, while leaving authentication redirects and platform boundary errors to the
  Shopify route boundary. Render a visible error banner/message and a retry action.
- **Rationale**: This keeps API failures visible in the Products page and avoids relying on
  an unhandled exception that can appear as a blank route. The shared app boundary remains
  responsible for authentication and unexpected route failures.
- **Alternatives considered**: Silently returning an empty product list conflates failure
  with a genuinely empty store. Throwing every API error straight to a generic boundary
  gives less context in the feature page.
- **References**: [Shopify React Router Admin authentication](https://shopify.dev/docs/api/shopify-app-react-router/latest/guide-admin).

## Decision 6: Add focused automated tests with Vitest

- **Decision**: Add a minimal Vitest configuration and tests for cursor parameter mapping,
  loader success/error/empty behavior, and the rendered loading/empty/error/list states.
- **Rationale**: The constitution requires automated behavior coverage, while this repository
  currently has no test runner. Vitest is Vite-native and supports Node and browser-like test
  environments, fitting the existing Vite-based app with a small test setup.
- **Alternatives considered**: No tests would conflict with the constitution. A new browser
  end-to-end test stack is beyond the single-route scope. Confirm the installed Vite version
  remains compatible when selecting the Vitest version.
- **References**: [Vitest getting started](https://vitest.dev/guide/),
  [Vitest test environments](https://vitest.dev/guide/environment).

## Open Questions

None. Page size is fixed at 25 for the initial feature; changing it is outside scope.
