import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../../shopify.server";
import type { ProductsPageQuery, ProductsPageQueryVariables } from "../../types/admin.generated";
import { parseProductPaginationParams } from "./pagination";
import type { ProductListItem, ProductPage, ProductsPageData } from "./types";

const PAGE_SIZE = 25;
const LOAD_ERROR = "We couldn't load products. Try again.";

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
              image { url altText }
            }
          }
        }
      }
      pageInfo { hasNextPage hasPreviousPage startCursor endCursor }
    }
  }
`;

type ProductNode = ProductsPageQuery["products"]["edges"][number]["node"];

function mapProduct(product: ProductNode): ProductListItem {
  const image = product.featuredMedia?.image;
  return {
    id: product.id,
    title: product.title,
    status: product.status,
    featuredImage: image ? { url: image.url, altText: image.altText ?? null } : null,
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

export async function loadProductsPage({ request }: LoaderFunctionArgs): Promise<ProductsPageData> {
  const { admin } = await authenticate.admin(request);
  const pagination = parseProductPaginationParams(new URL(request.url).searchParams);
  if (!pagination.ok) return { state: "error", message: pagination.message };

  const variables: ProductsPageQueryVariables = pagination.direction === "before"
    ? { last: PAGE_SIZE, before: pagination.cursor }
    : { first: PAGE_SIZE, ...(pagination.cursor ? { after: pagination.cursor } : {}) };

  try {
    const response = await admin.graphql(PRODUCTS_QUERY, { variables });
    if (!response.ok) return { state: "error", message: LOAD_ERROR };
    const payload = await response.json();
    if (("errors" in payload && (!Array.isArray(payload.errors) || payload.errors.length > 0)) || !payload.data) {
      return { state: "error", message: LOAD_ERROR };
    }
    return { state: "success", page: mapProductPage(payload.data.products) };
  } catch {
    return { state: "error", message: LOAD_ERROR };
  }
}
