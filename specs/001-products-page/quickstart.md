# Quickstart: Products Page

Use this guide during implementation review to validate the feature end to end. It does not
install dependencies or modify store data.

## Prerequisites

- Node.js version supported by the repository (`>=22.12`).
- Shopify CLI and a development store connected to this app.
- App scopes configured to permit reading products; reinstall or update the app if Shopify
  requires a new scope grant.
- A development store containing products, plus access to an empty store or a way to remove
  all products for the empty-state scenario.

## Validation

1. Start the app with `npm run dev` and open the embedded app in the development store.
2. Select **Products** in app navigation.
3. Confirm each row shows product title and status and shows a thumbnail when available.
4. With more than 25 products, select **Next** and confirm the next cursor page appears;
   select **Previous** and confirm the prior page returns.
5. Confirm Previous is unavailable on the first page and Next is unavailable on the last.
6. In an empty store, confirm a clear empty state appears.
7. Simulate a GraphQL/API failure in a controlled development environment and confirm the
   page renders its error state and retry action rather than a blank screen.
8. During a delayed page navigation, confirm the table's loading state appears while current
   rows remain stable.
9. Run `npm run graphql-codegen`, `npm run typecheck`, `npm run lint`, and `npm run build`.
   Confirm generated operation types are used and no `any` is present in the feature code.

## Related Design

- See [Products Page UI Contract](contracts/products-page.md) for route and loader behavior.
- See [Data Model](data-model.md) for row, page, and validation fields.
