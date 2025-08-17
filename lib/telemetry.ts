// lib/telemetry.ts
export const telemetry = {
  async capture(event: string, payload?: any) {
    try {
      await fetch("/api/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event, payload }),
      });
    } catch {}
  },
};
