"use client";

import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Toaster, toast } from "sonner";
import { NotificationListener } from "@/components/NotificationListener";
import { getToastErrorMessage } from "@/lib/toast";

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        mutationCache: new MutationCache({
          onSuccess: (_data, _variables, _context, mutation) => {
            const message = mutation.options.meta?.successMessage;
            if (typeof message === "string") toast.success(message);
          },
          onError: (error, _variables, _context, mutation) => {
            if (mutation.options.meta?.toastError !== false) {
              toast.error(getToastErrorMessage(error));
            }
          },
        }),
        defaultOptions: {
          queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      <Toaster
        theme="dark"
        position="top-right"
        richColors
        closeButton
        duration={4000}
      />
      <NotificationListener />
      {children}
    </QueryClientProvider>
  );
}
