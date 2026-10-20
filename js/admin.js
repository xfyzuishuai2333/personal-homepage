// ================= 后台管理逻辑 =================
// 登录校验 → 表单填充 → 收集保存 → localStorage

(function () {
  const ADMIN_PWD = 'admin123'; // 仅防误触，非安全方案

  const loginBox = document.getElementById('loginBox');
  const adminPanel = document.getElementById('adminPanel');
  const pwdInput = document.getElementById('pwdInput');
  const loginTip = document.getElementById('loginTip');

  let data = null;

  // ---- 登录 ----
  document.getElementById('loginBtn').addEventListener('click', tryLogin);
  pwdInput.addEventListener('keydown', e => { if (e.key === 'Enter') tryLogin(); });

  function tryLogin() {
    if (pwdInput.value === ADMIN_PWD) {
      loginBox.hidden = true;
      adminPanel.hidden = false;
      data = loadData();
      fillForm();
    } else {
      loginTip.textContent = '密码错误，请重试';
    }
  }

  // ---- 表单填充 ----
  function fillForm() {
    document.getElementById('fName').value = data.profile.name;
    document.getElementById('fTitle').value = data.profile.title;
    document.getElementById('fTagline').value = data.profile.tagline;
    document.getElementById('fAbout').value = data.profile.about;
    document.getElementById('fEmail').value = data.profile.email;
    document.getElementById('fLocation').value = data.profile.location;
    document.getElementById('fGithub').value = data.profile.github;

    renderTimeline();
    renderSkills();
    renderProjects();
    renderPosts();
  }

  // ---- 动态条目渲染 ----
  function renderTimeline() {
    const box = document.getElementById('timelineItems');
    box.innerHTML = '';
    data.timeline.forEach((t, i) => {
      box.appendChild(makeItem(`
        <div class="dyn-grid-2">
          <div class="field"><label>时间段</label><input data-k="period" value="${esc(t.period)}"></div>
          <div class="field"><label>事件</label><input data-k="event" value="${esc(t.event)}"></div>
        </div>`, () => { data.timeline.splice(i, 1); renderTimeline(); }));
    });
  }

  function renderSkills() {
    const box = document.getElementById('skillItems');
    box.innerHTML = '';
    data.skills.forEach((s, i) => {
      box.appendChild(makeItem(`
        <div class="dyn-grid-2">
          <div class="field"><label>分类</label><input data-k="category" value="${esc(s.category)}"></div>
          <div class="field"><label>名称</label><input data-k="name" value="${esc(s.name)}"></div>
        </div>
        <div class="field"><label>熟练度（0-100）</label><input type="number" data-k="level" min="0" max="100" value="${esc(s.level)}"></div>`,
        () => { data.skills.splice(i, 1); renderSkills(); }));
    });
  }

  function renderProjects() {
    const box = document.getElementById('projectItems');
    box.innerHTML = '';
    data.projects.forEach((p, i) => {
      box.appendChild(makeItem(`
        <div class="field"><label>项目名</label><input data-k="name" value="${esc(p.name)}"></div>
        <div class="field"><label>描述</label><textarea data-k="desc" rows="2">${esc(p.desc)}</textarea></div>
        <div class="dyn-grid-2">
          <div class="field"><label>标签（逗号分隔）</label><input data-k="tags" value="${esc((p.tags || []).join(','))}"></div>
          <div class="field"><label>链接</label><input data-k="link" value="${esc(p.link)}"></div>
        </div>`, () => { data.projects.splice(i, 1); renderProjects(); }));
    });
  }

  function renderPosts() {
    const box = document.getElementById('postItems');
    box.innerHTML = '';
    data.posts.forEach((p, i) => {
      box.appendChild(makeItem(`
        <div class="dyn-grid-2">
          <div class="field"><label>标题</label><input data-k="title" value="${esc(p.title)}"></div>
          <div class="field"><label>日期</label><input data-k="date" value="${esc(p.date)}" placeholder="2026-10-20"></div>
        </div>
        <div class="field"><label>标签（逗号分隔）</label><input data-k="tags" value="${esc((p.tags || []).join(','))}"></div>
        <div class="field"><label>摘要</label><textarea data-k="summary" rows="2">${esc(p.summary)}</textarea></div>
        <div class="field"><label>正文</label><textarea data-k="content" rows="4">${esc(p.content)}</textarea></div>`,
        () => { data.posts.splice(i, 1); renderPosts(); }));
    });
  }

  // 创建带删除按钮的条目容器
  function makeItem(html, onRemove) {
    const div = document.createElement('div');
    div.className = 'dyn-item';
    div.innerHTML = html;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'dyn-remove';
    btn.textContent = '✕';
    btn.title = '删除此项';
    btn.addEventListener('click', onRemove);
    div.appendChild(btn);
    return div;
  }

  // ---- 添加条目 ----
  document.getElementById('addTimeline').addEventListener('click', () => {
    collectDynamic();
    data.timeline.push({ period: '', event: '' });
    renderTimeline();
  });
  document.getElementById('addSkill').addEventListener('click', () => {
    collectDynamic();
    data.skills.push({ category: '', name: '', level: 80 });
    renderSkills();
  });
  document.getElementById('addProject').addEventListener('click', () => {
    collectDynamic();
    data.projects.push({ name: '', desc: '', tags: [], link: '' });
    renderProjects();
  });
  document.getElementById('addPost').addEventListener('click', () => {
    collectDynamic();
    data.posts.push({ title: '', date: new Date().toISOString().slice(0, 10), tags: [], summary: '', content: '' });
    renderPosts();
  });

  // ---- 从 DOM 收集动态条目 ----
  function collectDynamic() {
    collect('#timelineItems', data.timeline, ['period', 'event']);
    collect('#skillItems', data.skills, ['category', 'name', 'level'], { level: v => parseInt(v) || 0 });
    collect('#projectItems', data.projects, ['name', 'desc', 'tags', 'link'], { tags: splitTags });
    collect('#postItems', data.posts, ['title', 'date', 'tags', 'summary', 'content'], { tags: splitTags });
  }

  function collect(selector, arr, keys, converters) {
    const items = document.querySelectorAll(selector + ' .dyn-item');
    const result = [];
    items.forEach(item => {
      const obj = {};
      keys.forEach(k => {
        const el = item.querySelector(`[data-k="${k}"]`);
        let v = el ? el.value : '';
        if (converters && converters[k]) v = converters[k](v);
        obj[k] = v;
      });
      result.push(obj);
    });
    arr.length = 0;
    result.forEach(o => arr.push(o));
  }

  function splitTags(v) {
    return String(v).split(/[,，]/).map(s => s.trim()).filter(Boolean);
  }

  // ---- 保存 ----
  document.getElementById('adminForm').addEventListener('submit', e => {
    e.preventDefault();
    data.profile.name = document.getElementById('fName').value.trim();
    data.profile.title = document.getElementById('fTitle').value.trim();
    data.profile.tagline = document.getElementById('fTagline').value.trim();
    data.profile.about = document.getElementById('fAbout').value.trim();
    data.profile.email = document.getElementById('fEmail').value.trim();
    data.profile.location = document.getElementById('fLocation').value.trim();
    data.profile.github = document.getElementById('fGithub').value.trim();
    collectDynamic();

    const ok = saveData(data);
    const tip = document.getElementById('saveTip');
    tip.textContent = ok ? '✅ 已保存！刷新前台页面即可看到更新' : '❌ 保存失败（浏览器存储不可用）';
    setTimeout(() => { tip.textContent = ''; }, 4000);
  });

  // ---- 恢复默认 ----
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (confirm('确定恢复默认数据吗？你的全部修改将丢失。')) {
      data = resetData();
      fillForm();
      document.getElementById('saveTip').textContent = '已恢复默认数据';
    }
  });

  // ---- 工具 ----
  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
})();
