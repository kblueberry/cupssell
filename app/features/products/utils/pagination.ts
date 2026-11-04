export type ProductPagination =
  | { ok: true; direction: "after" | "before" | null; cursor: string | null }
  | { ok: false; message: string };

export function parseProductPaginationParams(
  searchParams: URLSearchParams,
): ProductPagination {
  const afterCursors = searchParams.getAll("after");
  const beforeCursors = searchParams.getAll("before");

  if (afterCursors.length > 1 || beforeCursors.length > 1) {
    return { ok: false, message: "The pagination cursor is invalid. Return to the first page and try again." };
  }
  if (afterCursors.length > 0 && beforeCursors.length > 0) {
    return { ok: false, message: "Choose either the next or previous page cursor, not both." };
  }

  const direction = afterCursors.length > 0 ? "after" : beforeCursors.length > 0 ? "before" : null;
  const cursor = direction === "after" ? afterCursors[0] : direction === "before" ? beforeCursors[0] : null;

  if (cursor !== null && cursor.trim().length === 0) {
    return { ok: false, message: "The pagination cursor is empty. Return to the first page and try again." };
  }
  if (cursor !== null && cursor.length > 2048) {
    return { ok: false, message: "The pagination cursor is too long. Return to the first page and try again." };
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
  if (direction && cursor) params.set(direction, cursor);
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}
