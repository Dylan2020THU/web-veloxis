export function BilliardsMiniProgram() {
  return <figure style={{ margin: "24px 0", padding: 20, background: "#fff", borderRadius: 16, textAlign: "center", maxWidth: "100%" }}>
    <img src={`${import.meta.env.BASE_URL}images/billiards-miniprogram.png`} alt="“强化杆迹”小程序码" width="430" height="430" style={{ display: "block", width: 215, maxWidth: "100%", height: "auto", margin: "0 auto" }} />
    <figcaption style={{ marginTop: 12, fontSize: 14, lineHeight: 1.8, color: "#1d1d1f" }}>微信扫一扫，进入“强化杆迹”小程序<br /><span style={{ color: "#6e6e73" }}>手机端可保存图片后在微信中识别</span></figcaption>
  </figure>;
}
