import { httpBatchLink } from "@trpc/client"
import superjson from "superjson"

export function makeTrpcClient() {
  return {
    links: [
      httpBatchLink({
        url: "/api/trpc", // same origin
        transformer: superjson,
      }),
    ],
    transformer: superjson,
  }
}
