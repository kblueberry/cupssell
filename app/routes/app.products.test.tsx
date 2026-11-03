import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { authenticate } from "../shopify.server";
import { createProductsPageUrl } from "../features/products/pagination";
import type { ProductPage } from "../features/products/types";
import {
  loader,
  ProductsView,
} from "./app.products";

vi.mock("../shopify.server", () => ({
  authenticate: {
    admin: vi.fn(),
  },
}));

const adminGraphql = vi.fn<
  (
    query: string,
    options?: { variables?: Record<string, number | string | null> },
  ) => Promise<Response>
>();

const firstPage: ProductPage = {
  products: [
    {
      id: "gid://shopify/Product/1",
      title: "Canvas Tote",
      status: "ACTIVE",
      featuredImage: {
        url: "https://cdn.example.com/tote.jpg",
        altText: "Natural canvas tote bag",
      },
    },
    {
      id: "gid://shopify/Product/2",
      title: "Ceramic Cup",
      status: "DRAFT",
      featuredImage: null,
    },
  ],
  pageInfo: {
    hasNextPage: true,
    hasPreviousPage: false,
    startCursor: "start-cursor",
    endCursor: "end-cursor",
  },
};

function graphqlPayload(page: ProductPage) {
  return {
    data: {
      products: {
        edges: page.products.map(({ featuredImage, ...product }) => ({
          node: {
            ...product,
            featuredMedia: featuredImage ? { image: featuredImage } : null,
          },
        })),
        pageInfo: page.pageInfo,
      },
    },
  };
}

function mockSuccessfulGraphql(page: ProductPage) {
  adminGraphql.mockResolvedValue(
    new Response(JSON.stringify(graphqlPayload(page)), { status: 200 }),
  );
}

function invokeLoader(url = "https://example.com/app/products") {
  return loader({
    request: new Request(url),
    params: {},
    context: {},
  } as Parameters<typeof loader>[0]);
}

function renderProducts(
  data: Parameters<typeof ProductsView>[0]["data"],
  loading = false,
) {
  return renderToStaticMarkup(
    createElement(ProductsView, {
      data,
      loading,
      retryHref: "/app/products",
      firstPageHref: "/app/products",
      onNextPage: () => undefined,
      onPreviousPage: () => undefined,
    }),
  );
}

describe("Products route loader", () => {
  beforeEach(() => {
    adminGraphql.mockReset();
    vi.mocked(authenticate.admin).mockResolvedValue({
      admin: { graphql: adminGraphql },
    } as never);
  });

  it("maps products and page information from the Admin GraphQL response", async () => {
    mockSuccessfulGraphql(firstPage);

    const result = await invokeLoader();

    expect(result).toEqual({ state: "success", page: firstPage });
    expect(adminGraphql).toHaveBeenCalledTimes(1);
  });

  it("returns an empty success page for a store without products", async () => {
    const emptyPage: ProductPage = {
      products: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
    };
    mockSuccessfulGraphql(emptyPage);

    const result = await invokeLoader();

    expect(result).toEqual({ state: "success", page: emptyPage });
  });
});

describe("Products page rendering", () => {
  it("renders titles, statuses, and only available images", () => {
    const markup = renderProducts({ state: "success", page: firstPage });

    expect(markup).toContain("Canvas Tote");
    expect(markup).toContain("Active");
    expect(markup).toContain('alt="Natural canvas tote bag"');
    expect(markup).toContain("Ceramic Cup");
    expect(markup).toContain("Draft");
    expect(markup).not.toContain("alt=\"Ceramic Cup\"");
  });

  it("renders a clear empty state", () => {
    const markup = renderProducts({
      state: "success",
      page: { ...firstPage, products: [] },
    });

    expect(markup).toContain("No products yet");
  });

  it("shows the table loading state while route navigation is pending", () => {
    const markup = renderProducts({ state: "success", page: firstPage }, true);

    expect(markup).toContain("loading");
    expect(markup).toContain("Canvas Tote");
  });
});

describe("Products pagination and failures", () => {
  beforeEach(() => {
    adminGraphql.mockReset();
    vi.mocked(authenticate.admin).mockResolvedValue({
      admin: { graphql: adminGraphql },
    } as never);
  });

  it("shows a retry action and a way back to the first page for errors", () => {
    const markup = renderProducts({
      state: "error",
      message: "We couldn't load products. Try again.",
    });

    expect(markup).toContain("We couldn&#x27;t load products. Try again.");
    expect(markup).toContain("Retry");
    expect(markup).toContain("First page");
  });

  it("maps transport failures to a visible error state", async () => {
    adminGraphql.mockResolvedValue(new Response("", { status: 503 }));

    await expect(invokeLoader()).resolves.toMatchObject({ state: "error" });
  });

  it("maps GraphQL errors to a visible error state", async () => {
    adminGraphql.mockResolvedValue(
      new Response(JSON.stringify({ errors: [{ message: "Access denied" }] }), {
        status: 200,
      }),
    );

    await expect(invokeLoader()).resolves.toMatchObject({ state: "error" });
  });

  it("uses forward and backward cursor variables for adjacent pages", async () => {
    mockSuccessfulGraphql(firstPage);
    await invokeLoader("https://example.com/app/products?after=end-cursor");

    expect(adminGraphql.mock.calls[0]?.[1]).toEqual({
      variables: { first: 25, after: "end-cursor" },
    });

    mockSuccessfulGraphql({
      ...firstPage,
      pageInfo: { ...firstPage.pageInfo, hasPreviousPage: true },
    });
    await invokeLoader("https://example.com/app/products?before=start-cursor");

    expect(adminGraphql.mock.calls[1]?.[1]).toEqual({
      variables: { last: 25, before: "start-cursor" },
    });
  });

  it("exposes only the available direction at page boundaries", () => {
    const firstPageMarkup = renderProducts({
      state: "success",
      page: firstPage,
    });
    const lastPageMarkup = renderProducts({
      state: "success",
      page: {
        ...firstPage,
        pageInfo: {
          ...firstPage.pageInfo,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      },
    });

    expect(firstPageMarkup).toContain('hasNextPage="true"');
    expect(firstPageMarkup).toContain('hasPreviousPage="false"');
    expect(lastPageMarkup).toContain('hasNextPage="false"');
    expect(lastPageMarkup).toContain('hasPreviousPage="true"');
  });

  it("rejects conflicting cursors and creates clean page URLs", async () => {
    const invalid = await invokeLoader(
      "https://example.com/app/products?after=next&before=previous",
    );

    expect(invalid).toMatchObject({ state: "error" });
    expect(adminGraphql).not.toHaveBeenCalled();
    expect(
      createProductsPageUrl("/app/products", "?after=next&filter=active", null, null),
    ).toBe("/app/products?filter=active");
    expect(
      createProductsPageUrl("/app/products", "?before=previous", "after", "next"),
    ).toBe("/app/products?after=next");
  });
});
