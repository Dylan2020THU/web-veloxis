import { Route, Routes } from "react-router-dom";
import { TopBar } from "./components/TopBar";
import Home from "./routes/Home";

export default function App() {
  return (
    <>
      <TopBar />
      <Routes>
        <Route path="/" element={<Home />} />
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
