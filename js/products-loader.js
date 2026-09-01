/**
 * Diwan Al Attour - Dynamic Products Loader
 * Synchronizes Featured Products (Top Carousel) and Filtered Collection Products (Bottom Section)
 */

// Fallback seed data in case of direct static viewing
const DEFAULT_PRODUCTS = [
  {
    id: "prod-1",
    title: "Yasmina",
    price: 70,
    rating: 4.9,
    category: "Women",
    description: "A luminous floral composition of night-blooming jasmine and delicate white lilies resting on a warm amber base.",
    imageUrl: "assets/products/jasmine_white.jpg",
    placement: "featured",
    isFeatured: true,
    filterCategories: []
  },
  {
    id: "prod-2",
    title: "Eastern Scent",
    price: 70,
    rating: 4.9,
    category: "Men",
    description: "An opulent woody-amber fragrance balancing radiant tropical fruit sweetness with rich balsamic oud and cedarwood.",
    imageUrl: "assets/products/amber_orient.jpg",
    placement: "featured",
    isFeatured: true,
    filterCategories: []
  },
  {
    id: "prod-3",
    title: "Jewel of Caravans",
    price: 70,
    rating: 4.9,
    category: "Women",
    description: "A romantic bouquet of velvety pink rose petals infused with sparkling citrus top notes and silky vanilla.",
    imageUrl: "assets/products/rose_eclat.jpg",
    placement: "featured",
    isFeatured: true,
    filterCategories: []
  },
  {
    id: "prod-4",
    title: "Emerald Rose",
    price: 70,
    rating: 4.9,
    category: "Women",
    description: "A captivating elixir of fresh exotic orchids, crushed green foliage, and warm sensual base notes.",
    imageUrl: "assets/products/emerald_green.jpg",
    placement: "top-rated",
    isFeatured: false,
    filterCategories: ["top-rated"]
  },
  {
    id: "prod-5",
    title: "Imperial Oud",
    price: 70,
    rating: 4.9,
    category: "Men",
    description: "A majestic smoky oud infused with vibrant saffron spices and sun-drenched Damascus roses.",
    imageUrl: "assets/products/amber_oud.jpg",
    placement: "best-sellers",
    isFeatured: false,
    filterCategories: ["best-sellers"]
  },
  {
    id: "prod-6",
    title: "Lavender Mist",
    price: 70,
    rating: 4.9,
    category: "Women",
    description: "A soothing whisper of French mountain lavender and cool water mist on an ethereal white musk base.",
    imageUrl: "assets/products/lavender_purple.jpg",
    placement: "new-arrivals",
    isFeatured: false,
    filterCategories: ["new-arrivals"]
  },
  {
    id: "prod-7",
    title: "1001 Nights",
    price: 70,
    rating: 4.9,
    category: "Unisex",
    description: "A nocturnal blend of mysterious dark incense, nocturnal jasmine, and golden honeyed amber.",
    imageUrl: "assets/products/night_black.jpg",
    placement: "top-rated",
    isFeatured: false,
    filterCategories: ["top-rated"]
  }
];

let globalProducts = [];
let activeFilterTab = 'best-sellers';

function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem('diwan_wishlist')) || [];
  } catch (e) {
    return [];
  }
}

function toggleWishlist(id) {
  let wishlist = getWishlist();
  if (wishlist.includes(id)) {
    wishlist = wishlist.filter(item => item !== id);
  } else {
    wishlist.push(id);
  }
  localStorage.setItem('diwan_wishlist', JSON.stringify(wishlist));
  return wishlist.includes(id);
}

function createProductCardHTML(product) {
  const wishlist = getWishlist();
  const isWishlisted = wishlist.includes(product.id);
  const categories = Array.isArray(product.filterCategories) ? product.filterCategories.join(' ') : (product.placement || '');

  return `
    <article class="product-card" data-id="${product.id}" data-category="${(product.category || 'unisex').toLowerCase()} ${categories}">
      <div class="card-image-box">
        <img src="${product.imageUrl || 'assets/products/jasmine_white.jpg'}" alt="${escapeHtml(product.title)}" loading="lazy" onerror="this.src='assets/products/jasmine_white.jpg'">
        <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" aria-label="Add to Wishlist" data-id="${product.id}">
          <svg viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
      </div>
      <div class="card-details">
        <div class="card-meta-row">
          <span class="card-rating"><span class="star-icon">★</span> ${product.rating || '4.9'}</span>
          <span class="card-category">${escapeHtml(product.category || 'Unisex')}</span>
        </div>
        <div class="card-title-row">
          <h3 class="card-title">${escapeHtml(product.title)}</h3>
          <span class="card-price">${product.price} $</span>
        </div>
        <p class="card-description">
          ${escapeHtml(product.description || '')}
        </p>
      </div>
    </article>
  `;
}

