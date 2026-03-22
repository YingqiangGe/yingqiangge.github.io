// i18n language switcher
(function() {
  const LABELS = { en: 'EN', zh: '中', ja: '日', ko: '한', es: 'ES' };

  const NAV = {
    en: { 'Publications': 'Publications', 'CV': 'CV', 'Blog': 'Blog' },
    zh: { 'Publications': '论文', 'CV': '简历', 'Blog': '博客' },
    ja: { 'Publications': '論文', 'CV': '履歴書', 'Blog': 'ブログ' },
    ko: { 'Publications': '논문', 'CV': '이력서', 'Blog': '블로그' },
    es: { 'Publications': 'Publicaciones', 'CV': 'CV', 'Blog': 'Blog' },
  };

  const SIDEBAR = {
    en: { name: 'Yingqiang Ge, Ph.D.', bio: 'Applied Scientist at Amazon', location: 'NYC, NY' },
    zh: { name: '葛英强 博士', bio: 'Amazon 应用科学家', location: '纽约' },
    ja: { name: '葛英強 博士', bio: 'Amazon 応用科学者', location: 'ニューヨーク' },
    ko: { name: '거잉창 박사', bio: 'Amazon 응용 과학자', location: '뉴욕' },
    es: { name: 'Yingqiang Ge, Ph.D.', bio: 'Cientifico Aplicado en Amazon', location: 'Nueva York' },
  };

  const SITE_TITLE = {
    en: "Yingqiang's Homepage",
    zh: '葛英强的主页',
    ja: '葛英強のホームページ',
    ko: '거잉창의 홈페이지',
    es: 'Pagina de Yingqiang',
  };

  function setLang(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.style.display = el.getAttribute('data-i18n') === lang ? '' : 'none';
    });
    var label = document.getElementById('lang-label');
    if (label) label.textContent = LABELS[lang] || lang.toUpperCase();
    localStorage.setItem('site-lang', lang);
    document.documentElement.lang = lang;

    // translate nav links
    var navMap = NAV[lang] || NAV.en;
    document.querySelectorAll('.masthead__menu-item a').forEach(function(a) {
      var origText = a.getAttribute('data-orig-text');
      if (!origText) {
        origText = a.textContent.trim();
        a.setAttribute('data-orig-text', origText);
      }
      // match against English keys
      var enMap = NAV.en;
      for (var enKey in enMap) {
        if (origText === enKey || Object.values(NAV).some(function(m) { return m[enKey] === origText; })) {
          if (navMap[enKey]) a.textContent = navMap[enKey];
          break;
        }
      }
    });

    // translate sidebar
    var sb = SIDEBAR[lang] || SIDEBAR.en;
    var nameEl = document.querySelector('.author__name');
    if (nameEl) nameEl.textContent = sb.name;
    var bioEl = document.querySelector('.author__bio');
    if (bioEl) bioEl.textContent = sb.bio;
    var locEl = document.querySelector('.author__desktop');
    if (locEl && sb.location) {
      var icon = locEl.querySelector('i');
      locEl.textContent = '';
      if (icon) locEl.appendChild(icon);
      locEl.appendChild(document.createTextNode(sb.location));
    }

    // translate site title
    var titleLink = document.querySelector('.masthead__menu-item--lg a');
    if (titleLink && SITE_TITLE[lang]) {
      titleLink.textContent = SITE_TITLE[lang];
    }

    // translate page title (h1.page__title)
    var PAGE_TITLE = {
      'Blog posts': { zh: '博客文章', ja: 'ブログ記事', ko: '블로그 게시물', es: 'Publicaciones del Blog' },
      'CV': { zh: '简历', ja: '履歴書', ko: '이력서', es: 'CV' },
      'Publications': { zh: '论文', ja: '論文', ko: '논문', es: 'Publicaciones' },
    };
    var pageTitle = document.querySelector('.page__title');
    if (pageTitle) {
      var origTitle = pageTitle.getAttribute('data-orig-title');
      if (!origTitle) {
        origTitle = pageTitle.textContent.trim();
        pageTitle.setAttribute('data-orig-title', origTitle);
      }
      var pt = PAGE_TITLE[origTitle];
      pageTitle.textContent = (pt && pt[lang]) || origTitle;
    }
  }

  function init() {
    var lang = localStorage.getItem('site-lang') || (navigator.language || '').slice(0, 2);
    if (!LABELS[lang]) lang = 'en';

    // dropdown toggle
    var btn = document.getElementById('lang-btn');
    var menu = document.getElementById('lang-menu');
    if (btn && menu) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
      });
      menu.querySelectorAll('[data-lang]').forEach(function(a) {
        a.addEventListener('click', function(e) {
          e.preventDefault();
          setLang(a.getAttribute('data-lang'));
          menu.style.display = 'none';
        });
      });
      document.addEventListener('click', function() { menu.style.display = 'none'; });
    }

    setLang(lang);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
