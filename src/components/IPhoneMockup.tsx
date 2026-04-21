'use client'

import { useEffect, useRef } from 'react'

export default function IPhoneMockup() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    // Résolution interne réduite pour la performance
    const W = 960
    const H = 540
    canvas.width = W
    canvas.height = H

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    let rafId: number

    function processFrame() {
      if (!video || !ctx) return

      if (video.readyState < 2) {
        rafId = requestAnimationFrame(processFrame)
        return
      }

      ctx.clearRect(0, 0, W, H)
      ctx.drawImage(video, 0, 0, W, H)

      const img = ctx.getImageData(0, 0, W, H)
      const d = img.data

      for (let i = 0; i < d.length; i += 4) {
        const r = d[i]
        const g = d[i + 1]
        const b = d[i + 2]

        // Luminosité perceptuelle du pixel
        const lum = r * 0.299 + g * 0.587 + b * 0.114

        // Le fond de la vidéo est un dégradé bleu-noir sombre
        // Suppression progressive : < 30 → transparent, 30-90 → transition douce
        if (lum < 30) {
          d[i + 3] = 0
        } else if (lum < 90) {
          d[i + 3] = Math.floor(((lum - 30) / 60) * 255)
        }
        // > 90 : pixel conservé avec couleurs d'origine (alpha = 255 par défaut)
      }

      ctx.putImageData(img, 0, 0)
      rafId = requestAnimationFrame(processFrame)
    }

    // opacity:0 (pas display:none) → le navigateur joue quand même la vidéo
    processFrame()

    return () => cancelAnimationFrame(rafId)
  }, [])

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '680px',
        aspectRatio: '16 / 9',
        position: 'relative',
        zIndex: 20,
      }}
    >
      {/* Vidéo invisible mais active — opacity:0 permet la lecture */}
      <video
        ref={videoRef}
        src="/videos/VIDEO_FOND_MYCRMPRO.mp4"
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Canvas avec fond supprimé — couleurs d'origine conservées */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
    </div>
  )
}
