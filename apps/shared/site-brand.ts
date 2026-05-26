/**
 * 全站 Logo 统一配置
 *
 * 唯一图片文件（换 Logo 只改这一处）：
 *   web-veloxisai/fig/logo-cn.png
 *
 * 主站 index.html 引用 fig/logo-cn.png（相对路径）。
 * 子应用 TopBar 使用绝对路径 /fig/...，部署到 /roadmap/、/industry/ 时
 * 仍指向站点根目录的同一张图。
 */
export const SITE_LOGO_SRC = "/fig/logo-cn.png";
export const SITE_LOGO_ALT = "大川激流 Logo";
