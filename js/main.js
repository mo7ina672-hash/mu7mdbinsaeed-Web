(function () {
  'use strict';

  /* ----- إعدادات عامة (عدّل المسارات أو الفترات هنا) ----- */
  const SLIDER_IMAGES = [
    'images/bi.png',
    'images/ui.png',
    'images/sm.png'
  ]; // مصفوفة صور السلايدر
  const SLIDER_INTERVAL = 3000; // فترة تغيير الصورة (ملليثانية)
  const SLIDER_TRANSITION_MS = 1000; // مدة الانتقال (يجب مطابقتها في CSS)
  const SERVICES_GAP = 10; // gap بين بطاقات الخدمات (مطابقة للـ CSS)

  /* ======= شرح سريع: كل دالة أدناه تتأكد من وجود العناصر قبل العمل ======= */

  // تعليق: تهيئة النافبار (القائمة المتجاوبة - الهامبورجر)
  function initNavbar() {
    const menuIcon = document.querySelector('.hamburger');
    const navLinks = document.querySelector('nav ul');
    if (!menuIcon || !navLinks) return;
    if (menuIcon.dataset.navInit) return;
    menuIcon.dataset.navInit = '1';

    menuIcon.addEventListener('click', () => navLinks.classList.toggle('active'));
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('active')));
  }

  // تعليق: تهيئة الشريط الجانبي (زر الفتح/الغلق، إغلاق عند النقر على رابط أو خارج الشريط)
  function initSidebar() {
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const sidebarLinks = document.querySelectorAll('.sidebar-menu a');

    if (!sidebar || !sidebarToggle) return;
    if (sidebarToggle.dataset.sidebarInit) return;
    sidebarToggle.dataset.sidebarInit = '1';

    sidebarToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('active');
    });

    sidebarLinks.forEach(link => link.addEventListener('click', () => sidebar.classList.remove('active')));

    // إغلاق السايدبار عند النقر خارجها
    document.addEventListener('click', (e) => {
      if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target) && sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
      }
    });

    // منع أحداث داخلية من إغلاقها تلقائياً
    sidebar.addEventListener('click', (e) => e.stopPropagation());
  }

  // تعليق: كاروسيل للخدمات — يدعم RTL ويمنع السحب خارج الحد
  function initServicesCarousel() {
    const container = document.getElementById('servicesContainer');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    if (!container) return;

    let slidesToShow = window.innerWidth < 768 ? 1 : window.innerWidth < 992 ? 2 : 3;
    let currentPos = 0;

    function recalc() {
      slidesToShow = window.innerWidth < 768 ? 1 : window.innerWidth < 992 ? 2 : 3;
    }

    function update() {
      const cards = container.querySelectorAll('.service-card');
      recalc();
      if (!cards.length) return;
      if (cards.length <= slidesToShow) {
        container.style.transform = 'translateX(0)';
        currentPos = 0;
        return;
      }
      const maxPos = Math.max(cards.length - slidesToShow, 0);
      if (currentPos > maxPos) currentPos = maxPos;
      if (currentPos < 0) currentPos = 0;
      const cardWidth = cards[0].offsetWidth + SERVICES_GAP;
      const offset = cardWidth * currentPos; // إذا استخدمت RTL في CSS قد تحتاج لتعديل الإشارة
      container.style.transform = `translateX(${offset}px)`;
    }

    function next() {
      const cards = container.querySelectorAll('.service-card');
      const maxPos = Math.max(cards.length - slidesToShow, 0);
      if (currentPos < maxPos) { currentPos++; update(); }
    }

    function prev() {
      if (currentPos > 0) { currentPos--; update(); }
    }

    if (nextBtn) nextBtn.addEventListener('click', next);
    if (prevBtn) prevBtn.addEventListener('click', prev);
    window.addEventListener('resize', update);
    // تهيئة بعد وقت قصير لضمان حساب الأبعاد
    setTimeout(update, 50);
  }

  // تعليق: سلايدر الصور المتسلسل — يتحقق من وجود الصور ويستبعد المفقودة
  function initImageSlider() {
    const imgA = document.getElementById('slider-img-current');
    const imgB = document.getElementById('slider-img-next');
    if (!imgA || !imgB) return;

    function preload(src) {
      return new Promise(resolve => {
        const i = new Image();
        i.onload = () => resolve({ src, ok: true });
        i.onerror = () => resolve({ src, ok: false });
        i.src = src;
      });
    }

    Promise.all(SLIDER_IMAGES.map(preload)).then(results => {
      const valid = results.filter(r => r.ok).map(r => r.src);
      if (!valid.length) return; // لا صور صالحة -> إيقاف السلايدر

      let idx = 0;
      let showingA = true;
      imgA.src = valid[idx];
      imgA.className = 'active';
      imgB.style.display = 'none';

      function slideNext() {
        const nextIdx = (idx + 1) % valid.length;
        const current = showingA ? imgA : imgB;
        const next = showingA ? imgB : imgA;

        next.src = valid[nextIdx];
        next.style.display = 'block';
        next.className = 'slide-in';
        // إجبار إعادة تدفق لتشغيل الانتقال
        void next.offsetWidth;
        current.className = 'slide-out';
        next.className = 'active';

        setTimeout(() => {
          current.style.display = 'none';
          current.className = '';
          showingA = !showingA;
          idx = nextIdx;
        }, SLIDER_TRANSITION_MS);
      }

      setInterval(slideNext, SLIDER_INTERVAL);
    });
  }

  // تعليق: تهيئة عامة تستدعي كل أجزاء الموقع بأمان
  function initApp() {
    initNavbar();
    initSidebar();
    initServicesCarousel();
    initImageSlider();
  }

  // تعليق: تشغيل التهيئة عند DOMContentLoaded كاحتياط
  document.addEventListener('DOMContentLoaded', () => {
    initApp();

    // لو عناصر partials تُحمّل لاحقًا (include.js) راقب DOM وأعد التهيئة عند الإضافة
    const checkNeeded = () => {
      return !!(document.querySelector('.sidebar') === null
        || document.getElementById('servicesContainer') === null
        || document.getElementById('slider-img-current') === null);
    };

    if (checkNeeded()) {
      const obs = new MutationObserver((mutations, observer) => {
        if (!checkNeeded()) {
          initApp();
          observer.disconnect();
        }
      });
      obs.observe(document.body, { childList: true, subtree: true });
    }
  });

  // تعليق: استمع لحدث includesLoaded الذي يبثه include.js بعد إدراج partials
  document.addEventListener('includesLoaded', () => {
    // تأخير بسيط لضمان تحديث الأبعاد
    setTimeout(initApp, 50);
  });

})();