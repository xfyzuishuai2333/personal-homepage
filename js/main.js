// ================= 前台渲染 =================
// 读取数据 → 渲染各模块

(function () {
  const data = loadData();

  // ---- 个人信息 ----
  document.title = `${data.profile.name}的个人主页`;
  document.getElementById('navName').textContent = data.profile.name;
  document.getElementById('heroName').textContent = data.profile.name;
  document.getElementById('heroTitle').textContent = data.profile.title;
  document.getElementById('heroTagline').textContent = data.profile.tagline;
  document.getElementById('aboutText').textContent = data.profile.about;
  document.getElementById('aboutLocation').textContent = data.profile.location;
  document.getElementById('footerName').textContent = data.profile.name;
  document.getElementById('githubLink').href = data.profile.github;

  // ---- 经历时间线 ----
  const timelineUl = document.getElementById('timelineList');
  data.timeline.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="timeline-period">${escapeHtml(item.period)}</span><span class="timeline-event">${escapeHtml(item.event)}</span>`;
    timelineUl.appendChild(li);
  });

  // ---- 技能 ----
  const skillsGrid = document.getElementById('skillsGrid');
  data.skills.forEach(s => {
    const div = document.createElement('div');
    div.className = 'card skill-card';
    div.innerHTML = `
      <div class="skill-head">
        <span class="skill-name">${escapeHtml(s.name)}</span>
        <span class="skill-cat">${escapeHtml(s.category)}</span>
      </div>
      <div class="skill-bar"><div class="skill-fill" style="width:${clamp(s.level, 0, 100)}%"></div></div>
      <div class="skill-level">${clamp(s.level, 0, 100)}%</div>`;
    skillsGrid.appendChild(div);
  });

  // ---- 项目 ----
  const projectsGrid = document.getElementById('projectsGrid');
  data.projects.forEach(p => {
    const tags = (p.tags || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('');
    const div = document.createElement('a');
    div.className = 'card project-card';
    div.href = p.link || '#';
    if (p.link && p.link !== '#') { div.target = '_blank'; div.rel = 'noopener'; }
    div.innerHTML = `
      <h3 class="project-name">${escapeHtml(p.name)}</h3>
      <p class="project-desc">${escapeHtml(p.desc)}</p>
      <div class="project-tags">${tags}</div>
      <span class="project-link">查看 →</span>`;
    projectsGrid.appendChild(div);
  });

  // ---- 博客 ----
  const postsList = document.getElementById('postsList');
  data.posts.forEach(post => {
    const tags = (post.tags || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('');
    const article = document.createElement('article');
    article.className = 'card post-card';
    article.innerHTML = `
      <button class="post-head" aria-expanded="false">
        <div>
          <h3 class="post-title">${escapeHtml(post.title)}</h3>
          <div class="post-meta">${escapeHtml(post.date)} ${tags}</div>
          <p class="post-summary">${escapeHtml(post.summary)}</p>
        </div>
        <span class="post-arrow">▾</span>
      </button>
      <div class="post-content" hidden>${escapeHtml(post.content)}</div>`;
    // 点击展开/收起全文
    const head = article.querySelector('.post-head');
    const content = article.querySelector('.post-content');
    head.addEventListener('click', () => {
      const open = content.hidden;
      content.hidden = !open;
      head.setAttribute('aria-expanded', String(open));
      head.querySelector('.post-arrow').textContent = open ? '▴' : '▾';
    });
    postsList.appendChild(article);
  });

  // ---- 复制邮箱 ----
  const copyBtn = document.getElementById('copyEmailBtn');
  const copyTip = document.getElementById('copyTip');
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(data.profile.email);
      copyTip.textContent = `✅ 已复制：${data.profile.email}`;
    } catch (e) {
      copyTip.textContent = `邮箱：${data.profile.email}（请手动复制）`;
    }
    setTimeout(() => { copyTip.textContent = ''; }, 3000);
  });

  // ---- 移动端导航 ----
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  links.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => links.classList.remove('open'))
  );

  // ---- 工具函数 ----
  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function clamp(n, min, max) {
    n = Number(n) || 0;
    return Math.min(max, Math.max(min, n));
  }
})();
