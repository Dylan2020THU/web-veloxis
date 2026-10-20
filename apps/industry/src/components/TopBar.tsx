import { useEffect, useState } from "react";
import { SITE_LOGO_ALT, SITE_LOGO_SRC } from "../../../shared/site-brand";
import { scrollToSection } from "../lib/navigation";
import { useNavigate } from "react-router-dom";

const NAV_LINKS = [{ label: "运动大档案", id: "archive" }, { label: "强化系列", id: "series" }, { label: "产品一瞥", id: "product" }, { label: "我们的愿景", id: "vision" }];

export function TopBar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  function goToSection(id: string) {
    setOpen(false);
    if (document.getElementById(id)) {
      scrollToSection(id);
    } else {
      navigate("/");
      requestAnimationFrame(() => scrollToSection(id));
    }
  }
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); document.getElementById("sports-menu-toggle")?.focus(); } };
    const closeOnResize = () => { if (window.innerWidth >= 768) setOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", closeOnResize);
    return () => { window.removeEventListener("keydown", closeOnEscape); window.removeEventListener("resize", closeOnResize); };
  }, [open]);
  return (
    <header className="sports-topbar">
      <div className="topbar-inner">
        <a className="sports-brand" href="/" aria-label="返回大川激流首页"><img src={SITE_LOGO_SRC} alt={SITE_LOGO_ALT} /><span>智能体育</span></a>
        <button id="sports-menu-toggle" className="sports-menu-toggle" aria-expanded={open} aria-controls="sports-navigation" aria-label={open ? "关闭菜单" : "打开菜单"} onClick={() => setOpen(!open)}><span aria-hidden="true">{open ? "×" : "☰"}</span></button>
        <nav id="sports-navigation" aria-label="智能体育导航" className={open ? "sports-nav is-open" : "sports-nav"}>
          {NAV_LINKS.map(link => <button key={link.id} onClick={() => goToSection(link.id)}>{link.label}</button>)}
          <a href="/">返回官网 <span aria-hidden="true">↗</span></a>
        </nav>
      </div>
      {open && <button className="menu-backdrop" aria-label="收起导航菜单" onClick={() => setOpen(false)} />}
    </header>
  );
}
