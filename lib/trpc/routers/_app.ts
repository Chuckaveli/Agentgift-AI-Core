import { router } from "../server"
import { userRouter } from "./user"
import { featuresRouter } from "./features"
import { giftsRouter } from "./gifts"

export const appRouter = router({
  user: userRouter,
  features: featuresRouter,
  gifts: giftsRouter,
})

export type AppRouter = typeof appRouter
