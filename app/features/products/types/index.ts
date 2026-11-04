import type { ProductsPageQuery } from "../../../types/admin.generated";

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
