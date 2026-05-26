import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SITE_LOGO_ALT, SITE_LOGO_SRC } from "../../../shared/site-brand";

// The roadmap SPA is mounted at /roadmap/. Top-bar nav links should lead back
// to the main marketing site (the anchors live at /#home, /#services, etc.),
// so we use absolute "/" URLs to escape both the sub-path and HashRouter.
const HOME_ROOT = "/";

// Mirror the marketing site's nav exactly so users see the same header
// when bouncing between veloxisai.com and /roadmap/. Anchors target the
// marketing-site sections (home/services/about/contact).
const NAV_LINKS = [
  { label: "首页", href: `${HOME_ROOT}#home` },
  { label: "业务板块", href: `${HOME_ROOT}#services` },
  { label: "关于我们", href: `${HOME_ROOT}#about` },
  { label: "加入我们", href: `${HOME_ROOT}#contact` },
];

export function TopBar() {
  const [open, setOpen] = useState(false);

  // Close the mobile drawer on Escape, and reset when the viewport grows
  // back to desktop width so a stuck drawer never hides desktop content.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 flex h-[var(--topbar-h)] items-center justify-between bg-white/95 px-[60px] shadow-[0_1px_0_rgba(0,0,0,0.05)] backdrop-blur max-md:px-5">
        <a
          href={HOME_ROOT}
          aria-label="返回大川激流首页"
          className="flex items-center transition-transform duration-300 hover:scale-[1.03]"
        >
          <img
            src={SITE_LOGO_SRC}
            alt={SITE_LOGO_ALT}
            className="block h-9 w-auto select-none transition-opacity duration-300 hover:opacity-85"
            draggable={false}
          />
        </a>

        <ul className="flex list-none items-center gap-10 max-md:hidden">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="group relative text-[15px] font-medium text-brand-ink transition-colors duration-300 hover:text-brand-blue"
              >
                {link.label}
                <span className="pointer-events-none absolute -bottom-1.5 left-0 h-0.5 w-0 bg-brand-blue transition-all duration-300 group-hover:w-full" />
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile hamburger — toggles a slide-down drawer with the same nav links. */}
        <button
          type="button"
          aria-label={open ? "关闭菜单" : "打开菜单"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="relative hidden h-7 w-7 cursor-pointer flex-col items-center justify-center gap-[5px] bg-transparent max-md:flex"
        >
          <span
            className={`block h-0.5 w-6 bg-brand-ink transition-transform duration-300 ${
              open ? "translate-y-[7px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-brand-ink transition-opacity duration-300 ${
              open ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-brand-ink transition-transform duration-300 ${
              open ? "-translate-y-[7px] -rotate-45" : ""
            }`}
          />
        </button>
      </header>

      {/* Mobile slide-down drawer (hidden on >= md). */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setOpen(false)}
              className="fixed inset-x-0 top-[var(--topbar-h)] bottom-0 z-40 bg-black/30 md:hidden"
              aria-hidden="true"
            />
            <motion.nav
              key="drawer-panel"
              initial={{ y: -12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="fixed inset-x-0 top-[var(--topbar-h)] z-40 border-t border-black/5 bg-white/98 shadow-[0_8px_24px_-16px_rgba(0,0,0,0.2)] backdrop-blur md:hidden"
            >
              <ul className="flex list-none flex-col gap-0 px-6 py-3">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="block py-3 text-[16px] font-medium text-brand-ink transition-colors hover:text-brand-blue"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
