export default function IPhoneMockup() {
  return (
    <div className="relative flex items-center justify-center select-none">
      {/* Glow violet derrière le téléphone */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 60% at 50% 55%, rgba(124,92,252,0.28) 0%, transparent 70%)",
          filter: "blur(32px)",
        }}
      />

      {/* ── iPhone 15 Pro ── */}
      <div
        className="relative"
        style={{
          width: "280px",
          height: "580px",
        }}
      >
        {/* Cadre titane — bords arrondis caractéristiques iPhone 15 Pro */}
        <div
          className="absolute inset-0 rounded-[44px] z-20 pointer-events-none"
          style={{
            background: "linear-gradient(145deg, #8E8E93 0%, #5C5C61 25%, #3A3A3C 50%, #5C5C61 75%, #8E8E93 100%)",
            padding: "2px",
          }}
        >
          {/* Verre de l'écran - fond noir */}
          <div
            className="w-full h-full rounded-[42px]"
            style={{ background: "#000000" }}
          />
        </div>

        {/* Reflet sur le cadre titane */}
        <div
          className="absolute inset-0 rounded-[44px] z-30 pointer-events-none"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 40%, rgba(255,255,255,0.04) 100%)",
          }}
        />

        {/* Boutons volume gauche */}
        <div
          className="absolute z-10"
          style={{
            left: "-3px",
            top: "120px",
            width: "3px",
            height: "32px",
            background: "linear-gradient(180deg, #6C6C70, #48484A)",
            borderRadius: "2px 0 0 2px",
          }}
        />
        <div
          className="absolute z-10"
          style={{
            left: "-3px",
            top: "165px",
            width: "3px",
            height: "32px",
            background: "linear-gradient(180deg, #6C6C70, #48484A)",
            borderRadius: "2px 0 0 2px",
          }}
        />
        {/* Bouton silencieux */}
        <div
          className="absolute z-10"
          style={{
            left: "-3px",
            top: "88px",
            width: "3px",
            height: "22px",
            background: "linear-gradient(180deg, #6C6C70, #48484A)",
            borderRadius: "2px 0 0 2px",
          }}
        />
        {/* Bouton power droite */}
        <div
          className="absolute z-10"
          style={{
            right: "-3px",
            top: "150px",
            width: "3px",
            height: "60px",
            background: "linear-gradient(180deg, #6C6C70, #48484A)",
            borderRadius: "0 2px 2px 0",
          }}
        />

        {/* Zone écran */}
        <div
          className="absolute overflow-hidden z-10"
          style={{
            top: "10px",
            left: "10px",
            right: "10px",
            bottom: "10px",
            borderRadius: "36px",
            background: "#000",
          }}
        >
          {/* Vidéo du dashboard */}
          <video
            src="/videos/scroll-stop-3.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ objectPosition: "center top" }}
          />

          {/* Dynamic Island */}
          <div
            className="absolute top-[14px] left-1/2 -translate-x-1/2 z-30"
            style={{
              width: "110px",
              height: "34px",
              background: "#000000",
              borderRadius: "20px",
            }}
          />

          {/* Barre de statut — heure */}
          <div className="absolute top-[16px] left-[20px] z-20 flex items-center">
            <span className="text-white text-[11px] font-semibold" style={{ fontFamily: "system-ui" }}>
              9:41
            </span>
          </div>

          {/* Barre de statut — icônes droite */}
          <div className="absolute top-[16px] right-[20px] z-20 flex items-center gap-1">
            {/* Signal */}
            <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
              <rect x="0" y="7" width="3" height="4" rx="0.5" fill="white"/>
              <rect x="4.5" y="5" width="3" height="6" rx="0.5" fill="white"/>
              <rect x="9" y="2.5" width="3" height="8.5" rx="0.5" fill="white"/>
              <rect x="13.5" y="0" width="3" height="11" rx="0.5" fill="white"/>
            </svg>
            {/* Wifi */}
            <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
              <path d="M7.5 8.5C8.3 8.5 9 9.2 9 10S8.3 11.5 7.5 11.5 6 10.8 6 10s.7-1.5 1.5-1.5z" fill="white"/>
              <path d="M3.5 5.5C4.9 4.1 6.1 3.5 7.5 3.5s2.6.6 4 2" stroke="white" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
              <path d="M1 3C2.9 1.1 5 0 7.5 0S12.1 1.1 14 3" stroke="white" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
            </svg>
            {/* Batterie */}
            <div className="flex items-center gap-0.5">
              <div style={{ width: "22px", height: "11px", border: "1px solid rgba(255,255,255,0.7)", borderRadius: "2.5px", padding: "1.5px", position: "relative" }}>
                <div style={{ width: "75%", height: "100%", background: "white", borderRadius: "1px" }} />
                <div style={{ position: "absolute", right: "-4px", top: "50%", transform: "translateY(-50%)", width: "2px", height: "5px", background: "rgba(255,255,255,0.7)", borderRadius: "1px" }} />
              </div>
            </div>
          </div>

          {/* Home indicator */}
          <div
            className="absolute bottom-[8px] left-1/2 -translate-x-1/2 z-30"
            style={{
              width: "120px",
              height: "4px",
              background: "rgba(255,255,255,0.5)",
              borderRadius: "2px",
            }}
          />
        </div>
      </div>
    </div>
  )
}
