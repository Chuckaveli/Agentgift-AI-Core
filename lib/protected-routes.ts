export const protectedRoutes = [
  "/dashboard",
  "/admin",
  "/settings",
  "/agent-gifty",
  "/smart-search",
  "/gift-dna",
  "/badges",
  "/emotitokens",
  "/agentvault",
  "/assistants",
  "/registry",
] as const

export type ProtectedRoute = typeof protectedRoutes[number]
