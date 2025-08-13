import { router } from "./context"
import { userRouter } from "./routers/user"
import { featuresRouter } from "./routers/features"
import { giftsRouter } from "./routers/gifts"
import { messagesRouter } from "./routers/messages"
import { jobsRouter } from "./routers/jobs"
import { ttsRouter } from "./routers/tts"

export const appRouter = router({
  user: userRouter,
  features: featuresRouter,
  gifts: giftsRouter,
  messages: messagesRouter,
  jobs: jobsRouter,
  tts: ttsRouter,
})

export type AppRouter = typeof appRouter
