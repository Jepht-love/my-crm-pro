export default function IPhoneMockup() {
  return (
    <div
      style={{
        /* Occupe toute la colonne droite, ratio 16:9 natif de la vidéo */
        width: "100%",
        maxWidth: "700px",
        aspectRatio: "16 / 9",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <video
        src="/videos/VIDEO_FOND_MYCRMPRO.mp4"
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "contain",
          /* Supprime le fond noir → iPhone 3D flotte sur le fond violet du site */
          mixBlendMode: "screen",
        }}
      />
    </div>
  )
}
