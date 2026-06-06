import { Fragment, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion as m } from "framer-motion";
import { ContactModal } from "./ContactModal";

/** public/ 下资源 → 带 BASE_URL 的完整 URL（适配 /industry/ 子路径部署） */
function asset(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
}

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
};

export type Metric = { label: string; dir: "up" | "down" };
export type Shot = { src: string; alt: string };

export type SellingPointConfig = {
  no: string;
  kicker: string;
  title: string;
  claim: string;
  features: string[];
  metrics: Metric[];
  shots: Shot[];
  reversed?: boolean;
  /** 第一卖点专属：渲染训练印记热力网格装饰 */
  heatmap?: boolean;
};

export type SportSolutionConfig = {
  /** 面包屑里的运动名 */
  crumb: string;
  /** Hero 顶部胶囊文案 */
  badge: string;
  /** 产品名，如「强化印记 · 台球」 */
  brand: string;
  /** Hero 背景视频路径（public/ 下相对路径） */
  video: string;
  /** Hero 背景视频封面图 */
  poster: string;
  /** Hero 主标题（可含 HTML，高亮用 <span class="text-brand-blue">） */
  heroH1: string;
  /** Hero 副标题（可含 HTML） */
  heroSub: string;
  /** 收益闭环四阶段名（用于 Hero 与收益闭环底部一行） */
  loopLine: string[];
  /** 痛点区标题 */
  painTitle: string;
  /** 痛点区引导语 */
  painIntro: string;
  pains: { icon: string; title: string; desc: string }[];
  /** 增长闭环区标题 */
  loopTitle: string;
  loopSteps: { step: string; name: string; desc: string; cash?: boolean }[];
  /** 四个卖点 */
  points: SellingPointConfig[];
  /** 一图看懂区标题 */
  summaryTitle: string;
  summaryRows: [string, string, string][];
  /** 角色模块标题 */
  rolesTitle: string;
  rolesIntro: string;
  roleGroups: { role: string; items: string }[];
  loginShot: Shot;
  /** CTA 区 */
  ctaTitle: string;
  ctaText: string;
};

/** 手机截图展示框：圆角 + 阴影，截图本身已含 iOS 状态栏 */
function PhoneShot({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={[
        "relative w-full max-w-[250px] overflow-hidden rounded-[2.2rem]",
        "border-[6px] border-[#0b1220] bg-[#0b1220]",
        "shadow-[0_30px_60px_-24px_rgba(6,126,253,0.45),0_8px_24px_-12px_rgba(0,0,0,0.4)]",
        className ?? "",
      ].join(" ")}
    >
      <img src={src} alt={alt} className="block h-auto w-full" loading="lazy" />
    </div>
  );
}

/** 生意指标药丸（带上升/下降箭头，均代表对店主有利的变化） */
function MetricChip({ label, dir, dark }: Metric & { dark?: boolean }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium",
        dark
          ? "bg-white/10 text-white"
          : "bg-brand-blue/[0.08] text-brand-blue",
      ].join(" ")}
    >
      {label}
      <span aria-hidden className="text-[13px] font-bold text-emerald-500">
        {dir === "up" ? "↑" : "↓"}
      </span>
    </span>
  );
}

/** 装饰用的训练印记热力网格（呼应 GitHub 风格打卡图） */
function HeatmapDeco() {
  const cells = useMemo(() => {
    const weeks = 18;
    const days = 7;
    const out: number[] = [];
    let seed = 7;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    for (let i = 0; i < weeks * days; i++) {
      const r = rand();
      out.push(r < 0.45 ? 0 : r < 0.7 ? 1 : r < 0.9 ? 2 : 3);
    }
    return out;
  }, []);

  const colorFor = (lvl: number) =>
    lvl === 0
      ? "rgba(255,255,255,0.08)"
      : lvl === 1
        ? "rgba(6,126,253,0.4)"
        : lvl === 2
          ? "rgba(6,126,253,0.7)"
          : "rgba(6,126,253,1)";

  return (
    <div className="grid grid-flow-col grid-rows-7 gap-[3px]">
      {cells.map((lvl, i) => (
        <span
          key={i}
          className="h-[10px] w-[10px] rounded-[2px]"
          style={{ backgroundColor: colorFor(lvl) }}
        />
      ))}
    </div>
  );
}

