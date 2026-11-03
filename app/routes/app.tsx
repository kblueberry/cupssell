import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import {
  Outlet,
  useLoaderData,
  useNavigation,
  useRouteError,
} from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";

import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  // eslint-disable-next-line no-undef
  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export function AppLayoutView({
  apiKey,
  pending,
  children,
}: {
  apiKey: string;
  pending: boolean;
  children: React.ReactNode;
}) {
  return (
    <AppProvider apiKey={apiKey}>
      <s-app-nav>
        <s-link href="/app">Home</s-link>
        <s-link href="/app/products">Products</s-link>
        <s-link href="/app/additional">Additional page</s-link>
      </s-app-nav>
      <PendingNavigationStatus pending={pending} />
      {children}
    </AppProvider>
  );
}

export function PendingNavigationStatus({ pending }: { pending: boolean }) {
  return pending ? (
    <s-section>
      <div role="status" aria-live="polite">
        <s-text>Loading page…</s-text>
      </div>
    </s-section>
  ) : null;
}

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  return (
    <AppLayoutView apiKey={apiKey} pending={navigation.state !== "idle"}>
      <Outlet />
    </AppLayoutView>
  );
}

// Shopify needs React Router to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
