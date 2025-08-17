export const telemetry = {
  async capture(event: string, payload?: Record<string, any>) {
    try {
      await fetch("/api/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event, payload }),
      });
    } catch {
      // ignore
    }
  },
};