// Render Top Featured Products (No filter tags applied to Featured)
function renderFeaturedCarousel(products) {
  const featuredContainer = document.getElementById('featured-cards-grid');
  if (!featuredContainer) return;

  // Filter products where isFeatured === true or placement === 'featured'
  let featuredList = products.filter(p => p.isFeatured === true || p.placement === 'featured');
  
  // If no products are marked as featured, fallback to first 3 products
  if (featuredList.length === 0) {
    featuredList = products.slice(0, 3);
  }

  featuredContainer.innerHTML = featuredList.map(createProductCardHTML).join('');
  attachWishlistEvents(featuredContainer);
}

// Render Bottom Products (Non-featured collection products matching active filter)
function renderBottomProducts(products, filter = 'best-sellers') {
  const bottomContainer = document.getElementById('bottom-products-container');
  if (!bottomContainer) return;

  // If 'all' is selected, display all products; otherwise non-featured collection products
  let collectionProducts = (filter === 'all')
    ? products
    : products.filter(p => !p.isFeatured && p.placement !== 'featured');

  // If no separate collection products exist, allow matching from all products
  if (collectionProducts.length === 0) {
    collectionProducts = products;
  }

  let filtered = collectionProducts.filter(p => {
    if (filter === 'all') return true;
    if (p.placement === filter) return true;
    return p.filterCategories && Array.isArray(p.filterCategories) && p.filterCategories.includes(filter);
  });

  // If none match the specific filter, fallback to collection products
  if (filtered.length === 0) {
    filtered = collectionProducts;
  }

  bottomContainer.innerHTML = filtered.map(createProductCardHTML).join('');
  attachWishlistEvents(bottomContainer);
}

function attachWishlistEvents(container) {
  container.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const isActive = toggleWishlist(id);
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-label', isActive ? 'Added to Wishlist' : 'Add to Wishlist');
    });
  });
}

function initFilterTabs() {
  const filterTabs = document.querySelectorAll('.filter-tab-btn');
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      activeFilterTab = tab.dataset.filter;
      renderBottomProducts(globalProducts, activeFilterTab);
    });
  });
}

function initCarouselControls() {
  const prevBtn = document.getElementById('carousel-prev-btn');
  const nextBtn = document.getElementById('carousel-next-btn');
  const featuredGrid = document.getElementById('featured-cards-grid');

  if (prevBtn && nextBtn && featuredGrid) {
    prevBtn.addEventListener('click', () => {
      const firstCard = featuredGrid.querySelector('.product-card');
      const scrollStep = firstCard ? (firstCard.offsetWidth + 24) : 340;
      featuredGrid.scrollBy({ left: -scrollStep, behavior: 'smooth' });
      prevBtn.classList.add('active-dark');
      nextBtn.classList.remove('active-dark');
    });

    nextBtn.addEventListener('click', () => {
      const firstCard = featuredGrid.querySelector('.product-card');
      const scrollStep = firstCard ? (firstCard.offsetWidth + 24) : 340;
      featuredGrid.scrollBy({ left: scrollStep, behavior: 'smooth' });
      nextBtn.classList.add('active-dark');
      prevBtn.classList.remove('active-dark');
    });
  }
}

function getApiBase() {
  if (window.location.protocol === 'file:' || (window.location.port && window.location.port !== '5000')) {
    return 'http://localhost:5000';
  }
  return '';
}

async function loadDynamicProducts() {
  const apiBase = getApiBase();
  try {
    const res = await fetch(`${apiBase}/api/products`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.products) && data.products.length > 0) {
        globalProducts = data.products;
      } else {
        globalProducts = DEFAULT_PRODUCTS;
      }
    } else {
      globalProducts = DEFAULT_PRODUCTS;
    }
  } catch (err) {
    console.log('Using local client dataset fallback:', err.message);
    globalProducts = DEFAULT_PRODUCTS;
  }

  renderFeaturedCarousel(globalProducts);
  renderBottomProducts(globalProducts, activeFilterTab);
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

document.addEventListener('DOMContentLoaded', () => {
  initFilterTabs();
  initCarouselControls();
  loadDynamicProducts();
});
