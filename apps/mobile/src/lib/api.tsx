import { useAuth } from "@clerk/expo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import Constants from "expo-constants";
import { useEffect, useRef, useState } from "react";
import superjson from "superjson";
import type { AppRouter } from "@dct/api";

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

/**
 * The Next.js app serves the API. In development (Expo Go) we reuse the host of the
 * Metro dev server, so a phone on the same Wi-Fi reaches `next dev` on port 3000.
 */
export function getApiUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL;
  if (configured) return configured.replace(/\/$/, "");
  const host = Constants.expoConfig?.hostUri?.split(":")[0] ?? "localhost";
  return `http://${host}:3000`;
}

export function ApiProvider({ children }: { children: React.ReactNode }) {
  const { getToken, orgId, userId } = useAuth();
  // Keep the latest getToken in a ref so the client is created once.
  const getTokenRef = useRef(getToken);
  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } }),
  );
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: `${getApiUrl()}/api/trpc`,
          transformer: superjson,
          async headers() {
            const token = await getTokenRef.current();
            return token ? { Authorization: `Bearer ${token}` } : {};
          },
        }),
      ],
    }),
  );

  // A different user or organization means different data.
  const scope = `${userId ?? ""}:${orgId ?? ""}`;
  const lastScope = useRef(scope);
  useEffect(() => {
    if (lastScope.current !== scope) {
      lastScope.current = scope;
      queryClient.clear();
    }
  }, [scope, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
