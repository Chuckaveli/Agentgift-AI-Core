import { middleware } from "@/middleware"
import { protectedRoutes } from "@/lib/protected-routes"

jest.mock(
  "@supabase/auth-helpers-nextjs",
  () => ({
    createMiddlewareClient: () => ({
      auth: {
        getSession: () => Promise.resolve({ data: { session: null } }),
      },
    }),
  }),
  { virtual: true }
)

beforeAll(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost"
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon"
})

describe("middleware protected routes", () => {
  for (const route of protectedRoutes) {
    test(`redirects unauthenticated access to ${route}`, async () => {
      const req = {
        nextUrl: { pathname: route },
        url: `http://localhost${route}`,
        headers: new Headers(),
      } as any

      const res = await middleware(req)
      expect(res.status).toBe(307)
      const expected = `http://localhost/auth/signin?redirectTo=${encodeURIComponent(route)}`
      expect(res.headers.get("location")).toBe(expected)
    })
  }
})
