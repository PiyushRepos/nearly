import { SWRConfig } from "swr";
import { api } from "@/lib/api";

// Fetcher lives here but is not re-exported so fast-refresh stays happy.
// Import it via swr-fetcher.ts if you need it outside this file.
const swrFetcher = (url: string) => api.get(url).then((r) => r.data);

interface SWRProviderProps {
  children: React.ReactNode;
}

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        fetcher: swrFetcher,
        revalidateOnFocus: false,
        shouldRetryOnError: true,
        errorRetryCount: 2,
        errorRetryInterval: 3000,
      }}
    >
      {children}
    </SWRConfig>
  );
}
