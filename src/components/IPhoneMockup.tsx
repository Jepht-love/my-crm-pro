export default function IPhoneMockup() {
  return (
    <div
      className="relative flex items-center justify-center select-none overflow-hidden"
      style={{
        /* Portrait : 9/19.5 ≈ ratio iPhone. Taille responsive via CSS */
        width: "var(--vid-w)",
        height: "var(--vid-h)",
      }}
    >
      <video
        src="/videos/VIDEO_FOND_MYCRMPRO.mp4"
        autoPlay
        loop
        muted
        playsInline
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          /* Supprime le fond sombre de la vidéo → l'iPhone 3D flotte sur le violet */
          mixBlendMode: "screen",
        }}
      />

      <style>{`
        :root {
          /* Mobile */
          --vid-w: 260px;
          --vid-h: 320px;
        }
        @media (min-width: 480px) {
          :root { --vid-w: 340px; --vid-h: 420px; }
        }
        @media (min-width: 768px) {
          :root { --vid-w: 420px; --vid-h: 520px; }
        }
        @media (min-width: 1024px) {
          :root { --vid-w: 520px; --vid-h: 640px; }
        }
        @media (min-width: 1280px) {
          :root { --vid-w: 600px; --vid-h: 740px; }
        }
      `}</style>
    </div>
  )
}
