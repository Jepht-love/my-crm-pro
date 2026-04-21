export default function IPhoneMockup() {
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
      <video
        src="/videos/VIDEO_FOND_MYCRMPRO.mp4"
        autoPlay
        loop
        muted
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
          /*
           * 1. saturate(0)   → désature → fond bleu-noir devient gris sombre
           * 2. brightness(4) → booste toutes les valeurs
           * 3. contrast(20)  → pixels sombres → 0 (noir pur), pixels clairs → 1
           * 4. screen        → noir pur = transparent, fond violet du site apparaît
           */
          filter: 'saturate(0) brightness(4) contrast(20)',
          mixBlendMode: 'screen',
        }}
      />
    </div>
  )
}
