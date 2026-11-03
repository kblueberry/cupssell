import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import {
  useLoaderData,
  useLocation,
  useNavigate,
  useNavigation,
  useRouteError,
} from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";

import { authenticate } from "../shopify.server";
import type {
  ProductsPageQuery,
  ProductsPageQueryVariables,
} from "../types/admin.generated";

const PAGE_SIZE = 25;
const PRODUCTS_QUERY = `#graphql
  query ProductsPage($first: Int, $after: String, $last: Int, $before: String) {
    products(first: $first, after: $after, last: $last, before: $before) {
      edges {
        node {
          id
          title
          status
          featuredMedia {
            ... on MediaImage {
              image {
                url
                altText
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

type ProductNode = ProductsPageQuery["products"]["edges"][number]["node"];

export type ProductStatus = `${ProductNode["status"]}`;

export interface ProductListItem {
  id: string;
  title: string;
  status: ProductStatus;
  featuredImage: {
    url: string;
    altText: string | null;
  } | null;
}

export interface ProductPageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface ProductPage {
  products: ProductListItem[];
  pageInfo: ProductPageInfo;
}

export type ProductsPageData =
  | { state: "success"; page: ProductPage }
  | { state: "error"; message: string };

export type ProductPagination =
  | { ok: true; direction: "after" | "before" | null; cursor: string | null }
  | { ok: false; message: string };

const LOAD_ERROR = "We couldn't load products. Try again.";

function mapProduct(product: ProductNode): ProductListItem {
  const image = product.featuredMedia?.image;
  return {
    id: product.id,
    title: product.title,
    status: product.status,
    featuredImage: image
      ? { url: image.url, altText: image.altText ?? null }
      : null,
  };
}

function mapProductPage(connection: ProductsPageQuery["products"]): ProductPage {
  return {
    products: connection.edges.map(({ node }) => mapProduct(node)),
    pageInfo: {
      hasNextPage: connection.pageInfo.hasNextPage,
      hasPreviousPage: connection.pageInfo.hasPreviousPage,
      startCursor: connection.pageInfo.startCursor ?? null,
      endCursor: connection.pageInfo.endCursor ?? null,
    },
  };
}

export function parseProductPaginationParams(
  searchParams: URLSearchParams,
): ProductPagination {
  const afterCursors = searchParams.getAll("after");
  const beforeCursors = searchParams.getAll("before");

  if (afterCursors.length > 1 || beforeCursors.length > 1) {
    return {
      ok: false,
      message:
        "The pagination cursor is invalid. Return to the first page and try again.",
    };
  }

  if (afterCursors.length > 0 && beforeCursors.length > 0) {
    return {
      ok: false,
      message: "Choose either the next or previous page cursor, not both.",
    };
  }

  const direction =
    afterCursors.length > 0
      ? "after"
      : beforeCursors.length > 0
        ? "before"
        : null;
  const cursor =
    direction === "after"
      ? afterCursors[0]
      : direction === "before"
        ? beforeCursors[0]
        : null;

  if (cursor !== null && cursor.trim().length === 0) {
    return {
      ok: false,
      message:
        "The pagination cursor is empty. Return to the first page and try again.",
    };
  }

  if (cursor !== null && cursor.length > 2048) {
    return {
      ok: false,
      message:
        "The pagination cursor is too long. Return to the first page and try again.",
    };
  }

  return { ok: true, direction, cursor };
}

export function createProductsPageUrl(
  pathname: string,
  search: string,
  direction: "after" | "before" | null,
  cursor: string | null,
): string {
  const params = new URLSearchParams(search);
  params.delete("after");
  params.delete("before");

  if (direction && cursor) {
    params.set(direction, cursor);
  }

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const pagination = parseProductPaginationParams(
    new URL(request.url).searchParams,
  );

  if (pagination.ok === false) {
    return { state: "error", message: pagination.message } satisfies ProductsPageData;
  }

  const variables: ProductsPageQueryVariables =
    pagination.direction === "before"
      ? { last: PAGE_SIZE, before: pagination.cursor }
      : {
          first: PAGE_SIZE,
          ...(pagination.cursor ? { after: pagination.cursor } : {}),
        };

  try {
    const response = await admin.graphql(PRODUCTS_QUERY, { variables });
    if (!response.ok) {
      return { state: "error", message: LOAD_ERROR } satisfies ProductsPageData;
    }

    const payload = await response.json();
    if (
      ("errors" in payload &&
        (!Array.isArray(payload.errors) || payload.errors.length > 0)) ||
      !payload.data
    ) {
      return { state: "error", message: LOAD_ERROR } satisfies ProductsPageData;
    }

    return {
      state: "success",
      page: mapProductPage(payload.data.products),
    } satisfies ProductsPageData;
  } catch {
    return { state: "error", message: LOAD_ERROR } satisfies ProductsPageData;
  }
};

interface ProductsViewProps {
  data: ProductsPageData;
  loading: boolean;
  retryHref: string;
  firstPageHref: string;
  onNextPage: () => void;
  onPreviousPage: () => void;
}

export function ProductsView({
  data,
  loading,
  retryHref,
  firstPageHref,
  onNextPage,
  onPreviousPage,
}: ProductsViewProps) {
  if (data.state === "error") {
    return (
      <s-page heading="Products">
        <s-section>
          <s-banner heading="Couldn't load products" tone="critical">
            <s-paragraph>{data.message}</s-paragraph>
            {loading ? (
              <s-spinner size="base" accessibilityLabel="Retrying products" />
            ) : null}
            <s-button
              slot="secondary-actions"
              variant="secondary"
              href={retryHref}
            >
              Retry
            </s-button>
            <s-button
              slot="secondary-actions"
              variant="primary"
              href={firstPageHref}
            >
              First page
            </s-button>
          </s-banner>
        </s-section>
      </s-page>
    );
  }

  if (data.page.products.length === 0) {
    return (
      <s-page heading="Products">
        <s-section>
          <s-empty-state heading="No products yet">
            <s-text slot="subheading">
              Products from your Shopify store will appear here.
            </s-text>
          </s-empty-state>
        </s-section>
      </s-page>
    );
  }

  const { page } = data;
  const hasNextPage =
    page.pageInfo.hasNextPage && page.pageInfo.endCursor !== null;
  const hasPreviousPage =
    page.pageInfo.hasPreviousPage && page.pageInfo.startCursor !== null;

  return (
    <s-page heading="Products">
      <s-section heading="Product catalog">
        <s-table
          paginate
          loading={loading}
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
          onNextPage={onNextPage}
          onPreviousPage={onPreviousPage}
        >
          <s-table-header-row>
            <s-table-header listSlot="primary">Product</s-table-header>
            <s-table-header listSlot="labeled">Status</s-table-header>
          </s-table-header-row>
          <s-table-body>
            {page.products.map((product) => (
              <s-table-row key={product.id}>
                <s-table-cell>
                  {product.featuredImage ? (
                    <s-thumbnail
                      src={product.featuredImage.url}
                      alt={product.featuredImage.altText || product.title}
                      size="small"
                    />
                  ) : null}
                  <s-text type="strong">{product.title}</s-text>
                </s-table-cell>
                <s-table-cell>
                  <s-badge>
                    {product.status.charAt(0) +
                      product.status.slice(1).toLowerCase()}
                  </s-badge>
                </s-table-cell>
              </s-table-row>
            ))}
          </s-table-body>
        </s-table>
      </s-section>
    </s-page>
  );
}

export default function ProductsRoute() {
  const data = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const location = useLocation();
  const navigate = useNavigate();
  const loading = navigation.state !== "idle";
  const retryHref = `${location.pathname}${location.search}`;
  const firstPageHref = createProductsPageUrl(
    location.pathname,
    location.search,
    null,
    null,
  );

  const onNextPage = () => {
    if (
      data.state === "success" &&
      data.page.pageInfo.hasNextPage &&
      data.page.pageInfo.endCursor
    ) {
      void navigate(
        createProductsPageUrl(
          location.pathname,
          location.search,
          "after",
          data.page.pageInfo.endCursor,
        ),
      );
    }
  };

  const onPreviousPage = () => {
    if (
      data.state === "success" &&
      data.page.pageInfo.hasPreviousPage &&
      data.page.pageInfo.startCursor
    ) {
      void navigate(
        createProductsPageUrl(
          location.pathname,
          location.search,
          "before",
          data.page.pageInfo.startCursor,
        ),
      );
    }
  };

  return (
    <ProductsView
      data={data}
      loading={loading}
      retryHref={retryHref}
      firstPageHref={firstPageHref}
      onNextPage={onNextPage}
      onPreviousPage={onPreviousPage}
    />
  );
}

export function HydrateFallback() {
  return (
    <s-page heading="Products">
      <s-section>
        <s-spinner size="base" accessibilityLabel="Loading products" />
      </s-section>
    </s-page>
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
