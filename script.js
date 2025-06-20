
const langToggle = document.getElementById("langToggle");
const langModal = document.getElementById("langModal");
const closeLangModal = document.getElementById("closeLangModal");
const langItems = langModal.querySelectorAll(".lang-list li");

langToggle.addEventListener("click", () => {
  langModal.classList.remove("hidden");
});

closeLangModal.addEventListener("click", () => {
  langModal.classList.add("hidden");
});

langModal.addEventListener("click", (e) => {
  if (e.target === langModal) {
    langModal.classList.add("hidden");
  }
});

langItems.forEach(item => {
  item.addEventListener("click", () => {
    langToggle.textContent = `🌐 ${item.textContent.trim()} ▼`;
    langModal.classList.add("hidden");
    console.log("Выбран язык:", item.dataset.lang);
  });
});



// Для переключения темы
const themeToggleCheckbox = document.getElementById("themeToggle");

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
const filterButton = document.querySelector('.filter-button');
const filterPanel = document.querySelector('.filter-panel');

filterButton.addEventListener('click', (e) => {
  e.stopPropagation(); // чтобы клик не всплывал и не закрывал панель сразу
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

// Подкатегории
const categoryCheckboxes = document.querySelectorAll('input[name="category"]');
const subcategoryGroups = document.querySelectorAll('.subcategory-group');

function updateSubcategories() {
  const selectedCategories = Array.from(categoryCheckboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  subcategoryGroups.forEach(group => {
    const parent = group.dataset.parent;
    group.style.display = selectedCategories.includes(parent) ? 'block' : 'none';
  });
}

categoryCheckboxes.forEach(cb => {
  cb.addEventListener('change', updateSubcategories);
});

updateSubcategories();


// Пустой массив товаров — заполняется динамически
const products = [];

const productList = document.getElementById('productList');
const addAdForm = document.getElementById('addAdForm');
const addAdOverlay = document.getElementById('addAdOverlay');
const searchInput = document.getElementById('searchInput');
const addAdBtn = document.getElementById('addAdBtn');
const closeAddAdBtn = document.getElementById('closeAddAd');

// Рендер товаров
function renderProducts(items) {
  productList.innerHTML = '';

  if (items.length === 0) {
    productList.innerHTML = '<p>Товарів не знайдено</p>';
    return;
  }

  items.forEach(item => {
    const imgSrc = item.image || 'https://via.placeholder.com/300x200?text=Немає+фото';

    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${imgSrc}" alt="Фото товару" class="product-image"
           onerror="this.onerror=null; this.src='https://via.placeholder.com/300x200?text=Немає+фото';" />
      <div class="product-info">
        <h4 class="product-title">${item.title}</h4>
        <p class="product-description">${item.description}</p>
        <p class="product-price">${item.price > 0 ? '€' + item.price : 'Безкоштовно 🎁'}</p>
        <span class="product-location">📍 ${item.location} • 🇺🇦 ${item.nationality}</span>
      </div>
    `;

    productList.appendChild(card);
  });
}

renderProducts(products);

// Обработка формы — только один submit
addAdForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const formData = new FormData(addAdForm);
  const file = formData.get('image');

  const reader = new FileReader();
  reader.onload = function(event) {
    const newProduct = {
      title: formData.get('title') || '(без назви)',
      description: formData.get('description') || '',
      price: Number(formData.get('price')) || 0,
      location: formData.get('location') || '',
      nationality: formData.get('nationality') || '',
      image: file && file.name ? event.target.result : null
    };

    products.push(newProduct);
    renderProducts(products);
    addAdForm.reset();
    addAdOverlay.classList.add('hidden');
  };

  if (file && file.name) {
    reader.readAsDataURL(file);
  } else {
    reader.onload({ target: { result: null } }); // запуск без файла
  }
});

// Поиск
searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim().toLowerCase();

  const filtered = products.filter(product =>
    product.title.toLowerCase().includes(query) ||
    product.description.toLowerCase().includes(query)
  );

  renderProducts(filtered);
});

// Открытие/закрытие формы
addAdBtn.addEventListener('click', () => {
  addAdOverlay.classList.remove('hidden');
});

closeAddAdBtn.addEventListener('click', () => {
  addAdOverlay.classList.add('hidden');
});
















