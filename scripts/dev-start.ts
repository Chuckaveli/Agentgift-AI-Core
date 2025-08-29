import { spawn } from "child_process"
import dotenv from "dotenv"

// Load environment variables
dotenv.config({ path: ".env.local" })

async function runConfigCheck(): Promise<boolean> {
  return new Promise((resolve) => {
    console.log("🚀 Starting AgentGift.ai Development Server...\n")

    const configCheck = spawn("npx", ["tsx", "scripts/verify-config.ts"], {
      stdio: "inherit",
      shell: true,
    })

    configCheck.on("close", (code) => {
      resolve(code === 0)
    })
  })
}

async function startDevServer() {
  const configValid = await runConfigCheck()

  if (!configValid) {
    console.log("\n❌ Configuration check failed!")
    console.log("Please fix the configuration issues before starting the development server.")
    process.exit(1)
  }

  console.log("\n✅ Configuration check passed!")
  console.log("🚀 Starting Next.js development server...\n")

  // Start the Next.js development server
  const devServer = spawn("npm", ["run", "dev"], {
    stdio: "inherit",
    shell: true,
  })

  devServer.on("close", (code) => {
    console.log(`Development server exited with code ${code}`)
    process.exit(code || 0)
  })

  // Handle process termination
  process.on("SIGINT", () => {
    console.log("\n🛑 Shutting down development server...")
    devServer.kill("SIGINT")
  })

  process.on("SIGTERM", () => {
    console.log("\n🛑 Shutting down development server...")
    devServer.kill("SIGTERM")
  })
}

// Start the development process
startDevServer().catch((error) => {
  console.error("❌ Failed to start development server:", error)
  process.exit(1)
})