/** 卖点区：左右交错布局，文字 + 截图簇 + 生意指标 */
function SellingPoint({
  no,
  kicker,
  title,
  claim,
  features,
  metrics,
  shots,
  reversed,
  children,
}: SellingPointConfig & { children?: ReactNode }) {
  return (
    <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
      <m.div {...fadeUp} className={reversed ? "lg:order-2" : "lg:order-1"}>
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-blue text-sm font-bold text-white">
            {no}
          </span>
          <p className="text-sm font-medium tracking-[0.22em] text-brand-blue">
            {kicker}
          </p>
        </div>
        <h3 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">
          {title}
        </h3>
        <p className="mt-4 text-base leading-relaxed text-gray-500">{claim}</p>

        <ul className="mt-6 space-y-3">
          {features.map((f) => (
            <li
              key={f}
              className="flex items-start gap-3 text-[15px] text-gray-700"
            >
              <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-blue text-xs text-white">
                ✓
              </span>
              <span dangerouslySetInnerHTML={{ __html: f }} />
            </li>
          ))}
        </ul>

        <div className="mt-7">
          <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-gray-400">
            为你带来的生意指标
          </p>
          <div className="flex flex-wrap gap-2.5">
            {metrics.map((mt) => (
              <MetricChip key={mt.label} {...mt} />
            ))}
          </div>
        </div>

        {children}
      </m.div>

      <m.div
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.1 }}
        className={[
          "flex items-end justify-center gap-4",
          reversed ? "lg:order-1" : "lg:order-2",
        ].join(" ")}
      >
        {shots.map((s, i) => (
          <PhoneShot
            key={s.src}
            src={s.src}
            alt={s.alt}
            className={
              i === 0
                ? "z-10 max-w-[240px]"
                : "hidden max-w-[210px] sm:block lg:mb-10"
            }
          />
        ))}
      </m.div>
    </div>
  );
}

/** 收益闭环四阶段一行（留存 → 拉新 → … → …） */
function LoopLine({ stages, dark }: { stages: string[]; dark?: boolean }) {
  return (
    <>
      {stages.map((s, i) => (
        <Fragment key={s}>
          {i > 0 && <span className="mx-1 text-brand-blue">→</span>}
          <span className={dark ? "text-white/90" : undefined}>{s}</span>
        </Fragment>
      ))}
    </>
  );
}

