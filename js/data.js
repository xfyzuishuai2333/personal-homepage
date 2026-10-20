// ================= 数据层 =================
// 默认站点数据 + localStorage 读写封装

const STORAGE_KEY = 'ph_site_data_v1';

// 默认数据（首次访问或恢复默认时使用）
const DEFAULT_DATA = {
  profile: {
    name: '小明',
    title: '软件工程学生 · 前端开发爱好者',
    tagline: '用代码构建有趣的东西，用好奇心探索技术的边界。',
    about: '你好！我是一名软件工程专业的学生，热爱前端开发与 AI 工具应用。平时喜欢折腾浏览器扩展、静态网站和各类效率工具。目前正在系统学习软件工程实践，希望把课堂知识变成真正上线的产品。这个网站展示了我最近做的一些小项目和学习记录。',
    email: 'hello@example.com',
    github: 'https://github.com/xfyzuishuai2333',
    location: '中国 · 大连'
  },
  timeline: [
    { period: '2024 — 至今', event: '软件工程专业在读，系统学习软件工程与项目管理' },
    { period: '2025', event: '开始前端开发学习，完成多个静态网站项目' },
    { period: '2026', event: '学习 AI 辅助编程，用 Cline/Trae 完成实训项目并部署上线' }
  ],
  skills: [
    { category: '前端', name: 'HTML / CSS', level: 90 },
    { category: '前端', name: 'JavaScript', level: 82 },
    { category: '前端', name: '响应式布局', level: 80 },
    { category: '工具', name: 'Git / GitHub', level: 78 },
    { category: '工具', name: 'AI 辅助编程', level: 85 },
    { category: '语言', name: 'C++ 基础', level: 65 }
  ],
  projects: [
    { name: '番茄专注 · Tomato Focus', desc: 'Edge 浏览器番茄钟扩展：三种计时模式、今日统计、桌面通知，配套 GitHub Pages 官网。', tags: ['Edge扩展', 'JavaScript', 'Manifest V3'], link: 'https://github.com/xfyzuishuai2333/tomato-focus' },
    { name: '四分化健身计划 · Daily Fit', desc: '健身计划工具 + Edge 扩展：按日自动匹配训练部位、器械组数、三餐饮食与卡路里目标。', tags: ['Edge扩展', 'GitHub Pages', 'localStorage'], link: 'https://github.com/xfyzuishuai2333/fitness-ext' },
    { name: '倒计时小工具', desc: '多倒计时管理工具：翻页时钟动画、六种标记、鼓励语艺术字轮播，部署于 GitHub Pages。', tags: ['静态网站', 'CSS动画'], link: 'https://github.com/xfyzuishuai2333/countdown-tool' },
    { name: '个人展示网站', desc: '就是本站：深色星空主题，前后台分离，后台可随时修改展示内容。', tags: ['静态网站', 'Canvas'], link: '#' }
  ],
  posts: [
    { title: '我的第一个 Edge 扩展开发记录', date: '2026-10-19', tags: ['扩展开发'], summary: '从 manifest.json 到弹窗页面，记录番茄钟扩展的完整开发过程与踩坑。', content: '开发 Edge 扩展的第一步是编写 manifest.json（Manifest V3）。本次踩坑记录：default_locale 字段需要配套的 _locales 目录，纯中文硬编码项目直接删除该字段即可。弹窗页面与普通网页无异，同一套 HTML/CSS/JS 既可以做扩展弹窗，也可以部署成网页，实现双端复用。' },
    { title: 'AI 辅助编程的实训心得', date: '2026-10-15', tags: ['AI', '实训'], summary: '用 AI 工具一周完成四个上线项目，聊聊提示词、文档驱动开发与迭代策略。', content: '这一周我用 AI 辅助完成了倒计时工具、健身计划网站、两个 Edge 扩展。最大心得：1）先写 PRD 再写代码，AI 的理解准确度会高很多；2）复杂任务拆小步，每步验证；3）Git 勤提交，出问题可回滚。AI 不是魔法，清晰的意图表达才是。' },
    { title: '静态网站部署方案对比', date: '2026-10-12', tags: ['部署'], summary: 'GitHub Pages / Vercel / Cloudflare Pages 三个免费静态托管平台的实际使用体验。', content: 'GitHub Pages 推送即部署，最省心；Vercel 与 Cloudflare Pages 从 GitHub 导入仓库后自动部署，自带全球 CDN，国内访问速度 Cloudflare 更稳。三者都适合纯静态项目，按需求选择即可。' }
  ]
};

// 读取数据：localStorage 优先，无则返回默认值的深拷贝
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // 合并默认值，防止旧版本字段缺失
      return {
        profile: { ...DEFAULT_DATA.profile, ...(parsed.profile || {}) },
        timeline: parsed.timeline || DEFAULT_DATA.timeline,
        skills: parsed.skills || DEFAULT_DATA.skills,
        projects: parsed.projects || DEFAULT_DATA.projects,
        posts: parsed.posts || DEFAULT_DATA.posts
      };
    }
  } catch (e) { /* 隐私模式等场景降级为默认数据 */ }
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

// 保存数据到 localStorage
function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    return false;
  }
}

// 恢复默认数据
function resetData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) { /* ignore */ }
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}
