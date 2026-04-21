export default function IPhoneMockup() {
  return (
    <div className="relative flex items-center justify-center select-none iphone-wrapper">
      {/* Glow violet derrière le téléphone */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 60% at 50% 55%, rgba(124,92,252,0.30) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* ── Coque iPhone 15 Pro ── */}
      <div className="relative iphone-shell">

        {/* Cadre titane */}
        <div
          className="absolute inset-0 rounded-[44px] z-20 pointer-events-none"
          style={{
            background: "linear-gradient(145deg, #8E8E93 0%, #5C5C61 25%, #3A3A3C 50%, #5C5C61 75%, #8E8E93 100%)",
            padding: "2px",
          }}
        >
          <div className="w-full h-full rounded-[42px]" style={{ background: "#000" }} />
        </div>

        {/* Reflet cadre titane */}
        <div
          className="absolute inset-0 rounded-[44px] z-30 pointer-events-none"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 40%, rgba(255,255,255,0.04) 100%)",
          }}
        />

        {/* Boutons gauche */}
        <div className="absolute z-10 btn-left btn-silent" />
        <div className="absolute z-10 btn-left btn-vol-up" />
        <div className="absolute z-10 btn-left btn-vol-down" />
        {/* Bouton power droite */}
        <div className="absolute z-10 btn-right btn-power" />

        {/* Zone écran */}
        <div
          className="absolute overflow-hidden z-10 iphone-screen"
          style={{ background: "#000" }}
        >
          {/* Vidéo */}
          <video
            src="/videos/VIDEO_FOND_MYCRMPRO.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ objectPosition: "center top" }}
          />

          {/* Dynamic Island */}
          <div className="absolute left-1/2 -translate-x-1/2 z-30 dynamic-island" style={{ background: "#000" }} />

          {/* Heure */}
          <div className="absolute top-[14px] left-[18px] z-20">
            <span className="text-white font-semibold" style={{ fontSize: "10px", fontFamily: "system-ui" }}>9:41</span>
          </div>

          {/* Icônes statut */}
          <div className="absolute top-[14px] right-[16px] z-20 flex items-center gap-1">
            <svg width="14" height="10" viewBox="0 0 16 11" fill="none">
              <rect x="0" y="7" width="3" height="4" rx="0.5" fill="white"/>
              <rect x="4.5" y="5" width="3" height="6" rx="0.5" fill="white"/>
              <rect x="9" y="2.5" width="3" height="8.5" rx="0.5" fill="white"/>
              <rect x="13.5" y="0" width="3" height="11" rx="0.5" fill="white"/>
            </svg>
            <svg width="13" height="10" viewBox="0 0 15 11" fill="none">
              <path d="M7.5 8.5C8.3 8.5 9 9.2 9 10S8.3 11.5 7.5 11.5 6 10.8 6 10s.7-1.5 1.5-1.5z" fill="white"/>
              <path d="M3.5 5.5C4.9 4.1 6.1 3.5 7.5 3.5s2.6.6 4 2" stroke="white" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
              <path d="M1 3C2.9 1.1 5 0 7.5 0S12.1 1.1 14 3" stroke="white" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
            </svg>
            <div style={{ width: "20px", height: "10px", border: "1px solid rgba(255,255,255,0.7)", borderRadius: "2px", padding: "1.5px" }}>
              <div style={{ width: "75%", height: "100%", background: "white", borderRadius: "1px" }} />
            </div>
          </div>

          {/* Home indicator */}
          <div
            className="absolute bottom-[6px] left-1/2 -translate-x-1/2 z-30"
            style={{ width: "100px", height: "4px", background: "rgba(255,255,255,0.5)", borderRadius: "2px" }}
          />
        </div>
      </div>

      {/* ── Styles responsive via CSS-in-JSX ── */}
      <style>{`
        /* Mobile : iPhone compact */
        .iphone-shell {
          width: 160px;
          height: 330px;
        }
        .iphone-screen {
          top: 8px; left: 8px; right: 8px; bottom: 8px;
          border-radius: 28px;
        }
        .dynamic-island {
          top: 10px;
          width: 76px; height: 22px;
          border-radius: 14px;
        }
        /* Boutons */
        .btn-left  { left: -3px; width: 3px; border-radius: 2px 0 0 2px; background: linear-gradient(180deg, #6C6C70, #48484A); }
        .btn-right { right: -3px; width: 3px; border-radius: 0 2px 2px 0; background: linear-gradient(180deg, #6C6C70, #48484A); }
        .btn-silent   { top: 56px;  height: 16px; }
        .btn-vol-up   { top: 80px;  height: 22px; }
        .btn-vol-down { top: 110px; height: 22px; }
        .btn-power    { top: 90px;  height: 40px; }

        /* Tablet / grand mobile */
        @media (min-width: 480px) {
          .iphone-shell { width: 220px; height: 454px; }
          .iphone-screen { border-radius: 34px; }
          .dynamic-island { top: 12px; width: 96px; height: 28px; border-radius: 16px; }
          .btn-silent   { top: 76px;  height: 20px; }
          .btn-vol-up   { top: 106px; height: 28px; }
          .btn-vol-down { top: 144px; height: 28px; }
          .btn-power    { top: 120px; height: 50px; }
        }

        /* Desktop */
        @media (min-width: 1024px) {
          .iphone-shell { width: 280px; height: 580px; }
          .iphone-screen { top: 10px; left: 10px; right: 10px; bottom: 10px; border-radius: 36px; }
          .dynamic-island { top: 14px; width: 110px; height: 34px; border-radius: 20px; }
          .btn-silent   { top: 88px;  height: 22px; }
          .btn-vol-up   { top: 120px; height: 32px; }
          .btn-vol-down { top: 165px; height: 32px; }
          .btn-power    { top: 150px; height: 60px; }
        }

        /* Large desktop */
        @media (min-width: 1280px) {
          .iphone-shell { width: 320px; height: 662px; }
          .dynamic-island { top: 16px; width: 120px; height: 36px; border-radius: 22px; }
          .btn-vol-up   { top: 136px; height: 36px; }
          .btn-vol-down { top: 188px; height: 36px; }
          .btn-silent   { top: 100px; height: 26px; }
          .btn-power    { top: 170px; height: 68px; }
        }
      `}</style>
    </div>
  )
}
