'use client'

import { useEffect, useRef } from 'react'

export default function IPhoneMockup() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    // Résolution interne réduite pour la perf (CSS gère le scaling)
    const W = 960
    const H = 540
    canvas.width = W
    canvas.height = H

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    let rafId: number

    function processFrame() {
      if (!video || !ctx || video.readyState < 2) {
        rafId = requestAnimationFrame(processFrame)
        return
      }

      ctx.drawImage(video, 0, 0, W, H)
      const img = ctx.getImageData(0, 0, W, H)
      const d = img.data

      for (let i = 0; i < d.length; i += 4) {
        const r = d[i]
        const g = d[i + 1]
        const b = d[i + 2]

        // Détecte le fond : sombre + teinte bleue/sombre
        // Le fond vidéo est environ rgb(15–50, 20–55, 40–90)
        const brightness = (r + g + b) / 3
        const isBackground = brightness < 80 && b > r * 0.8

        if (isBackground) {
          // Suppression progressive (anti-aliasing)
          const alpha = Math.max(0, (brightness - 20) / 60)
          d[i + 3] = Math.floor(alpha * 255)
        }
      }

      ctx.putImageData(img, 0, 0)
      rafId = requestAnimationFrame(processFrame)
    }

    video.addEventListener('play', processFrame)
    if (!video.paused) processFrame()

    return () => {
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div style={{ width: '100%', maxWidth: '680px', aspectRatio: '16 / 9', position: 'relative', zIndex: 20 }}>
      {/* Vidéo cachée — source pour le canvas */}
      <video
        ref={videoRef}
        src="/videos/VIDEO_FOND_MYCRMPRO.mp4"
        autoPlay
        loop
        muted
        playsInline
        style={{ display: 'none' }}
      />
      {/* Canvas avec fond supprimé */}
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
    </div>
  )
}
