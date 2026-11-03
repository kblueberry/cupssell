# Feature Specification: Products Page

**Feature Branch**: `001-products-page`

**Created**: 2026-11-02

**Status**: Draft

**Input**: User description: "Add a Products page that loads products via Admin GraphQL in a route loader and shows them in a Polaris table or list. Show title, status, optional image, loading, error and empty states, cursor-based Next/Previous pagination, and typed GraphQL response data without any."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse store products (Priority: P1)

As a merchant, I can open the Products page and see product titles, statuses, and available images so I can review my store catalog.

**Why this priority**: The catalog list is the core value of this page.

**Independent Test**: Open the Products page for a store with products and verify the first page displays their title and status, and displays an image only when one is available.

**Acceptance Scenarios**:

1. **Given** the store has products, **When** the merchant opens Products, **Then** the page lists product titles and statuses, with available product images.
2. **Given** the store has no products, **When** the merchant opens Products, **Then** a clear empty state is displayed.

### User Story 2 - Navigate product pages (Priority: P2)

As a merchant with a larger catalog, I can move forward and backward through product pages without losing my place.

**Why this priority**: Pagination makes the page usable for catalogs larger than one result page.

**Independent Test**: Use a store with more than one result page and verify Next and Previous load the adjacent pages without duplicates or gaps.

**Acceptance Scenarios**:

1. **Given** another page exists, **When** the merchant selects Next, **Then** the following cursor page is displayed.
2. **Given** a previous page exists, **When** the merchant selects Previous, **Then** the preceding cursor page is displayed.
3. **Given** the first or last page is displayed, **When** the merchant views pagination controls, **Then** Previous or Next is unavailable respectively.

### User Story 3 - Understand loading and failures (Priority: P1)

As a merchant, I receive visible feedback while products load and a useful error state if Shopify cannot provide them.

**Why this priority**: Feedback prevents blank or confusing screens when the network or API is slow or unavailable.

**Independent Test**: Delay or fail the products request and verify a loading indicator appears while pending and an error message appears on failure.

**Acceptance Scenarios**:

1. **Given** the products request is pending, **When** the page is loading, **Then** a visible loading state is shown.
2. **Given** the Admin API request fails, **When** the response is handled, **Then** the page shows a clear error state rather than a blank screen.

## Edge Cases

- The final page may contain fewer than the page size, including zero products after catalog changes.
- A product may not have a featured image; the row remains readable without an image.
- Shopify may return GraphQL errors in an otherwise successful HTTP response.
- Cursor parameters may be absent or malformed; absent cursors load the first page and invalid cursors show an error with a way to return to the first page.
- Authentication redirects are handled by the existing Shopify app authentication flow.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Products page MUST be reachable from the embedded app navigation.
- **FR-002**: The page MUST fetch products on the server through an authenticated route loader using Shopify Admin GraphQL.
- **FR-003**: Each product entry MUST show its title and status, and MUST show its image when one is available.
- **FR-004**: The page MUST show a visible loading state while the route loader is pending.
- **FR-005**: The page MUST show a user-visible error state when the product API request or response fails.
- **FR-006**: The page MUST show an empty state when the store has no products.
- **FR-007**: The page MUST support cursor-based Next and Previous navigation and disable each direction when no page exists in that direction.
- **FR-008**: GraphQL response data and loader data MUST use TypeScript types without `any`.
- **FR-009**: The product query MUST request only the fields needed to render the list and pagination controls.

### Key Entities *(include if feature involves data)*

- **Product list item**: Product identifier, title, status, and optional featured image URL and alt text.
- **Product page**: An ordered set of product list items plus page availability and cursor information for forward or backward navigation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A merchant can identify each listed product by title and status on the first page without opening a separate detail view.
- **SC-002**: Stores with no products receive a clear empty state; stores with products receive a list; API failures receive an error state.
- **SC-003**: For catalogs spanning multiple result pages, merchants can navigate forward and backward using cursor-based controls.
- **SC-004**: Product GraphQL response and loader data compile with explicit TypeScript types and no `any` usage in the feature.

## Assumptions

- The existing authenticated `/app` layout will provide the embedded navigation context.
- A fixed, bounded page size is appropriate for the initial feature; selecting or changing page size is out of scope.
- The existing Polaris web component setup is the intended UI pattern; a Polaris `s-table` or equivalent list will be used.
- Shopify's Admin GraphQL products connection supports both forward and backward cursor pagination for this query.
- The Shopify AI Toolkit is installed in the agent host for future implementation guidance; no toolkit dependency is added to the repository.
