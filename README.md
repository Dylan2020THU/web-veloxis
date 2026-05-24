# 大川激流 Veloxis · 公司官网

[`www.veloxisai.com`](https://www.veloxisai.com) 的静态主站源码。

## 结构

```
.
├── index.html              首页（业务板块、英雄区、页脚）
├── style.css               样式
├── fig/                    图片、视频、favicon 等资源
├── roadmap/                AI 学习基地（由 web-veloxis-ai-roadmap 构建产物同步而来）
├── scripts/
│   └── sync-roadmap.ps1    一键同步 roadmap 构建产物的 PowerShell 脚本
└── CNAME                   GitHub Pages 自定义域名声明（www.veloxisai.com）
```

## 部署架构

- **`www.veloxisai.com/`** → 本仓库（公司官网，纯静态 HTML/CSS）
- **`www.veloxisai.com/roadmap/`** → 平行仓库 [`web-veloxis-ai-roadmap`](https://github.com/Dylan2020THU/web-veloxis-ai) 的 `npm run build` 产物，已同步到本仓库的 `roadmap/` 子目录

域名 CNAME 记录指向 `dylan2020thu.github.io`，GitHub Pages 根据本仓库根目录的 `CNAME` 文件路由到本站。

## 本地预览

直接用任意静态服务器即可，例如：

```powershell
# 方式一：python
python -m http.server 8080

# 方式二：Node serve
npx serve .
```

然后访问 <http://localhost:8080>。

## 更新 AI 学习基地（roadmap）

平行仓库 `web-veloxis-ai-roadmap` 是一个 Vite + React SPA，已配置成以 `/roadmap/` 为 `base` 构建。每次它有更新后，在本仓库执行：

```powershell
# 默认会在 ../web-veloxis-ai-roadmap 里 npm run build，再把 dist/* 拷到 ./roadmap/
.\scripts\sync-roadmap.ps1

# 如果 roadmap 源码不在默认位置：
.\scripts\sync-roadmap.ps1 -RoadmapPath "F:\path\to\web-veloxis-ai-roadmap"

# 如果只想重新同步、不再 build：
.\scripts\sync-roadmap.ps1 -SkipBuild
```

脚本会自动删掉 `roadmap/CNAME`（如果存在），保证只有仓库根的 CNAME 生效。

同步完成后：

```powershell
git add roadmap
git commit -m "chore(roadmap): sync to <commit-hash-or-date>"
git push
```

GitHub Pages 会自动重新发布。

## 发布到 GitHub Pages

仓库 Settings → Pages：
- Source: `Deploy from a branch`
- Branch: `main` / root（`/`）
- Custom domain: `www.veloxisai.com`
- Enforce HTTPS: 勾选
