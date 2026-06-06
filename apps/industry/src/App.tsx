import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { TopBar } from "./components/TopBar";
import Home from "./routes/Home";
import { SportSolution } from "./components/SportSolution";
import { SPORT_SOLUTIONS } from "./data/sportSolutions";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <TopBar />
      <Routes>
        <Route path="/" element={<Home />} />
        {Object.entries(SPORT_SOLUTIONS).map(([id, config]) => (
          <Route
            key={id}
            path={`/${id}`}
            element={<SportSolution config={config} />}
          />
        ))}
        <Route
          path="*"
          element={
            <div
              className="flex h-screen items-center justify-center text-brand-ink"
              style={{ paddingTop: "var(--topbar-h)" }}
            >
              页面未找到
            </div>
          }
        />
      </Routes>
    </>
  );
}
