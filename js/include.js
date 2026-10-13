// تحميل partials واستبدال العنصر placeholder كاملًا ثم بث حدث includesLoaded
document.addEventListener("DOMContentLoaded", () => {
  const loadPart = (selector, file) => {
    const placeholder = document.querySelector(selector);
    if (!placeholder) return Promise.resolve(); // لا يوجد عنصر placeholder فنتجاوز
    return fetch(file)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load ${file} (${res.status})`);
        return res.text();
      })
      .then(html => {
        // استبدال العنصر بالكامل لتفادي تكرار نفس الكلاس
        placeholder.outerHTML = html;
      })
      .catch(err => {
        console.error('include error:', err);
      });
  };

  const tasks = [
    loadPart('header', 'partials/header.html'),
    loadPart('.sidebar', 'partials/sidebar.html'),
    loadPart('footer', 'partials/footer.html')
    // أضف partials أخرى عند الحاجة
  ];

  Promise.allSettled(tasks).then(() => {
    document.dispatchEvent(new Event('includesLoaded'));
  });
});
