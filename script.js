
document.addEventListener('DOMContentLoaded', () => {
  // === Переменные DOM ===
  const langToggle = document.getElementById("langToggle");
  const langModal = document.getElementById("langModal");
  const closeLangModal = document.getElementById("closeLangModal");
  const langItems = langModal.querySelectorAll(".lang-list li");

  const themeToggleCheckbox = document.getElementById("themeToggle");

  const filterButton = document.querySelector('.filter-button');
  const filterPanel = document.querySelector('.filter-panel');

  const productList = document.getElementById('productList');
  const addAdForm = document.getElementById('addAdForm');
  const addAdOverlay = document.getElementById('addAdOverlay');
  const searchInput = document.getElementById('searchInput');
  const addAdBtn = document.getElementById('addAdBtn');
  const closeAddAdBtn = document.getElementById('closeAddAd');
  const imageInput = document.getElementById('imageInput');
  const previewContainer = document.getElementById('previewContainer');
  const sortSelect = document.getElementById('sortSelect');

  // === Глобальные переменные ===
  const products = [];
  let selectedFiles = [];

  // === Язык ===
  langToggle.addEventListener("click", () => {
    langModal.classList.remove("hidden");
  });
  closeLangModal.addEventListener("click", () => {
    langModal.classList.add("hidden");
  });
  langModal.addEventListener("click", (e) => {
    if (e.target === langModal) langModal.classList.add("hidden");
  });
  langItems.forEach(item => {
    item.addEventListener("click", () => {
      langToggle.textContent = `🌐 ${item.textContent.trim()} ▼`;
      langModal.classList.add("hidden");
      console.log("Выбран язык:", item.dataset.lang);
    });
  });

  // === Тема ===
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    themeToggleCheckbox.checked = true;
  }
  themeToggleCheckbox.addEventListener("change", () => {
    if (themeToggleCheckbox.checked) {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  });

  // === Фильтр ===
  filterButton.addEventListener('click', (e) => {
    e.stopPropagation();
    const isShown = filterPanel.classList.toggle('show');
    filterButton.setAttribute('aria-expanded', isShown);
    filterPanel.setAttribute('aria-hidden', !isShown);
    if (isShown) filterPanel.focus();
  });
  document.addEventListener('click', (e) => {
    if (!filterPanel.contains(e.target) && !filterButton.contains(e.target)) {
      filterPanel.classList.remove('show');
      filterButton.setAttribute('aria-expanded', false);
      filterPanel.setAttribute('aria-hidden', true);
    }
  });

  // === Получаем чекбоксы категорий ===
  const categoryCheckboxes = document.querySelectorAll('input[name="category"]');

  // === Слушатели событий ===
searchInput.addEventListener('input', applyFilters);
sortSelect.addEventListener('change', applyFilters);
categoryCheckboxes.forEach(cb => cb.addEventListener('change', applyFilters));

// === Кнопки фильтра
const applyFilterBtn = document.querySelector('.apply-filter');
if (applyFilterBtn) applyFilterBtn.addEventListener('click', applyFilters);

const resetFilterBtn = document.querySelector('.reset-filter');
if (resetFilterBtn) {
  resetFilterBtn.addEventListener('click', () => {
    categoryCheckboxes.forEach(cb => cb.checked = false);
    document.querySelectorAll('input[name="condition"]').forEach(radio => radio.checked = false);
    document.querySelector('input[name="price_min"]').value = '';
    document.querySelector('input[name="price_max"]').value = '';
    document.querySelector('select[name="city"]').value = '';

    searchInput.value = '';
    sortSelect.value = '';
    applyFilters();
  });
}

// === Рендер товаров ===
function renderProducts(items) {
  productList.innerHTML = '';

  if (items.length === 0) {
    productList.innerHTML = '<p class="no-products">Товарів не знайдено</p>';
    return;
  }

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'product-card';

    // Если объявление срочное — добавляем класс и ярлык
    if (item.urgent) {
      card.classList.add('urgent');
    }

    const imageHtml = item.image
      ? `<img src="${item.image}" alt="Фото товару" class="product-image"
               onerror="this.onerror=null; this.src='https://via.placeholder.com/300x200?text=Немає+фото';" />`
      : `<div class="product-image-placeholder">
           <i class="fa-solid fa-image"></i>
           <span>Немає фото</span>
         </div>`;

    card.innerHTML = `
      ${imageHtml}
      <div class="product-info">
        <h4 class="product-title">${item.title}${item.urgent ? ' <span class="urgent-label">Терміново</span>' : ''}</h4>
        <p class="product-description">${item.description}</p>
        <p class="product-price">${item.price > 0 ? '€' + item.price : 'Безкоштовно 🎁'}</p>
        <span class="product-location">📍 ${item.location} • 🇺🇦 ${item.nationality}</span>
      </div>
    `;

    productList.appendChild(card);
  });
}

