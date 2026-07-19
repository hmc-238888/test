'use strict';

/* ─── Loading Screen + Music Prompt (pauses at 50%) ─────────────────── */
(function () {
  const screen  = document.getElementById('loading-screen');
  const bar     = document.getElementById('loading-bar');
  const pct     = document.getElementById('loading-percent');
  const overlay = document.getElementById('music-prompt-overlay');
  const btnYes  = document.getElementById('music-prompt-yes');
  const btnNo   = document.getElementById('music-prompt-no');

  let progress      = 0;
  let paused        = false;
  let halfwayShown  = false;

  function finishLoading() {
    setTimeout(() => {
      screen.style.opacity = '0';
      screen.style.pointerEvents = 'none';
      setTimeout(() => { screen.style.display = 'none'; }, 500);
    }, 300);
  }

  function showMusicPrompt() {
    paused = true;
    overlay.classList.add('show');
    requestAnimationFrame(() => overlay.classList.add('visible'));
  }

  function hideMusicPromptAndResume() {
    overlay.classList.remove('visible');
    setTimeout(() => overlay.classList.remove('show'), 300);
    paused = false;
    tick();
  }

  btnYes.addEventListener('click', () => {
    if (window.startBackgroundMusic) window.startBackgroundMusic();
    hideMusicPromptAndResume();
  });
  btnNo.addEventListener('click', () => {
    hideMusicPromptAndResume();
  });

  function tick() {
    if (paused) return;

    const step = Math.floor(Math.random() * 15) + 5;
    progress = Math.min(progress + step, 100);
    bar.style.width = progress + '%';
    pct.textContent = progress + '%';

    // Dừng lại đúng lúc chạm mốc 50% để hỏi bật nhạc
    if (!halfwayShown && progress >= 50) {
      halfwayShown = true;
      showMusicPrompt();
      return;
    }

    if (progress >= 100) {
      finishLoading();
      return;
    }

    setTimeout(tick, 100);
  }

  tick();
})();

/* ─── Background Music (YouTube) — load API as early as possible ────── */
var ytPlayer      = null;
var ytReady       = false;
var musicPlaying  = false;
var YT_VIDEO_ID   = 'lcxIND8GXpw';

window.onYouTubeIframeAPIReady = function () {
  ytPlayer = new YT.Player('yt-player', {
    height: '0',
    width: '0',
    videoId: YT_VIDEO_ID,
    playerVars: {
      autoplay: 0,
      controls: 0,
      loop: 1,
      playlist: YT_VIDEO_ID,
      playsinline: 1
    },
    events: {
      onReady: function () {
        ytReady = true;
        if (window.__pendingPlay) window.startBackgroundMusic();
      }
    }
  });
};

// Nạp script YouTube API ngay lập tức, song song với loading bar,
// để player đã sẵn sàng từ trước khi người dùng bấm "Có" ở mốc 50%.
(function loadYouTubeAPI() {
  var tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
})();

window.startBackgroundMusic = function () {
  var toggle = document.getElementById('music-toggle');
  if (!ytReady || !ytPlayer) { window.__pendingPlay = true; return; }
  ytPlayer.setVolume(50);
  ytPlayer.unMute();
  ytPlayer.playVideo();
  musicPlaying = true;
  if (toggle) {
    toggle.classList.add('playing');
    toggle.querySelector('i').className = 'fa-solid fa-volume-high';
  }
};

(function () {
  var toggle = document.getElementById('music-toggle');
  if (!toggle) return;
  toggle.classList.add('visible'); // luôn hiện nút để bật/tắt nhạc bất cứ lúc nào

  toggle.addEventListener('click', function () {
    if (!ytReady) return;
    if (musicPlaying) {
      ytPlayer.pauseVideo();
      musicPlaying = false;
      toggle.classList.remove('playing');
      toggle.querySelector('i').className = 'fa-solid fa-music';
    } else {
      ytPlayer.unMute();
      ytPlayer.setVolume(50);
      ytPlayer.playVideo();
      musicPlaying = true;
      toggle.classList.add('playing');
      toggle.querySelector('i').className = 'fa-solid fa-volume-high';
    }
  });
})();

/* ─── Header: scroll + hamburger ────────────────────────────────────── */
(function () {
  const header   = document.getElementById('header');
  const drawer   = document.getElementById('mobile-drawer');
  const backdrop = document.getElementById('menu-backdrop');
  const hambBtn  = document.getElementById('hamburger-btn');
  const closeBtn = document.getElementById('close-menu-btn');
  const navLinks = document.querySelectorAll('.mobile-nav-link');

  function openMenu() {
    drawer.classList.add('open');
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    drawer.classList.remove('open');
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }
  function toggleMenu() {
    drawer.classList.contains('open') ? closeMenu() : openMenu();
  }

  hambBtn.addEventListener('click', toggleMenu);
  closeBtn.addEventListener('click', closeMenu);
  backdrop.addEventListener('click', closeMenu);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  navLinks.forEach(a => a.addEventListener('click', closeMenu));

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
    const btn = document.getElementById('back-to-top');
    if (btn) btn.style.display = window.scrollY > 300 ? 'flex' : 'none';
  }, { passive: true });
})();

