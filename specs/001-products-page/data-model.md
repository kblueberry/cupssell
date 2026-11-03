# Data Model: Products Page

## Product List Item

Represents the subset of one Shopify product displayed in a result row.

| Field | Type | Required | Source / Use |
| --- | --- | --- | --- |
| `id` | Shopify global ID (`string`) | Yes | Stable React key for the row |
| `title` | `string` | Yes | Primary product label |
| `status` | Shopify `ProductStatus` enum | Yes | Status badge or text |
| `featuredImage` | object or `null` | No | Optional product preview |
| `featuredImage.url` | `string` | When image exists | Thumbnail source |
| `featuredImage.altText` | `string` or `null` | No | Accessible thumbnail description |

The GraphQL generated operation result is the source type. Loader output can map to a
presentation type that keeps image absence explicit and does not expose unused Shopify
fields.

## Product Page

Represents one cursor page of product list items.

| Field | Type | Required | Source / Use |
| --- | --- | --- | --- |
| `products` | `ProductListItem[]` | Yes | Rows to render |
| `hasNextPage` | `boolean` | Yes | Enables Next |
| `hasPreviousPage` | `boolean` | Yes | Enables Previous |
| `startCursor` | `string` or `null` | Yes | Cursor supplied to Previous |
| `endCursor` | `string` or `null` | Yes | Cursor supplied to Next |

The page state is a discriminated union: success contains the product page; failure contains
a user-safe message. An empty success page renders the empty state. Pagination direction and
cursor come from URL search parameters and are not persisted in a separate store.

## Validation Rules

- Request at most 25 products per page.
- A cursor is optional for the first page and must be passed only with the matching forward
  (`after`) or backward (`before`) direction.
- Next is available only when `hasNextPage` is true and an end cursor exists.
- Previous is available only when `hasPreviousPage` is true and a start cursor exists.
- Missing featured image data is valid and does not prevent the row from rendering.
- GraphQL errors or non-successful transport responses are failures, not empty results.