// === Основная функция фильтрации ===
function applyFilters() {
  let filtered = products.slice();

  function normalize(str) {
    return str.trim().toLowerCase();
  }

  // Категории
  const selectedCats = Array.from(categoryCheckboxes)
    .filter(cb => cb.checked)
    .map(cb => normalize(cb.value));

  if (selectedCats.length > 0) {
    filtered = filtered.filter(prod => selectedCats.includes(normalize(prod.category)));
  }

  // Цена
  const priceMin = Number(document.querySelector('input[name="price_min"]')?.value) || 0;
  const priceMax = Number(document.querySelector('input[name="price_max"]')?.value) || Infinity;
  filtered = filtered.filter(prod => prod.price >= priceMin && prod.price <= priceMax);

  // Город
  const city = document.querySelector('select[name="city"]')?.value || '';
  if (city) {
    filtered = filtered.filter(prod => normalize(prod.location) === normalize(city));
  }

  // Состояние
  const condition = document.querySelector('input[name="condition"]:checked')?.value || '';
  if (condition === 'new' || condition === 'used') {
    filtered = filtered.filter(prod => prod.condition === condition);
  }

  // Поиск
  const query = searchInput.value.trim().toLowerCase();
  if (query) {
    filtered = filtered.filter(prod =>
      prod.title.toLowerCase().includes(query) ||
      prod.description.toLowerCase().includes(query)
    );
  }

  // Сортировка
  const sortValue = sortSelect.value;
  if (sortValue === 'newest') {
    filtered = filtered.slice().reverse();
  } else if (sortValue === 'price-asc') {
    filtered = filtered.slice().sort((a, b) => a.price - b.price);
  } else if (sortValue === 'price-desc') {
    filtered = filtered.slice().sort((a, b) => b.price - a.price);
  }

  renderProducts(filtered);

  // Обновление заголовка
  const title = document.getElementById("productSectionTitle");
  const count = filtered.length;

  const getNoun = (n) => {
    const lastDigit = n % 10;
    const lastTwoDigits = n % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return 'оголошень';
    if (lastDigit === 1) return 'оголошення';
    if (lastDigit >= 2 && lastDigit <= 4) return 'оголошення';
    return 'оголошень';
  };

  title.textContent = count > 0
    ? `Знайдено: ${count} ${getNoun(count)}`
    : '';  // Пустая строка, если товаров нет
}


  // === Обработка открытия и закрытия оверлея с блокировкой прокрутки ===
addAdBtn.addEventListener('click', () => {
  addAdOverlay.classList.remove('hidden');

  // Блокируем прокрутку body фиксированием позиции и запоминанием скролла
  const scrollY = window.scrollY;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollY}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.dataset.scrollY = scrollY; // сохраним значение для восстановления
});

closeAddAdBtn.addEventListener('click', closeOverlay);
addAdOverlay.addEventListener('click', (e) => {
  if (e.target === addAdOverlay) {
    closeOverlay();
  }
});

function closeOverlay() {
  addAdOverlay.classList.add('hidden');

  // Восстанавливаем прокрутку страницы
  const scrollY = document.body.dataset.scrollY ? parseInt(document.body.dataset.scrollY) : 0;
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  window.scrollTo(0, scrollY);

  delete document.body.dataset.scrollY;

  // Очистка
  selectedFiles = [];
  previewContainer.innerHTML = '';
  imageInput.value = '';
}

