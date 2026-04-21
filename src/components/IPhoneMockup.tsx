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

        // Luminosité perceptuelle
        const lum = r * 0.299 + g * 0.587 + b * 0.114

        // Détection fond : le fond de la vidéo est un dégradé bleu-foncé
        // → pixel "fond" si : bleu dominant OU très sombre
        const isBlue = b > r * 1.1 && b > g * 1.05

        // Seuil : 150 pour les pixels bleutés, 40 pour les autres
        const threshold = isBlue ? 150 : 40

        if (lum < threshold * 0.3) {
          // Zone très sombre → totalement transparent
          d[i + 3] = 0
        } else if (lum < threshold) {
          // Zone de transition douce (anti-aliasing)
          d[i + 3] = Math.floor(((lum - threshold * 0.3) / (threshold * 0.7)) * 255)
        }
        // Pixels clairs/neutres (iPhone) → conservés intacts
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
