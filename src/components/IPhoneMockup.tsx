export default function IPhoneMockup() {
  return (
    <>
      <div className="iphone-video-wrap">
        <video
          src="/videos/VIDEO_FOND_MYCRMPRO.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="iphone-video"
        />
      </div>

      <style>{`
        /* ── Conteneur ── */
        .iphone-video-wrap {
          position: relative;
          flex-shrink: 0;
          /* La vidéo source est 16:9 — on garde le ratio natif */
          width: 44vw;
          aspect-ratio: 16 / 9;
        }

        /* ── Vidéo ── */
        .iphone-video {
          width: 100%;
          height: 100%;
          object-fit: contain;
          /* Supprime le fond noir → iPhone 3D flotte sur le violet */
          mix-blend-mode: screen;
          display: block;
        }

        /* Mobile étroit : on agrandit un peu plus */
        @media (max-width: 639px) {
          .iphone-video-wrap {
            width: 52vw;
          }
        }

        /* Desktop large */
        @media (min-width: 1280px) {
          .iphone-video-wrap {
            width: 50vw;
          }
        }
        @media (min-width: 1536px) {
          .iphone-video-wrap {
            width: 52vw;
          }
        }
      `}</style>
    </>
  )
}
