"use client";

import React from "react";

/**
 * LottieStatus
 * Shows exactly one of three Lottie states:
 *  - userListening  (when user is typing)
 *  - aiThinking     (waiting on backend)
 *  - aiSpeaking     (tokens streaming / just finished)
 *
 * Uses the official LottieFiles web component so we can load your
 * public share URLs directly without hosting JSON locally.
 *
 * Fallbacks: emoji + caption if the component fails or user prefers reduced motion.
 */

// Load the web component once on client
if (typeof window !== "undefined") {
  import("@lottiefiles/lottie-player");
}

type LottieState = "idle" | "userListening" | "aiThinking" | "aiSpeaking";

export interface LottieStatusProps {
  state: LottieState;
  className?: string;
}

const SRC = {
  userListening: "https://app.lottiefiles.com/share/105572d0-39ba-4ac1-a98b-919ec046926c",
  aiThinking: "https://app.lottiefiles.com/share/dfb79e3c-a1b8-4bd5-a2d7-2d34eddcadc9",
  aiSpeaking: "https://app.lottiefiles.com/share/6ff2e240-1dfb-42f3-99c7-727df933897d",
} as const;

const CAPTION: Record<LottieState, string> = {
  idle: "",
  userListening: "Listening…",
  aiThinking: "Thinking…",
  aiSpeaking: "Responding…",
};

const EMOJI: Record<LottieState, string> = {
  idle: "",
  userListening: "💬",
  aiThinking: "✨",
  aiSpeaking: "🎙️",
};

export function LottieStatus({ state, className = "" }: LottieStatusProps) {
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const show = state !== "idle";
  const caption = CAPTION[state];
  const emoji = EMOJI[state];

  // Choose animation source + loop behavior
  const src =
    state === "userListening"
      ? SRC.userListening
      : state === "aiThinking"
      ? SRC.aiThinking
      : state === "aiSpeaking"
      ? SRC.aiSpeaking
      : undefined;

  const loop = state === "aiSpeaking" ? false : true;

  return (
    <div
      className={[
        "w-full flex flex-col items-center justify-center select-none",
        "transition-opacity duration-150",
        show ? "opacity-100" : "opacity-0 pointer-events-none",
        className,
      ].join(" ")}
    >
      {/* Glowy brand aura */}
      <div
        className={[
          "relative flex items-center justify-center",
          "rounded-2xl p-4",
          show ? "shadow-[0_0_60px_10px_rgba(168,85,247,0.25)]" : "",
        ].join(" ")}
      >
        {/* Prefer reduced motion → emoji fallback */}
        {reducedMotion || !src ? (
          <div className="text-5xl">{emoji}</div>
        ) : (
          // @ts-expect-error: web component
          <lottie-player
            autoplay
            loop={loop}
            mode="normal"
            src={src}
            style={{ width: "140px", height: "140px" }}
            // pulse slightly during aiSpeaking
            class={state === "aiSpeaking" ? "animate-pulse" : ""}
          />
        )}
      </div>

      {/* Caption with polite live region for screen readers */}
      {caption ? (
        <div
          aria-live="polite"
          className="mt-2 text-sm text-gray-600 dark:text-gray-300 transition-opacity duration-150"
        >
          {caption}
        </div>
      ) : null}
    </div>
  );
}

export default LottieStatus;
