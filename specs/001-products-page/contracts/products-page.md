# Products Page UI Contract

## Route

- Path: `/app/products`
- Surface: embedded Shopify Admin app under the existing authenticated `/app` layout
- Entry: Products item in app navigation

## Loader Contract

- Authenticates the request with `authenticate.admin(request)` before calling Admin GraphQL.
- Accepts an optional URL cursor and direction (`after`/forward or `before`/backward).
- Returns a typed success state containing product rows and `PageInfo`, or a typed failure
  state with a user-safe message.
- Returns product ID, title, status, featured image URL/alt text when present, and only the
  cursor fields needed to render navigation.
- A successful response with zero rows represents the empty catalog state.
- Authentication redirects continue through the existing Shopify authentication handling.

## UI Contract

- Shows title, status, and optional thumbnail for each product.
- Uses the Polaris table's loading state during pending loader navigation.
- Shows a visible error state for Admin API and GraphQL failures, with a way to retry.
- Shows a visible empty state for a successful response with no products.
- Shows Next and Previous controls only when their page-info flags and required cursor are
  present; controls navigate with URL cursors.
- Uses Polaris web components consistent with existing app routes.

## Type Contract

- The GraphQL operation is declared in a `#graphql` tagged TypeScript string so the existing
  Shopify codegen preset generates operation variable and result types.
- No `any` is introduced in operation, parsed response, loader, or component data types.
