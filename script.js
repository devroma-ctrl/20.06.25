
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






