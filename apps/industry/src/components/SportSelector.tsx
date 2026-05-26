import { useEffect, useState } from "react";
import { SportPanel } from "./SportPanel";
import { SPORTS } from "../data/sports";
import { computePanelMotion } from "../lib/panelMotion";

export function SportSelector() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [columns, setColumns] = useState<1 | 2>(2);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const sync = () => setColumns(mq.matches ? 2 : 1);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <section className="px-5 py-10 md:px-10 md:py-14 lg:px-16 lg:py-16">
      <header className="mb-10 md:mb-14">
        <p className="mb-3 text-sm font-medium tracking-[0.25em] text-brand-blue">
          智能体育
        </p>
        <h1 className="max-w-3xl text-2xl font-bold tracking-tight text-brand-ink md:text-4xl lg:text-[2.75rem] lg:leading-tight">
          您的智能体育管理方案，从这里开始
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-gray-500 md:text-base">
          七大运动垂直场景，探索 AI 赋能会员管理与运营。
        </p>
      </header>

      <div
        className="mx-auto grid max-w-[1280px] grid-cols-1 gap-4 overflow-visible sm:grid-cols-2 sm:gap-5 lg:gap-6"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {SPORTS.map((sport, index) => {
          const isLoneLast =
            index === SPORTS.length - 1 && SPORTS.length % 2 === 1;
          const motionState = computePanelMotion(
            index,
            hoveredIndex,
            SPORTS.length,
            columns
          );

          return (
            <SportPanel
              key={sport.id}
              sport={sport}
              motionState={motionState}
              isActive={hoveredIndex === index}
              onHoverStart={() => setHoveredIndex(index)}
              className={
                isLoneLast
                  ? "sm:col-span-2 sm:mx-auto sm:w-full sm:max-w-[calc((100%-1.25rem)/2)] lg:max-w-[calc((100%-1.5rem)/2)]"
                  : undefined
              }
            />
          );
        })}
      </div>
    </section>
  );
}
