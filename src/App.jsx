// App — AppShell (Sidebar + Topbar + routed page) with URL-synced detail overlay.
//
// Routing:
//   /         → HomePage
//   /queue    → QueuePage
//   /archive  → ArchivePage
//   /dropped  → DroppedPage
//   /persona  → PersonaPage
//   /settings → SettingsPage
//
// `?item=<id>` opens the DetailOverlay on top of whichever page is active.
// Theme is stored on `document.documentElement.dataset.theme`; persisted via localStorage.

import { useEffect, useMemo, useState } from "react";
import { Routes, Route, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar.jsx";
import { Topbar } from "@/components/Topbar.jsx";
import { DetailOverlay } from "@/components/DetailOverlay/DetailOverlay.jsx";
import { useNewsRadarDB } from "@/hooks/useNewsRadarDB.js";
import { HomePage } from "@/pages/HomePage.jsx";
import { QueuePage } from "@/pages/QueuePage.jsx";
import { ArchivePage } from "@/pages/ArchivePage.jsx";
import { DroppedPage } from "@/pages/DroppedPage.jsx";
import { PersonaPage } from "@/pages/PersonaPage.jsx";
import { SettingsPage } from "@/pages/SettingsPage.jsx";

const PATH_TO_KEY = {
  "/": "home",
  "/queue": "queue",
  "/archive": "archive",
  "/dropped": "dropped",
  "/persona": "persona",
  "/settings": "settings",
};
const KEY_TO_PATH = {
  home: "/",
  queue: "/queue",
  archive: "/archive",
  dropped: "/dropped",
  persona: "/persona",
  settings: "/settings",
};
const TITLES = {
  home: { title: "總覽", subtitle: "自動化流程的即時脈搏" },
  queue: { title: "佇列", subtitle: "所有已產稿、待發或已發的貼文" },
  archive: { title: "歷史", subtitle: "已發布貼文與實際互動數據" },
  dropped: { title: "被擋掉", subtitle: "Scorer 判定不值得發的新聞" },
  persona: { title: "語氣 Persona", subtitle: "News Radar Soul 與各平台寫作紀律" },
  settings: { title: "設定顯示", subtitle: "門檻、主題權重、reflector 執行紀錄" },
};

function getInitialTheme() {
  if (typeof window === "undefined") return "light";
  try {
    const saved = window.localStorage.getItem("nr-theme");
    if (saved === "dark" || saved === "light") return saved;
  } catch {
    /* localStorage may be disabled */
  }
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

export function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items } = useNewsRadarDB();

  const [theme, setThemeState] = useState(getInitialTheme);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      window.localStorage.setItem("nr-theme", theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const currentPage = PATH_TO_KEY[location.pathname] || "home";
  const setPage = (key) => {
    const path = KEY_TO_PATH[key] || "/";
    // Preserve ?item= when changing pages so the overlay remains open.
    navigate({ pathname: path, search: location.search });
  };

  const counts = useMemo(
    () => ({
      queued: items.filter((i) => i.queue_status === "queued").length,
      dropped: items.filter((i) => i.status === "dropped").length,
    }),
    [items]
  );

  const detailId = searchParams.get("item");
  const openDetail = (id) => {
    const next = new URLSearchParams(searchParams);
    next.set("item", id);
    setSearchParams(next);
  };
  const closeDetail = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("item");
    setSearchParams(next);
  };

  const { title, subtitle } = TITLES[currentPage] || TITLES.home;

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg)", color: "var(--fg)" }}>
      <Sidebar currentPage={currentPage} setPage={setPage} counts={counts} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <Topbar title={title} subtitle={subtitle} theme={theme} setTheme={setThemeState} />
        <main style={{ flex: 1, overflow: "auto", position: "relative" }}>
          <Routes>
            <Route path="/" element={<HomePage openDetail={openDetail} />} />
            <Route path="/queue" element={<QueuePage openDetail={openDetail} />} />
            <Route path="/archive" element={<ArchivePage openDetail={openDetail} />} />
            <Route path="/dropped" element={<DroppedPage />} />
            <Route path="/persona" element={<PersonaPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<HomePage openDetail={openDetail} />} />
          </Routes>
        </main>
      </div>
      {detailId && <DetailOverlay itemId={detailId} onClose={closeDetail} />}
    </div>
  );
}

export default App;
