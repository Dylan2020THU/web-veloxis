import { Route, Routes } from "react-router-dom";
import HomeMap from "./routes/HomeMap";
import CourseDetail from "./routes/CourseDetail";
import { TopBar } from "./components/TopBar";

export default function App() {
  return (
    <>
      <TopBar />
      <Routes>
        <Route path="/" element={<HomeMap />} />
        <Route path="/course/:id" element={<CourseDetail />} />
        <Route
          path="*"
          element={
            <div className="flex h-screen items-center justify-center text-ink">
              Page Not Found
            </div>
          }
        />
      </Routes>
    </>
  );
}