// Блокируем "пробой" скролла внутри оверлея
const overlayContent = addAdOverlay.querySelector('.overlay-content');

overlayContent.addEventListener('wheel', function(e) {
  const delta = e.deltaY;
  const scrollTop = this.scrollTop;
  const scrollHeight = this.scrollHeight;
  const offsetHeight = this.offsetHeight;

  if (
    (delta > 0 && scrollTop + offsetHeight >= scrollHeight) || // скроллим вниз и достигнут низ
    (delta < 0 && scrollTop <= 0)                              // скроллим вверх и достигнут верх
  ) {
    e.preventDefault();
  }
}, { passive: false });

overlayContent.addEventListener('touchmove', function(e) {
  const scrollTop = this.scrollTop;
  const scrollHeight = this.scrollHeight;
  const offsetHeight = this.offsetHeight;
  const touch = e.touches[0];
  const currentY = touch.clientY;

  // Для touch-событий нужно отслеживать направление и предотвращать пробой
  // Тут можно сделать проще - всегда preventDefault, если в крайних позициях, чтобы фон не скроллился

  if (
    (scrollTop === 0 && e.targetTouches[0].clientY > currentY) || 
    (scrollTop + offsetHeight >= scrollHeight && e.targetTouches[0].clientY < currentY)
  ) {
    e.preventDefault();
  }
}, { passive: false });

imageInput.addEventListener('change', () => {
  const newFiles = Array.from(imageInput.files);
  selectedFiles = selectedFiles.concat(newFiles);
  updatePreviews();
  imageInput.value = '';
});

addAdForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const formData = new FormData(addAdForm);

  const newProduct = {
    title: formData.get('title') || '(без назви)',
    description: formData.get('description') || '',
    price: Number(formData.get('price')) || 0,
    location: formData.get('location') || '',
    nationality: formData.get('nationality') || '',
    category: formData.get('category') || '',
    condition: formData.get('condition') || '',
    urgent: formData.get('urgent') === 'on',
    image: null
  };

  if (selectedFiles.length > 0) {
    const reader = new FileReader();
    reader.onload = function(event) {
      newProduct.image = event.target.result;

      products.push(newProduct);
      console.log("✅ Добавлен товар:", newProduct);
      console.log("📦 Все товары:", products);
      applyFilters();

      selectedFiles.forEach(file => URL.revokeObjectURL(file));
      selectedFiles = [];

      addAdForm.reset();
      previewContainer.innerHTML = '';
      addAdOverlay.classList.add('hidden');

      closeOverlay(); // Восстановим прокрутку страницы при закрытии
    };
    reader.readAsDataURL(selectedFiles[0]);
  } else {
    products.push(newProduct);
    applyFilters();

    addAdForm.reset();
    previewContainer.innerHTML = '';
    addAdOverlay.classList.add('hidden');

    closeOverlay(); // Восстановим прокрутку страницы при закрытии
  }
});



  // === Превью фото ===
  function updatePreviews() {
    previewContainer.innerHTML = '';
    selectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.style.maxWidth = '100px';
        img.style.height = '80px';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '6px';
        img.style.marginRight = '5px';
        previewContainer.appendChild(img);
      };
      reader.readAsDataURL(file);
    });
  }

  // === Инициализация ===
  applyFilters();
});

// === Скрипт для модалки в шапке ===
document.addEventListener('DOMContentLoaded', () => {
  const aboutBtn = document.getElementById('aboutBtn');
  const supportBtn = document.getElementById('supportBtn');
  const aboutModal = document.getElementById('aboutModal');
  const supportModal = document.getElementById('supportModal');
  const closeAbout = document.getElementById('closeAbout');
  const closeSupport = document.getElementById('closeSupport');

  aboutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    aboutModal.classList.remove('hidden');
  });

  supportBtn.addEventListener('click', () => {
    supportModal.classList.remove('hidden');
  });

  closeAbout.addEventListener('click', () => {
    aboutModal.classList.add('hidden');
  });

  closeSupport.addEventListener('click', () => {
    supportModal.classList.add('hidden');
  });

  // Закрыть по клику вне содержимого модалки
  aboutModal.addEventListener('click', e => {
    if (e.target === aboutModal) {
      aboutModal.classList.add('hidden');
    }
  });

  supportModal.addEventListener('click', e => {
    if (e.target === supportModal) {
      supportModal.classList.add('hidden');
    }
  });
});