/* ─── Hero Typing Animation ─────────────────────────────────────────── */
(function () {
  const el    = document.getElementById('typing-text');
  if (!el) return;
  const roles = ['Ethical Hacker', 'Developer', 'Facebook Marketing', 'Security Services', 'Website Development'];
  let idx = 0, charIdx = 0, deleting = false;

  function tick() {
    const word = roles[idx % roles.length];
    el.textContent = deleting
      ? word.substring(0, charIdx - 1)
      : word.substring(0, charIdx + 1);

    charIdx = deleting ? charIdx - 1 : charIdx + 1;

    if (!deleting && charIdx === word.length + 1) {
      deleting = true;
      setTimeout(tick, 1500);
      return;
    }
    if (deleting && charIdx === 0) {
      deleting = false;
      idx++;
    }
    setTimeout(tick, deleting ? 50 : 100);
  }
  tick();
})();

/* ─── Scroll Reveal ─────────────────────────────────────────────────── */
(function () {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('active'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
})();

/* ─── Counter Animation ─────────────────────────────────────────────── */
(function () {
  function animateCount(el, target, suffix, duration) {
    let start = 0;
    const fps   = 60;
    const total = duration / (1000 / fps);
    const step  = target / total;
    function frame() {
      start = Math.min(start + step, target);
      el.textContent = Math.floor(start) + suffix;
      if (start < target) requestAnimationFrame(frame);
    }
    frame();
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el     = e.target;
        const target = parseInt(el.dataset.target, 10);
        const suffix = el.dataset.suffix || '';
        animateCount(el, target, suffix, 2000);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.counter').forEach(el => obs.observe(el));
})();

/* ─── Services: Search + Filter ─────────────────────────────────────── */
(function () {
  const searchEl   = document.getElementById('service-search');
  const chips      = document.querySelectorAll('.service-filter-chip');
  const cards      = document.querySelectorAll('.service-card[data-title]');
  const noResults  = document.getElementById('no-services');
  if (!searchEl) return;

  function run() {
    const q      = searchEl.value.toLowerCase().trim();
    const active = document.querySelector('.service-filter-chip.active')?.dataset.filter || 'All';
    let shown = 0;

    cards.forEach(card => {
      const title    = card.dataset.title.toLowerCase();
      const desc     = card.dataset.desc.toLowerCase();
      const category = card.dataset.category;

      const matchSearch = !q || title.includes(q) || desc.includes(q);
      const matchFilter =
        active === 'All' ||
        category === active ||
        (active === 'Bảo mật' && title.includes('bảo mật'));

      const show = matchSearch && matchFilter;
      card.style.display = show ? '' : 'none';
      if (show) shown++;
    });

    if (noResults) noResults.style.display = shown === 0 ? 'block' : 'none';
  }

  searchEl.addEventListener('input', run);
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      run();
    });
  });
})();

/* ─── Pricing Tabs ──────────────────────────────────────────────────── */
(function () {
  const tabs   = document.querySelectorAll('.pricing-tab');
  const panels = document.querySelectorAll('.pricing-panel');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t   => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const panel = document.getElementById('pricing-panel-' + tab.dataset.tab);
      if (panel) panel.classList.add('active');
    });
  });
})();

/* ─── FAQ: Search + Filter + Accordion ──────────────────────────────── */
(function () {
  const searchEl  = document.getElementById('faq-search');
  const catChips  = document.querySelectorAll('.faq-cat-chip');
  const items     = document.querySelectorAll('.faq-item');
  const noResults = document.getElementById('no-faqs');
  if (!searchEl) return;

  function filterFAQs() {
    const q      = searchEl.value.toLowerCase().trim();
    const active = document.querySelector('.faq-cat-chip.active')?.dataset.cat || 'Tất cả';
    let shown = 0;

    items.forEach(item => {
      const question = item.dataset.q.toLowerCase();
      const answer   = item.dataset.a.toLowerCase();
      const cat      = item.dataset.cat;

      const matchSearch = !q || question.includes(q) || answer.includes(q);
      const matchCat    = active === 'Tất cả' || cat === active;

      const show = matchSearch && matchCat;
      item.style.display = show ? '' : 'none';
      if (show) shown++;
    });

    if (noResults) noResults.style.display = shown === 0 ? 'block' : 'none';
  }

  searchEl.addEventListener('input', filterFAQs);
  catChips.forEach(chip => {
    chip.addEventListener('click', () => {
      catChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      filterFAQs();
    });
  });

  // Accordion
  items.forEach(item => {
    const btn    = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const icon   = btn.querySelector('i');

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all
      items.forEach(i => {
        i.classList.remove('open');
        const a = i.querySelector('.faq-answer');
        if (a) a.style.maxHeight = '0';
      });

      // Open this one if it was closed
      if (!isOpen) {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
})();

/* ─── Contact: Copy to Clipboard ────────────────────────────────────── */
(function () {
  window.copyLink = function (text, type) {
    if (!navigator.clipboard) {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    } else {
      navigator.clipboard.writeText(text);
    }

    showToast('Đã sao chép liên kết!');

    const btn  = document.getElementById('copy-' + type);
    if (!btn) return;
    const icon = btn.querySelector('i');
    const prev = icon.className;
    icon.className = 'fa-solid fa-check';
    setTimeout(() => { icon.className = prev; }, 2000);
  };
})();

/* ─── Toast ─────────────────────────────────────────────────────────── */
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

/* ─── Back to Top ───────────────────────────────────────────────────── */
(function () {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ─── Cursor Glow ───────────────────────────────────────────────────── */
(function () {
  const el = document.getElementById('cursor-glow');
  if (!el) return;
  document.addEventListener('mousemove', (e) => {
    el.style.left = e.clientX + 'px';
    el.style.top  = e.clientY + 'px';
  }, { passive: true });
})();
