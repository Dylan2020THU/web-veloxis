import { BilliardsMiniProgram } from "../components/BilliardsMiniProgram";
import { SportSelector } from "../components/SportSelector";
import { scrollToSection } from "../lib/navigation";

const heatmap = [1, 0, 2, 3, 1, 0, 2, 2, 1, 3, 0, 1, 2, 3, 1, 2, 0, 3, 2, 1, 3, 1, 2, 0, 2, 3, 2, 1, 3, 0, 1, 2, 3, 2, 1, 3, 2, 3, 1, 2, 0, 3, 2, 1, 3, 2, 3, 2, 1, 3, 2, 3, 1, 3, 2, 3];

export default function Home() {
  return (
    <main id="sports-home" className="sports-page">
      <section className="sports-hero" aria-labelledby="hero-title">
        <div className="hero-intro">
          <p className="eyebrow">大川激流 · 智能体育</p>
          <h1 id="hero-title">开创运动者的<br /><span>大档案时代</span></h1>
          <p className="hero-description">每个运动者，都值得拥有自己的运动大档案。<br />让你的运动数据，承载你、托举你、强化你。</p>
          <div className="hero-actions">
            <button className="button-blue" onClick={() => scrollToSection("series")}>探索强化系列 <span aria-hidden="true">↗</span></button>
            <button className="text-link" onClick={() => scrollToSection("archive")}>认识运动大档案 <span aria-hidden="true">›</span></button>
          </div>
        </div>
        <div className="hero-stage">
          <img className="hero-swimmer" src={`${import.meta.env.BASE_URL}images/sports-hero.png`} alt="泳者划开蓝色水面，向前游进" fetchPriority="high" width="1536" height="1024" />
          <div className="hero-image-shade" />
          <div className="hero-image-copy"><span>EVERY MOVE. PART OF YOU.</span><p>你的每一次向前<br />都值得被看见</p></div>
          <div className="archive-preview" aria-label="运动档案概念示意">
            <div className="preview-top"><span className="archive-mark" aria-hidden="true">↗</span><div><strong>我的运动大档案</strong><span>把热爱，积累成自己。</span></div><span className="preview-label">概念示意</span></div>
            <div className="preview-sports"><span>游泳</span><span>健身</span><span>台球</span><span>更多热爱 +</span></div>
            <div className="preview-chart" aria-hidden="true"><svg viewBox="0 0 320 82"><defs><linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#067ef9" stopOpacity=".18"/><stop offset="100%" stopColor="#067ef9" stopOpacity="0"/></linearGradient></defs><path d="M0 70C20 70 21 46 45 50S76 64 98 41S125 60 150 35S179 42 201 24S231 39 255 15S292 21 320 5V82H0Z" fill="url(#chart-fill)"/><path d="M0 70C20 70 21 46 45 50S76 64 98 41S125 60 150 35S179 42 201 24S231 39 255 15S292 21 320 5" fill="none" stroke="#067ef9" strokeWidth="3"/></svg></div>
            <div className="preview-bottom"><span>每一次记录</span><span>都在成为更好的你 <b>↗</b></span></div>
          </div>
          <span className="image-caption">运动场景为品牌概念影像</span>
        </div>
      </section>

      <section id="archive" className="archive-section section-space" aria-labelledby="archive-title">
        <div className="section-heading"><p className="eyebrow">你的运动，你的大档案</p><h2 id="archive-title">每一次运动<br />都成为你的积累</h2><p>热爱不只发生在场上。<br />我们希望通过「强化系列」App，将散落的运动记录，<br className="desktop-break" />汇成一份属于你、持续生长的运动大档案。</p></div>
        <div className="archive-story">
          <div className="archive-story-copy"><span className="section-index">01 / 记录，开始有了意义</span><h3>从一个瞬间<br />到一段成长</h3><p>一次训练、一场切磋、一个新的突破。<br />那些曾经一闪而过的努力，<br />值得在你的运动人生里，留下位置。</p><div className="story-tags"><span>训练记录</span><span>运动印记</span><span>成长轨迹</span></div><p className="quiet-note">右侧为运动大档案概念示意。</p></div>
          <div className="archive-sheet">
            <div className="sheet-top"><div className="sheet-avatar">你</div><div><span>MY SPORTS ARCHIVE</span><h4>属于你的，运动人生。</h4></div><span className="sheet-badge">持续生长</span></div>
            <div className="sheet-rule" />
            <div className="sheet-subtitle"><strong>每一格，都是投入的印记。</strong><span>训练印记 · 示意</span></div>
            <div className="activity-grid" aria-hidden="true">{heatmap.map((level, i) => <i key={i} data-level={level} />)}</div>
            <div className="activity-legend"><span>把日复一日，变成看得见的积累。</span><span>少 <i /> <i /> <i /> 多</span></div>
            <div className="sheet-entry"><span className="entry-icon">↗</span><div><strong>训练有记录</strong><span>记住投入的时间，也记住当时的自己。</span></div></div>
            <div className="sheet-entry"><span className="entry-icon">◎</span><div><strong>成长有来处</strong><span>回看走过的路，为下一次出发找到依据。</span></div></div>
            <div className="sheet-footer"><span>强化系列</span><span>让热爱，有迹可循。</span></div>
          </div>
        </div>
      </section>

      <section className="values-section section-space" aria-labelledby="values-title">
        <div className="section-heading"><p className="eyebrow">数据的意义，始终是你。</p><h2 id="values-title">承载你  托举你<br /><span>强化你</span></h2><p>让数据从一次记录，成为一路同行的力量。</p></div>
        <div className="value-grid">
          <article><span className="value-number">01</span><div className="value-art value-stack" aria-hidden="true"><i/><i/><i/><span>每一份努力，都有位置。</span></div><h3>承载你</h3><h4>留住每一次投入</h4><p>把分散的运动经历沉淀下来。你的热爱、坚持与突破，都值得被认真记录。</p></article>
          <article><span className="value-number">02</span><div className="value-art value-bars" aria-hidden="true">{[25, 42, 36, 61, 52, 78, 94].map((height, i) => <i key={i} style={{ height: `${height}%` }} />)}</div><h3>托举你</h3><h4>让积累成为下一步的依据</h4><p>回看自己的运动轨迹，理解状态与节奏，让每一次重新出发，都有迹可循。</p></article>
          <article><span className="value-number">03</span><div className="value-art value-rings" aria-hidden="true"><i/><i/><i/><span>↗</span></div><h3>强化你</h3><h4>看见变化，持续向前</h4><p>与过去的自己相遇，看见点滴变化。让成长的成就感，成为继续热爱的动力。</p></article>
        </div>
      </section>

      <SportSelector />

      <section id="product" className="product-section section-space" aria-labelledby="product-title">
        <div className="product-copy"><p className="eyebrow">强化系列 · 产品一瞥</p><h2 id="product-title">让每一次练习，<br />留下你的印记。</h2><p>从「强化印记台球」出发，<br />让记录走进真实的运动日常。</p><BilliardsMiniProgram /><div className="product-features"><div><span>01</span><p><strong>记录一次训练</strong>为当下的投入，留下清晰记录。</p></div><div><span>02</span><p><strong>回看训练印记</strong>让日积月累的练习，有迹可循。</p></div></div><p className="quiet-note">展示为现有微信小程序界面。强化系列 App 的功能与开放时间，以正式发布为准。</p></div>
        <div className="product-phones"><figure className="product-phone phone-back"><img src={`${import.meta.env.BASE_URL}images/billiards-record.png`} alt="强化印记台球微信小程序：记录一次训练界面" width="230" height="633" loading="lazy" /><figcaption>记录当下</figcaption></figure><figure className="product-phone phone-front"><img src={`${import.meta.env.BASE_URL}images/billiards-archive.png`} alt="强化印记台球微信小程序：训练印记图界面" width="230" height="633" loading="lazy" /><figcaption>看见积累</figcaption></figure></div>
      </section>

      <section id="vision" className="vision-section"><p className="eyebrow">属于每一个运动者的未来</p><h2>让运动留下的，<br />不止汗水。</h2><p>还有一份不断生长的档案，<br />和一个不断被强化的自己。</p><button className="button-blue" onClick={() => scrollToSection("series")}>找到你的热爱 <span aria-hidden="true">↗</span></button><a className="text-link" href="mailto:dylanzhang@veloxisai.com">与我们一起开创 <span aria-hidden="true">›</span></a></section>
      <footer className="sports-footer"><div><a href="/">大川激流 <span>VELOXIS</span></a><p>融入、探索智能时代激流。</p></div><p>本页档案概念及运动场景用于品牌理念展示，具体功能以各产品正式开放版本为准。</p><div className="footer-line"><span>© 2026 北京大川激流科技有限公司</span><button onClick={() => scrollToSection("sports-home")}>返回顶部 ↑</button></div></footer>
    </main>
  );
}
