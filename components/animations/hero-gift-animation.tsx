"use client"

import { useEffect, useRef } from "react"
import lottie from "lottie-web"

export function HeroGiftAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      const animation = lottie.loadAnimation({
        container: containerRef.current,
        renderer: "svg",
        loop: true,
        autoplay: true,
        // Using a gift box animation data
        animationData: {
          v: "5.7.4",
          fr: 30,
          ip: 0,
          op: 90,
          w: 400,
          h: 400,
          nm: "Gift Animation",
          ddd: 0,
          assets: [],
          layers: [
            {
              ddd: 0,
              ind: 1,
              ty: 4,
              nm: "Gift Box",
              sr: 1,
              ks: {
                o: { a: 0, k: 100 },
                r: {
                  a: 1,
                  k: [
                    { i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 0, s: [0] },
                    { t: 90, s: [360] },
                  ],
                },
                p: { a: 0, k: [200, 200, 0] },
                a: { a: 0, k: [0, 0, 0] },
                s: {
                  a: 1,
                  k: [
                    { i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 0, s: [80, 80, 100] },
                    { i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 45, s: [120, 120, 100] },
                    { t: 90, s: [80, 80, 100] },
                  ],
                },
              },
              ao: 0,
              shapes: [
                {
                  ty: "gr",
                  it: [
                    {
                      ty: "rc",
                      d: 1,
                      s: { a: 0, k: [100, 100] },
                      p: { a: 0, k: [0, 0] },
                      r: { a: 0, k: 10 },
                    },
                    {
                      ty: "fl",
                      c: { a: 0, k: [0.8, 0.3, 0.9, 1] },
                      o: { a: 0, k: 100 },
                    },
                  ],
                },
              ],
              ip: 0,
              op: 90,
              st: 0,
            },
          ],
        },
      })

      return () => {
        animation.destroy()
      }
    }
  }, [])

  return (
    <div className="w-full max-w-md h-96 flex items-center justify-center">
      <div ref={containerRef} className="w-80 h-80" />
    </div>
  )
}
