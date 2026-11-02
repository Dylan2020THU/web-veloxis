import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { RoadmapLayout } from "@/data/types";
import type { MapCanvasHandle } from "./MapCanvas";
import "./learning-atlas.css";

interface Props {
  layout: RoadmapLayout;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onZoomChange?: (zoom: number) => void;
}
interface View extends MapCanvasHandle {
  select(id: string | null): void;
  destroy(): void;
}

export const LearningAtlas = forwardRef<MapCanvasHandle, Props>(function LearningAtlas(
  { layout, selectedId, onSelect, onZoomChange }, ref
) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<View | null>(null);
  const callbacks = useRef({ onSelect, onZoomChange });
  callbacks.current = { onSelect, onZoomChange };
  const [status, setStatus] = useState("正在加载三维学习地图…");
  useImperativeHandle(ref, () => ({
    flyTo: (id) => view.current?.flyTo(id),
    reset: () => view.current?.reset(),
    zoomBy: (factor) => view.current?.zoomBy(factor),
    getZoom: () => view.current?.getZoom() ?? 1,
  }), []);
  useEffect(() => {
    let disposed = false;
    const url = import.meta.env.BASE_URL + "map3d/view.mjs";
    import(/* @vite-ignore */ url).then(({ createLearningAtlas }) => {
      if (disposed || !host.current) return;
      view.current = createLearningAtlas(host.current, layout, {
        onSelect: (id: string) => callbacks.current.onSelect(id),
        onZoom: (zoom: number) => callbacks.current.onZoomChange?.(zoom),
        onUnavailable: () => setStatus("三维显示不可用，请通过搜索或下方目录浏览课程。"),
      });
      setStatus("");
    }).catch(() => !disposed && setStatus("三维显示不可用，请通过搜索或下方目录浏览课程。"));
    return () => { disposed = true; view.current?.destroy(); view.current = null; };
  }, [layout]);
  useEffect(() => { view.current?.select(selectedId); }, [selectedId]);
  return <div className="learning-atlas" ref={host}>
    <div className="learning-atlas-caption">AI LEARNING LANDSCAPE<span>虚线：目录归属 · 光管：先修知识 → 后续内容</span></div>
    {status && <div className="learning-atlas-status" role="status">{status}</div>}
    <nav className="learning-atlas-directory" aria-label="学习领域">
      {layout.districts.map(({ node }) => <button key={node.id} onClick={() => {
        view.current?.flyTo(node.id); onSelect(node.id);
      }}>{node.label}</button>)}
    </nav>
  </div>;
});