export function SportSolution({ config }: { config: SportSolutionConfig }) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const openBooking = () => setBookingOpen(true);

  return (
    <main
      className="bg-[#f8f9fa] text-brand-ink"
      style={{ paddingTop: "var(--topbar-h)" }}
    >
      {/* ===== Hero ===== */}
      <section className="relative isolate overflow-hidden bg-[#0b1220] text-white">
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-40"
          src={asset(config.video)}
          poster={asset(config.poster)}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(11,18,32,0.55) 0%, rgba(11,18,32,0.78) 55%, rgba(11,18,32,0.96) 100%)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-[1180px] px-6 py-20 md:px-10 md:py-28 lg:py-32">
          <nav className="mb-8 flex items-center gap-2 text-sm text-white/60">
            <Link to="/" className="transition-colors hover:text-white">
              业务板块
            </Link>
            <span aria-hidden>/</span>
            <span className="text-white/90">{config.crumb}</span>
          </nav>

          <m.span
            {...fadeUp}
            className="inline-block rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-[0.2em] backdrop-blur-sm"
          >
            {config.badge}
          </m.span>

          <m.h1
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.05 }}
            className="mt-6 max-w-4xl text-4xl font-bold leading-tight tracking-tight md:text-6xl"
            dangerouslySetInnerHTML={{ __html: config.heroH1 }}
          />

          <m.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.12 }}
            className="mt-6 max-w-2xl text-lg leading-relaxed text-white/85"
            dangerouslySetInnerHTML={{ __html: config.heroSub }}
          />

          <m.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.18 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <button
              type="button"
              onClick={openBooking}
              className="veloxis-shape-sm bg-brand-blue px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-brand-blue-hover hover:shadow-[0_16px_32px_-12px_rgba(6,126,253,0.6)]"
            >
              预约现场演示
            </button>
            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("loop")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="veloxis-shape-sm border border-white/30 px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-white/10"
            >
              看增长闭环
            </button>
          </m.div>

          <m.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.24 }}
            className="mt-12 text-lg font-semibold tracking-wide text-white/90"
          >
            <LoopLine stages={config.loopLine} />
          </m.p>
        </div>
      </section>

      {/* ===== 痛点 ===== */}
      <section className="mx-auto max-w-[1180px] px-6 py-20 md:px-10 md:py-28">
        <m.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium tracking-[0.25em] text-rose-500">
            写给店主
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            {config.painTitle}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-gray-500">
            {config.painIntro}
          </p>
        </m.div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {config.pains.map((p, i) => (
            <m.div
              key={p.title}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.06 }}
              className="veloxis-shape-sm relative h-full border border-rose-100 bg-rose-50/40 p-6"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                {p.icon}
              </div>
              <h3 className="text-lg font-bold text-brand-ink">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                {p.desc}
              </p>
            </m.div>
          ))}
        </div>
      </section>

      {/* ===== 增长闭环 ===== */}
      <section id="loop" className="bg-[#0b1220] text-white">
        <div className="mx-auto max-w-[1180px] px-6 py-20 md:px-10 md:py-28">
          <m.div {...fadeUp} className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium tracking-[0.25em] text-brand-blue">
              店主的收益闭环
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              {config.loopTitle}
            </h2>
          </m.div>

          <div className="mt-14 grid gap-4 md:grid-cols-4 md:gap-3">
            {config.loopSteps.map((s, i) => (
              <m.div
                key={s.name}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.08 }}
                className={[
                  "relative rounded-2xl border p-6",
                  s.cash
                    ? "border-brand-blue/40 bg-brand-blue/10"
                    : "border-white/10 bg-white/[0.03]",
                ].join(" ")}
              >
                <div className="text-sm font-bold text-brand-blue">{s.step}</div>
                <div className="mt-2 text-xl font-bold text-white">{s.name}</div>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  {s.desc}
                </p>
                {s.cash && (
                  <span className="mt-4 inline-block rounded-full bg-brand-blue px-3 py-1 text-xs font-medium text-white">
                    直接变现
                  </span>
                )}
                {i !== config.loopSteps.length - 1 && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-3 top-1/2 hidden -translate-y-1/2 text-2xl text-brand-blue md:block"
                  >
                    →
                  </span>
                )}
              </m.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 四个卖点（交错布局，背景隔行变化） ===== */}
      {config.points.map((pt, i) => (
        <section
          key={pt.no}
          className={i % 2 === 0 ? "bg-white" : "bg-[#f8f9fa]"}
        >
          <div className="mx-auto max-w-[1180px] px-6 py-20 md:px-10 md:py-28">
            <SellingPoint {...pt}>
              {pt.heatmap && (
                <div className="mt-8 overflow-x-auto rounded-2xl border border-black/5 bg-[#0b1220] p-5">
                  <HeatmapDeco />
                  <div className="mt-4 flex items-center justify-end gap-2 text-xs text-white/50">
                    <span>少</span>
                    {[0, 1, 2, 3].map((lvl) => (
                      <span
                        key={lvl}
                        className="h-[10px] w-[10px] rounded-[2px]"
                        style={{
                          backgroundColor:
                            lvl === 0
                              ? "rgba(255,255,255,0.08)"
                              : `rgba(6,126,253,${lvl === 1 ? 0.4 : lvl === 2 ? 0.7 : 1})`,
                        }}
                      />
                    ))}
                    <span>多</span>
                  </div>
                </div>
              )}
            </SellingPoint>
          </div>
        </section>
      ))}

      {/* ===== 一图看懂收益闭环 ===== */}
      <section className="bg-[#0b1220] text-white">
        <div className="mx-auto max-w-[1180px] px-6 py-20 md:px-10 md:py-28">
          <m.div {...fadeUp} className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium tracking-[0.25em] text-brand-blue">
              一图看懂
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              {config.summaryTitle}
            </h2>
          </m.div>

          <m.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
            className="mt-12 overflow-hidden rounded-2xl border border-white/10"
          >
            <table className="w-full border-collapse text-left text-sm md:text-base">
              <thead>
                <tr className="bg-white/[0.06] text-white/70">
                  <th className="px-5 py-4 font-semibold">卖点</th>
                  <th className="px-5 py-4 font-semibold">解决的经营痛点</th>
                  <th className="px-5 py-4 font-semibold">核心生意指标</th>
                </tr>
              </thead>
              <tbody>
                {config.summaryRows.map((row, i) => (
                  <tr
                    key={row[0]}
                    className={i % 2 ? "bg-white/[0.02]" : "bg-transparent"}
                  >
                    <td className="px-5 py-4 font-semibold text-brand-blue">
                      {row[0]}
                    </td>
                    <td className="px-5 py-4 text-white/70">{row[1]}</td>
                    <td className="px-5 py-4 text-white/85">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </m.div>

          <m.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.18 }}
            className="mt-8 text-center text-lg font-semibold tracking-wide text-white/90"
          >
            <LoopLine stages={config.loopLine} dark />
          </m.p>
        </div>
      </section>

      {/* ===== 已落地模块 + 角色 ===== */}
      <section className="mx-auto max-w-[1180px] px-6 py-20 md:px-10 md:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <m.div {...fadeUp}>
            <p className="text-sm font-medium tracking-[0.25em] text-brand-blue">
              开箱即用 · 已经落地
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              {config.rolesTitle}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-gray-500">
              {config.rolesIntro}
            </p>

            <div className="mt-8 space-y-4">
              {config.roleGroups.map((g) => (
                <div
                  key={g.role}
                  className="flex items-start gap-4 border-b border-black/5 pb-4 last:border-b-0"
                >
                  <span className="mt-0.5 shrink-0 rounded-lg bg-brand-blue/[0.08] px-3 py-1 text-sm font-semibold text-brand-blue">
                    {g.role}
                  </span>
                  <span className="text-[15px] leading-relaxed text-gray-600">
                    {g.items}
                  </span>
                </div>
              ))}
            </div>
          </m.div>

          <m.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
            className="flex justify-center"
          >
            <PhoneShot src={config.loginShot.src} alt={config.loginShot.alt} />
          </m.div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative isolate overflow-hidden bg-brand-blue text-white">
        <div className="mx-auto max-w-[1180px] px-6 py-20 text-center md:px-10 md:py-24">
          <m.h2
            {...fadeUp}
            className="text-3xl font-bold tracking-tight md:text-4xl"
          >
            {config.ctaTitle}
          </m.h2>
          <m.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.08 }}
            className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/85"
          >
            {config.ctaText}
          </m.p>
          <m.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.16 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <button
              type="button"
              onClick={openBooking}
              className="veloxis-shape-sm bg-white px-8 py-3.5 text-sm font-semibold text-brand-blue transition-transform duration-300 hover:scale-[1.03]"
            >
              预约现场演示
            </button>
            <Link
              to="/"
              className="veloxis-shape-sm border border-white/40 px-8 py-3.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-white/10"
            >
              查看其他运动板块
            </Link>
          </m.div>
        </div>
      </section>

      <ContactModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        context={config.brand}
      />
    </main>
  );
}

/** public/ 资源 URL 助手，供数据配置文件复用 */
export { asset };