// Скрипт для аккордеона FAQ
document.querySelectorAll('.faq-question').forEach(button => {
  button.addEventListener('click', () => {
    const faqItem = button.closest('.faq-item');
    const isOpen = faqItem.classList.contains('open');

    // Обновляем aria-expanded для доступности
    button.setAttribute('aria-expanded', String(!isOpen));

    // Переключаем класс и отображение ответа
    faqItem.classList.toggle('open');
  });
});

// Плавный скролл для всех якорных ссылок с #
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetID = this.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetID);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Скрипт поддержки проекта
document.getElementById('copyLinkBtn').addEventListener('click', () => {
  navigator.clipboard.writeText(window.location.href).then(() => {
    alert('Посилання скопійовано! Поділіться ним з друзями.');
  }).catch(() => {
    alert('Не вдалося скопіювати посилання. Спробуйте ще раз.');
  });
});

// Скрипт для кнопки скопировать ссылку
const copyBtn = document.getElementById('copyLinkBtn');
const copyMessage = document.createElement('div');
copyMessage.id = 'copyMessage';
copyMessage.className = 'copy-message hidden';
copyBtn.parentNode.appendChild(copyMessage);

copyBtn.addEventListener('click', () => {
  const link = "https://paypal.me/azureence?country.x=FR&locale.x=fr_FR";
  navigator.clipboard.writeText(link).then(() => {
    copyMessage.textContent = 'Посилання скопійовано!';
    copyMessage.classList.remove('hidden');
    copyMessage.classList.add('visible');

    setTimeout(() => {
      copyMessage.classList.remove('visible');
      copyMessage.classList.add('hidden');
    }, 2500);
  }).catch(() => {
    copyMessage.textContent = 'Не вдалося скопіювати посилання';
    copyMessage.classList.remove('hidden');
    copyMessage.classList.add('visible');
  });
});
// Скрипт для кнопки "Вверх"
// Показ кнопки при прокрутке вниз
document.addEventListener('DOMContentLoaded', () => {
  const scrollBtn = document.getElementById('scrollToTopBtn');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      scrollBtn.style.display = 'block';
    } else {
      scrollBtn.style.display = 'none';
    }
  });

  scrollBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
});
// Скрипт для быстрого фильтра по типу товара
document.addEventListener('DOMContentLoaded', () => {
  const filterFreeBtn = document.getElementById('filter-free');
  const filterUrgentBtn = document.getElementById('filter-urgent');

  let activeQuickFilter = null;

  function applyQuickFilter(type) {
    if (activeQuickFilter === type) {
      // Сброс фильтра, показываем все
      activeQuickFilter = null;
      applyFilters(); // твоя обычная фильтрация, показывает все
      return;
    }

    activeQuickFilter = type;

    let filtered = [];

    if (type === 'free') {
      filtered = products.filter(product => product.price === 0);
    } else if (type === 'urgent') {
      filtered = products.filter(product => product.urgent === true);
    }

    renderProducts(filtered);

    // Обновляем заголовок
    const title = document.getElementById("productSectionTitle");
    const count = filtered.length;

    const getNoun = (n) => {
      const lastDigit = n % 10;
      const lastTwoDigits = n % 100;
      if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return 'оголошень';
      if (lastDigit === 1) return 'оголошення';
      if (lastDigit >= 2 && lastDigit <= 4) return 'оголошення';
      return 'оголошень';
    };

    title.textContent = `Знайдено: ${count} ${getNoun(count)}`;
  }

  filterFreeBtn.addEventListener('click', e => {
    e.preventDefault();
    applyQuickFilter('free');
  });

  filterUrgentBtn.addEventListener('click', e => {
    e.preventDefault();
    applyQuickFilter('urgent');
  });
});













