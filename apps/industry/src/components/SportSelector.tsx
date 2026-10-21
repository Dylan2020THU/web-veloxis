import { useRef, useState } from "react";
import { SportPanel } from "./SportPanel";
import { SPORTS, type Sport } from "../data/sports";
import { scrollToSection } from "../lib/navigation";

export function SportSelector() {
  const [selected, setSelected] = useState<Sport | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  function openSport(sport: Sport) {
    setSelected(sport);
    dialogRef.current?.showModal();
  }

  return (
    <section id="series" className="series-section section-space" aria-labelledby="series-title">
      <div className="series-heading"><div><p className="eyebrow">强化系列 · 让热爱有迹可循</p><h2 id="series-title">不同的热爱，<br />同样值得被记录。</h2></div><p>从水里到山间，从球场到训练场。<br />找到你的运动，认识你的大档案。</p></div>
      <div className="sport-grid">
        {SPORTS.map((sport, index) => <SportPanel key={sport.id} sport={sport} index={index} onSelect={() => openSport(sport)} />)}
        <article className="sport-invitation"><span className="invitation-mark" aria-hidden="true">↗</span><p>不止一种运动，<br />不止一种可能。</p><span>你的下一份热爱，也值得一份档案。</span><a href="mailto:dylanzhang@veloxisai.com">一起探索更多可能 <span aria-hidden="true">↗</span></a></article>
      </div>
      <p className="series-note">七大运动方向，共同构建强化系列的运动档案愿景。各产品开放进度，以正式发布为准。</p>
      <dialog ref={dialogRef} className="sport-dialog" aria-labelledby="sport-dialog-title" onClose={() => setSelected(null)} onClick={(event) => { if (event.target === event.currentTarget) dialogRef.current?.close(); }}>
        {selected && <>
          <form method="dialog"><button className="dialog-close" aria-label="关闭运动详情" autoFocus>×</button></form>
          <div className="dialog-layout">
            <div className="dialog-media"><video key={selected.id} src={`${import.meta.env.BASE_URL}${selected.video}`} poster={`${import.meta.env.BASE_URL}${selected.image}`} controls playsInline muted preload="none" aria-label={`${selected.name}运动场景视频`} /></div>
            <div className="dialog-copy"><p className="eyebrow">强化系列 / {selected.nameEn}</p><h2 id="sport-dialog-title">{selected.name}，<br />每一份热爱都有迹可循。</h2><p>{selected.description}</p><h3>让这些瞬间，成为你的积累。</h3><ul>{selected.archiveItems.map(item => <li key={item}>{item}</li>)}</ul><p className="quiet-note">以上为运动档案方向介绍，实际功能与开放时间以正式发布为准。</p>{selected.id === "billiards" && <button className="button-blue" onClick={() => { dialogRef.current?.close(); scrollToSection("product"); }}>查看强化印记台球界面 <span aria-hidden="true">↗</span></button>}</div>
          </div>
        </>}
      </dialog>
    </section>
  );
}
