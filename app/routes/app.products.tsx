import type { HeadersFunction } from "react-router";
import {
  useLoaderData,
  useLocation,
  useNavigate,
  useNavigation,
  useRouteError,
} from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";

import { loadProductsPage } from "../features/products/api.server";
import { createProductsPageUrl } from "../features/products/pagination";
import type { ProductsPageData } from "../features/products/types";

export const loader = loadProductsPage;

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
