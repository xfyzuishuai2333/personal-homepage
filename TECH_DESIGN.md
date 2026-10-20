# TECH_DESIGN · 技术设计文档

## 一、技术栈选择

| 层 | 选型 | 理由 |
|---|---|---|
| 前端 | 原生 HTML5 + CSS3 + JavaScript (ES6+) | 零构建、零依赖，部署到任意静态托管平台都 100% 成功 |
| 样式 | 手写 CSS（CSS 变量 + Flexbox/Grid） | 体积小，深色主题切换方便 |
| 星空 | Canvas 2D API | 粒子闪烁 + 视差，性能可控 |
| 数据存储 | localStorage | 纯静态站点无后端，后台修改的数据持久化在浏览器本地 |
| 部署 | Vercel / Cloudflare Pages | 免费、全球 CDN、GitHub 推送自动部署 |
| 版本管理 | Git + GitHub | 每次功能提交一次，可回滚 |

> 为什么不用 React/Vite：本项目为纯展示 + 本地数据管理，无复杂状态与路由需求；原生方案首屏更快、构建零风险，符合 MVP 原则。

## 二、项目结构

```
personal-homepage/
├── index.html        # 前台主页（访客看到的一切）
├── admin.html        # 后台管理页（站长修改内容）
├── css/
│   └── style.css     # 全站样式（CSS 变量定义主题色）
├── js/
│   ├── data.js       # 默认数据 + localStorage 读写封装
│   ├── stars.js      # 星空 Canvas 粒子动画
│   ├── main.js       # 前台渲染逻辑（读数据 → 渲染 DOM）
│   └── admin.js      # 后台逻辑（表单 → 保存 localStorage）
├── PRD.md            # 产品需求文档
├── TECH_DESIGN.md    # 技术设计文档（本文件）
└── AGENTS.md         # AI 代理指令
```

## 三、数据模型

存于 localStorage，键：`ph_site_data_v1`

```json
{
  "profile": {
    "name": "姓名",
    "title": "职位/身份",
    "tagline": "一句话介绍",
    "about": "个人简介长文本",
    "email": "邮箱",
    "github": "GitHub 链接",
    "location": "所在地"
  },
  "skills": [
    { "category": "前端", "name": "HTML/CSS", "level": 90 }
  ],
  "projects": [
    { "name": "项目名", "desc": "描述", "tags": ["JS"], "link": "https://..." }
  ],
  "posts": [
    { "title": "文章标题", "date": "2026-10-20", "tags": ["随笔"], "summary": "摘要", "content": "正文" }
  ],
  "timeline": [
    { "period": "2024-至今", "event": "经历描述" }
  ]
}
```

- 前台 `main.js` 启动时 `loadData()`：localStorage 有则用，无则用 `data.js` 内置默认值
- 后台 `admin.js` 表单填充当前数据，保存时写回 localStorage

## 四、关键技术点

1. **星空性能**：粒子数按屏幕面积动态计算（移动端自动减半）；`requestAnimationFrame` 驱动；`prefers-reduced-motion` 时退化为静态星空
2. **前后台数据同步**：同一 localStorage 键；后台保存后前台刷新即生效；提供"恢复默认数据"按钮
3. **后台简易鉴权**：前端密码校验（默认 `admin123`，仅防误触，非安全方案——静态站无真后端）
4. **响应式**：CSS Grid `auto-fit minmax()` + 媒体查询三档断点
5. **无障碍**：语义化标签、按钮可键盘聚焦、对比度 AA

## 五、部署架构

```
本地开发 → git push → GitHub 仓库
                          │
              Vercel / Cloudflare Pages 监听 main 分支
                          │
                    自动构建（静态无需构建）
                          │
                    分配域名 *.vercel.app / *.pages.dev
```
