/**
 * Diwan Al Attour - Luxury Admin Dashboard Logic
 * Unified & Intuitive Product CRUD, Section Placement & Category Filter Management
 */

document.addEventListener('DOMContentLoaded', () => {
  // Automatic backend API resolver (seamlessly connects to port 5000 if opened from Live Server port 5500)
  function getApiBase() {
    if (window.location.protocol === 'file:' || (window.location.port && window.location.port !== '5000')) {
      return 'http://localhost:5000';
    }
    return '';
  }
  const API_BASE = getApiBase();

  // State variables
  let allProducts = [];
  let currentFilter = 'all';
  let searchQuery = '';
  let pendingDeleteId = null;

  // DOM Elements - Auth
  const authOverlay = document.getElementById('auth-overlay');
  const loginForm = document.getElementById('login-form');
  const passwordInput = document.getElementById('admin-password');
  const togglePwdBtn = document.getElementById('toggle-pwd-btn');
  const authError = document.getElementById('auth-error');
  const btnLogout = document.getElementById('btn-logout');

  // DOM Elements - Stats
  const statTotal = document.getElementById('stat-total');
  const statFeatured = document.getElementById('stat-featured');
  const statBestSellers = document.getElementById('stat-best-sellers');
  const statNewArrivals = document.getElementById('stat-new-arrivals');
  const statTopRated = document.getElementById('stat-top-rated');

  // DOM Elements - Table & Controls
  const tableBody = document.getElementById('products-table-body');
  const tableEmpty = document.getElementById('table-empty');
  const searchInput = document.getElementById('search-input');
  const filterPills = document.querySelectorAll('.filter-pill');
  const btnOpenCreateModal = document.getElementById('btn-open-create-modal');

  // DOM Elements - Modal & Form
  const productModal = document.getElementById('product-modal');
  const modalTitleText = document.getElementById('modal-title-text');
  const modalTitleIcon = document.getElementById('modal-title-icon');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnCancelModal = document.getElementById('btn-cancel-modal');
  const productForm = document.getElementById('product-form');
  const saveBtnText = document.getElementById('save-btn-text');

  // Form Fields
  const formProductId = document.getElementById('form-product-id');
  const formTitle = document.getElementById('form-title');
  const formPrice = document.getElementById('form-price');
  const formRating = document.getElementById('form-rating');
  const formCategory = document.getElementById('form-category');
  const formDesc = document.getElementById('form-desc');
  const formImageUrl = document.getElementById('form-image-url');
  const formImageFile = document.getElementById('form-image-file');
  const formImagePreview = document.getElementById('form-image-preview');
  const presetChips = document.querySelectorAll('.preset-chip');

  // Placement Radios & Subselectors
  const radioPlacementFeatured = document.getElementById('radio-placement-featured');
  const radioPlacementCollection = document.getElementById('radio-placement-collection');
  const filterSubselectorBox = document.getElementById('filter-subselector-box');
  const filterTagBestSellers = document.getElementById('filter-tag-best-sellers');
  const filterTagNewArrivals = document.getElementById('filter-tag-new-arrivals');
  const filterTagTopRated = document.getElementById('filter-tag-top-rated');

  // Delete Modal
  const deleteModal = document.getElementById('delete-modal');
  const deleteProductName = document.getElementById('delete-product-name');
  const btnCancelDelete = document.getElementById('btn-cancel-delete');
  const btnConfirmDelete = document.getElementById('btn-confirm-delete');

  // Toast Container
  const toastContainer = document.getElementById('toast-container');

  // ==========================================================================
  // 1. AUTHENTICATION & SESSION MANAGEMENT
  // ==========================================================================
  function getAuthToken() {
    return localStorage.getItem('diwan_admin_token');
  }

  function setAuthToken(token) {
    localStorage.setItem('diwan_admin_token', token);
  }

  function removeAuthToken() {
    localStorage.removeItem('diwan_admin_token');
  }

  async function checkAuthentication() {
    const token = getAuthToken();
    if (!token) {
      showAuthScreen();
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/check`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        hideAuthScreen();
        fetchProducts();
      } else {
        removeAuthToken();
        showAuthScreen();
      }
    } catch (err) {
      console.warn('Backend server check warning:', err);
      hideAuthScreen();
      fetchProducts();
    }
  }

  function showAuthScreen() {
    authOverlay.classList.remove('hidden');
    passwordInput.value = '';
    authError.textContent = '';
    setTimeout(() => passwordInput.focus(), 200);
  }

  function hideAuthScreen() {
    authOverlay.classList.add('hidden');
  }

  // Password visibility toggle
  togglePwdBtn.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
  });

  // Login form submit
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = passwordInput.value.trim();
    if (!password) return;

    authError.textContent = '';

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAuthToken(data.token);
        hideAuthScreen();
        showToast('Welcome back, Admin! Access granted.', 'success');
        fetchProducts();
      } else {
        authError.textContent = data.message || 'Incorrect password. Access denied.';
        showToast('Authentication failed', 'error');
      }
    } catch (err) {
      authError.textContent = 'Server error. Please ensure the backend server (node server.js) is running on port 5000.';
      showToast('Connection error', 'error');
    }
  });

  // Logout
  btnLogout.addEventListener('click', () => {
    if (confirm('Are you sure you want to log out from the Admin Dashboard?')) {
      removeAuthToken();
      showAuthScreen();
      showToast('Logged out successfully', 'info');
    }
  });

  // ==========================================================================
  // 2. PRODUCT DATA FETCHING & METRICS
  // ==========================================================================
  async function fetchProducts() {
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/api/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success && Array.isArray(data.products)) {
        allProducts = data.products;
        updateMetrics();
        renderProductsTable();
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      showToast('Error loading products from server', 'error');
    }
  }

  function updateMetrics() {
    statTotal.textContent = allProducts.length;
    statFeatured.textContent = allProducts.filter(p => p.isFeatured || p.placement === 'featured').length;
    statBestSellers.textContent = allProducts.filter(p => !p.isFeatured && (p.placement === 'best-sellers' || (p.filterCategories && p.filterCategories.includes('best-sellers')))).length;
    statNewArrivals.textContent = allProducts.filter(p => !p.isFeatured && (p.placement === 'new-arrivals' || (p.filterCategories && p.filterCategories.includes('new-arrivals')))).length;
    statTopRated.textContent = allProducts.filter(p => !p.isFeatured && (p.placement === 'top-rated' || (p.filterCategories && p.filterCategories.includes('top-rated')))).length;
  }

  // ==========================================================================
  // 3. TABLE RENDERING & FILTERING
  // ==========================================================================
  function getFilteredProducts() {
    return allProducts.filter(product => {
      // Search match
      const query = searchQuery.toLowerCase();
      const matchesSearch = !query || 
        product.title.toLowerCase().includes(query) ||
        (product.description && product.description.toLowerCase().includes(query)) ||
        (product.category && product.category.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      // Filter pill match
      if (currentFilter === 'all') return true;
      if (currentFilter === 'featured') return Boolean(product.isFeatured || product.placement === 'featured');
      if (currentFilter === 'women') return product.category && product.category.toLowerCase() === 'women';
      if (currentFilter === 'men') return product.category && product.category.toLowerCase() === 'men';
      if (currentFilter === 'unisex') return product.category && product.category.toLowerCase() === 'unisex';
      
      // Filter categories for collection products (best-sellers, new-arrivals, top-rated)
      if (product.isFeatured) return false;
      return product.placement === currentFilter || (product.filterCategories && product.filterCategories.includes(currentFilter));
    });
  }

  function renderProductsTable() {
    const products = getFilteredProducts();

    if (products.length === 0) {
      tableBody.innerHTML = '';
      tableEmpty.style.display = 'block';
      return;
    }

    tableEmpty.style.display = 'none';

    tableBody.innerHTML = products.map(product => {
      const placement = product.isFeatured ? 'featured' : (product.placement || (product.filterCategories?.[0] || 'best-sellers'));

      return `
        <tr data-id="${product.id}">
          <td>
            <div class="product-cell-main">
              <img src="${product.imageUrl || 'assets/products/jasmine_white.jpg'}" alt="${product.title}" class="table-thumbnail" onerror="this.src='assets/products/jasmine_white.jpg'">
              <div class="product-name-wrap">
                <span class="table-product-title">${escapeHtml(product.title)}</span>
                <span class="table-product-desc">${escapeHtml(product.description || 'No description provided')}</span>
              </div>
            </div>
          </td>
          <td>
            <span class="category-tag">${escapeHtml(product.category || 'Unisex')}</span>
          </td>
          <td>
            <span class="table-price">${product.price} $</span>
          </td>
          <td>
            <span class="table-rating"><span class="star">★</span> ${product.rating || '5.0'}</span>
          </td>
          <td>
            <div class="table-placement-cell">
              <select class="table-placement-select ${placement === 'featured' ? 'featured-active' : ''}" onchange="changePlacementDirectly('${product.id}', this.value)" title="Change Section Placement & Filter">
                <option value="featured" ${placement === 'featured' ? 'selected' : ''}>⭐ Featured (Top Carousel)</option>
                <option value="best-sellers" ${placement === 'best-sellers' ? 'selected' : ''}>🔥 Best Seller (Bottom)</option>
                <option value="new-arrivals" ${placement === 'new-arrivals' ? 'selected' : ''}>✨ New Arrival (Bottom)</option>
                <option value="top-rated" ${placement === 'top-rated' ? 'selected' : ''}>🏆 Top Rated (Bottom)</option>
              </select>
            </div>
          </td>
          <td>
            <div class="table-actions" style="justify-content: flex-end;">
              <button class="action-btn edit-btn" onclick="openEditModal('${product.id}')" title="Edit Perfume">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="action-btn delete-btn" onclick="openDeleteModal('${product.id}')" title="Delete Perfume">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Search input live handler
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim();
    renderProductsTable();
  });

  // Filter pills click
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilter = pill.dataset.filter;
      renderProductsTable();
    });
  });

  // ==========================================================================
  // 4. QUICK CHANGE PLACEMENT & FILTER DIRECTLY IN TABLE
  // ==========================================================================
  window.changePlacementDirectly = async function(id, newPlacement) {
    const product = allProducts.find(p => p.id === id);
    if (!product) return;

    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ placement: newPlacement })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        product.placement = newPlacement;
        product.isFeatured = newPlacement === 'featured';
        product.filterCategories = newPlacement === 'featured' ? [] : [newPlacement];

        updateMetrics();
        renderProductsTable();

        const labels = {
          'featured': '⭐ Top Featured Carousel',
          'best-sellers': '🔥 Best Sellers (Bottom Section)',
          'new-arrivals': '✨ New Arrivals (Bottom Section)',
          'top-rated': '🏆 Top Rated (Bottom Section)'
        };

        showToast(`"${product.title}" moved to ${labels[newPlacement] || newPlacement}`, 'success');
      } else {
        showToast('Failed to update product placement', 'error');
      }
    } catch (err) {
      showToast('Network error updating placement', 'error');
    }
  };

  // ==========================================================================
  // 5. ADD / EDIT PRODUCT MODAL LOGIC
  // ==========================================================================
  function updatePlacementUI() {
    if (radioPlacementCollection.checked) {
      filterSubselectorBox.style.display = 'block';
    } else {
      filterSubselectorBox.style.display = 'none';
    }
  }

  radioPlacementFeatured.addEventListener('change', updatePlacementUI);
  radioPlacementCollection.addEventListener('change', updatePlacementUI);

  function resetForm() {
    formProductId.value = '';
    formTitle.value = '';
    formPrice.value = '';
    formRating.value = '4.9';
    formCategory.value = 'Women';
    formDesc.value = '';
    formImageUrl.value = 'assets/products/jasmine_white.jpg';
    formImagePreview.src = 'assets/products/jasmine_white.jpg';
    
    // Default placement: Top Featured
    radioPlacementFeatured.checked = true;
    radioPlacementCollection.checked = false;
    filterTagBestSellers.checked = true;
    updatePlacementUI();

    if (formImageFile) formImageFile.value = '';
  }

  btnOpenCreateModal.addEventListener('click', () => {
    resetForm();
    modalTitleIcon.textContent = '✨';
    modalTitleText.textContent = 'Add New Perfume';
    saveBtnText.textContent = 'Create Perfume';
    productModal.classList.remove('hidden');
    formTitle.focus();
  });

  window.openEditModal = function(id) {
    const product = allProducts.find(p => p.id === id);
    if (!product) return;

    resetForm();
    modalTitleIcon.textContent = '✏️';
    modalTitleText.textContent = `Edit "${product.title}"`;
    saveBtnText.textContent = 'Save Changes';

    formProductId.value = product.id;
    formTitle.value = product.title;
    formPrice.value = product.price;
    formRating.value = product.rating || '4.9';
    formCategory.value = product.category || 'Women';
    formDesc.value = product.description || '';
    formImageUrl.value = product.imageUrl || '';
    formImagePreview.src = product.imageUrl || 'assets/products/jasmine_white.jpg';

    // Set Placement
    const isFeatured = product.isFeatured || product.placement === 'featured';
    if (isFeatured) {
      radioPlacementFeatured.checked = true;
      radioPlacementCollection.checked = false;
    } else {
      radioPlacementFeatured.checked = false;
      radioPlacementCollection.checked = true;

      const tag = product.placement || (product.filterCategories?.[0] || 'best-sellers');
      if (tag === 'new-arrivals') filterTagNewArrivals.checked = true;
      else if (tag === 'top-rated') filterTagTopRated.checked = true;
      else filterTagBestSellers.checked = true;
    }

    updatePlacementUI();
    productModal.classList.remove('hidden');
    formTitle.focus();
  };

  function closeModal() {
    productModal.classList.add('hidden');
  }

  btnCloseModal.addEventListener('click', closeModal);
  btnCancelModal.addEventListener('click', closeModal);

  // Live URL update preview
  formImageUrl.addEventListener('input', () => {
    formImagePreview.src = formImageUrl.value || 'assets/products/jasmine_white.jpg';
  });

  // Preset Chips
  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const src = chip.dataset.src;
      formImageUrl.value = src;
      formImagePreview.src = src;
    });
  });

  // File Upload (Cloudinary or local storage upload)
  formImageFile.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (re) => {
      formImagePreview.src = re.target.result;
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('image', file);

    const token = getAuthToken();
    showToast('Uploading image to Cloudinary...', 'info');

    try {
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success) {
        formImageUrl.value = data.imageUrl;
        formImagePreview.src = data.imageUrl;
        showToast(data.message || 'Image uploaded successfully!', 'success');
      } else {
        showToast(data.message || 'Upload failed, please use image URL.', 'error');
      }
    } catch (err) {
      showToast('Error uploading image file', 'error');
    }
  });

  // Submit Add / Edit Form
  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = formProductId.value;
    const title = formTitle.value.trim();
    const price = Number(formPrice.value);
    const rating = Number(formRating.value);
    const category = formCategory.value;
    const description = formDesc.value.trim();
    const imageUrl = formImageUrl.value.trim() || 'assets/products/jasmine_white.jpg';

    // Placement determination
    let placement = 'featured';
    if (radioPlacementCollection.checked) {
      const selectedFilter = document.querySelector('input[name="collection-filter-tag"]:checked');
      placement = selectedFilter ? selectedFilter.value : 'best-sellers';
    }

    const payload = {
      title,
      price,
      rating,
      category,
      description,
      imageUrl,
      placement
    };

    const token = getAuthToken();
    const isEdit = Boolean(id);
    const url = isEdit ? `${API_BASE}/api/products/${id}` : `${API_BASE}/api/products`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      saveBtnText.textContent = 'Saving...';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        closeModal();
        showToast(
          isEdit ? `"${title}" updated successfully!` : `New perfume "${title}" created!`,
          'success'
        );
        fetchProducts();
      } else {
        showToast(data.message || 'Failed to save product', 'error');
      }
    } catch (err) {
      showToast('Error saving product to server', 'error');
    } finally {
      saveBtnText.textContent = isEdit ? 'Save Changes' : 'Create Perfume';
    }
  });

  // ==========================================================================
  // 6. DELETE PRODUCT CONFIRMATION
  // ==========================================================================
  window.openDeleteModal = function(id) {
    const product = allProducts.find(p => p.id === id);
    if (!product) return;

    pendingDeleteId = id;
    deleteProductName.textContent = `Are you sure you want to permanently delete "${product.title}"? This cannot be undone.`;
    deleteModal.classList.remove('hidden');
  };

  btnCancelDelete.addEventListener('click', () => {
    deleteModal.classList.add('hidden');
    pendingDeleteId = null;
  });

  btnConfirmDelete.addEventListener('click', async () => {
    if (!pendingDeleteId) return;

    const id = pendingDeleteId;
    const token = getAuthToken();

    try {
      btnConfirmDelete.textContent = 'Deleting...';
      const res = await fetch(`${API_BASE}/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      if (res.ok && data.success) {
        deleteModal.classList.add('hidden');
        showToast('Perfume deleted successfully', 'success');
        fetchProducts();
      } else {
        showToast(data.message || 'Failed to delete perfume', 'error');
      }
    } catch (err) {
      showToast('Error deleting perfume', 'error');
    } finally {
      btnConfirmDelete.textContent = 'Delete';
      pendingDeleteId = null;
    }
  });

  // ==========================================================================
  // 7. TOAST NOTIFICATION SYSTEM
  // ==========================================================================
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✓';
    if (type === 'error') icon = '⚠';

    toast.innerHTML = `
      <span style="font-weight:700; font-size:15px;">${icon}</span>
      <span class="toast-message">${escapeHtml(message)}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(40px)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
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

  // Initialize
  checkAuthentication();
});
