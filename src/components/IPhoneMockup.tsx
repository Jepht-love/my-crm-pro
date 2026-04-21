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
        /* Conteneur portrait — zoom sur l'iPhone 3D centré dans la vidéo 16:9 */
        .iphone-video-wrap {
          position: relative;
          flex-shrink: 0;
          /* Portrait, ratio proche iPhone */
          width: 42vw;
          aspect-ratio: 9 / 16;
          overflow: hidden;
        }

        /* object-cover + center = zoom sur le centre de la vidéo où l'iPhone se trouve */
        .iphone-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center center;
          /* Supprime le fond noir → iPhone 3D flotte sur le violet */
          mix-blend-mode: screen;
        }

        /* Mobile étroit : prend encore plus de place */
        @media (max-width: 639px) {
          .iphone-video-wrap {
            width: 48vw;
          }
        }

        /* Tablette */
        @media (min-width: 768px) {
          .iphone-video-wrap {
            width: 40vw;
          }
        }

        /* Desktop */
        @media (min-width: 1024px) {
          .iphone-video-wrap {
            width: 44vw;
          }
        }

        /* Grand écran */
        @media (min-width: 1280px) {
          .iphone-video-wrap {
            width: 46vw;
          }
        }
      `}</style>
    </>
  )
}
