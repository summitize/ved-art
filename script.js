const STORAGE_PREFIX = "ved.art.v4";
const THEME_KEY = `${STORAGE_PREFIX}.theme`;
const UPLOADS_KEY = `${STORAGE_PREFIX}.uploads`;

const SOCIAL_CONFIG = {
  firebase: {
    apiKey: "",
    authDomain: "",
    projectId: "",
    appId: ""
  },
  providers: {
    google: true,
    apple: false,
    facebook: false
  },
  ...(window.VED_SOCIAL_CONFIG || {})
};

const GUEST_USER = {
  uid: "guest-device",
  provider: "guest",
  name: "Guest User",
  email: ""
};

const PROVIDER_LABELS = {
  guest: "Guest",
  google: "Google",
  apple: "Apple",
  facebook: "Facebook",
  unknown: "Social"
};

const mediumCycle = ["Acrylic on Canvas", "Oil on Canvas", "Watercolor", "Mixed Media"];

const paintingSeed = [
  {
    title: "Sapphire Current",
    mood: "Vibrant Flow",
    description: "A sweeping dance of sapphire and gold, capturing the ephemeral moment when light bends through moving water."
  },
  {
    title: "Azure Whisper",
    mood: "Calm Pulse",
    description: "Delicate ripples of azure and silver whisper stories of ancient currents, inviting the viewer into a state of deep reflection."
  },
  {
    title: "Morning Pulse",
    mood: "Fresh Light",
    description: "The first light of day breaks across the canvas in rhythmic pulses of amber and pearl, signaling a new beginning."
  },
  {
    title: "Twilight Blossom",
    mood: "Soft Energy",
    description: "A subtle exploration of organic growth, where soft pastels emerge from the shadows like a flower opening at twilight."
  },
  {
    title: "Stillness in Ochre",
    mood: "Warm Glow",
    description: "Rich metallic textures collide with sun-drenched ochre, freezing a single moment of absolute stillness in time."
  },
  {
    title: "Midnight Metro",
    mood: "Urban Melody",
    description: "The chaotic energy of a midnight metropolis is transformed into a melodic arrangement of geometric shapes and neon flashes."
  },
  {
    title: "Monsoon Reverie",
    mood: "Rain Memory",
    description: "Deep indigo washes and sharp white highlights recreate the sensory experience of a sudden tropical downpour."
  },
  {
    title: "Edge of Infinity",
    mood: "Open Sky",
    description: "A fearless journey into the unknown, defined by a sharp, uncompromising line that separates the earth from the infinite sky."
  },
  {
    title: "Shattered Radiance",
    mood: "Radiant Layer",
    description: "Scattered rays of light are caught in a kaleidoscope of warm tones, representing the fractured nature of memory."
  },
  {
    title: "Tactile Moment",
    mood: "Raw Detail",
    description: "A visceral, high-relief composition where the physical presence of the paint speaks louder than the colors themselves."
  },
  {
    title: "Urban Haze",
    mood: "Electric Calm",
    description: "Towering structures dissolve into a haze of atmospheric grays and blues, questioning the permanence of the urban landscape."
  },
  {
    title: "Nostalgic Garden",
    mood: "Floral Pulse",
    description: "A nostalgic tapestry of vibrant wildflowers, painted with the raw honesty and uninhibited joy of a child's imagination."
  },
  {
    title: "Lone Lantern",
    mood: "Night Glow",
    description: "A singular point of warmth pierces through a vast, velvety darkness, symbolizing hope in the midst of solitude."
  },
  {
    title: "Tidal Exhale",
    mood: "Tidal Drift",
    description: "Colossal swells of turquoise and foam heave with a rhythmic intensity that mirrors the life force of the sea."
  },
  {
    title: "Scarlet Orbit",
    mood: "Fiery Motion",
    description: "A celestial explosion of fiery reds and deep blacks, mapping the trajectory of an unspoken passion through the void."
  },
  {
    title: "Cerulean Tonight",
    mood: "Nocturnal Calm",
    description: "A quiet blue twilight scene that blends gentle light and shadow into an emotional evening composition."
  },
  {
    title: "Golden Drift",
    mood: "Warm Motion",
    description: "A hazy rush of golden ochre and amber, evoking the slow warmth of sunlight drifting across a textured landscape."
  },
  {
    title: "Prismatic Arc",
    mood: "Joyful Bloom",
    description: "A bold arc of vivid color sweeps across the canvas, capturing the energy of light and emotion colliding in motion."
  }
];

const paintings = paintingSeed.map((painting, index) => ({
  id: index + 1,
  title: painting.title,
  mood: painting.mood,
  description: painting.description,
  medium: mediumCycle[index % mediumCycle.length],
  year: index % 2 === 0 ? "2025" : "2024",
  file: `arts/page_${index + 1}.jpg`
}));

const validPaintingIds = new Set(paintings.map((painting) => painting.id));
const loadedScripts = new Map();

const elements = {
  body: document.body,
  year: document.getElementById("year"),
  authMessage: document.getElementById("auth-message"),
  authStatus: document.getElementById("auth-status"),
  viewerName: document.getElementById("viewer-name"),
  viewerMeta: document.getElementById("viewer-meta"),
  signoutBtn: document.getElementById("signout-btn"),
  themeToggle: document.getElementById("theme-toggle"),
  googleLogin: document.getElementById("google-login"),
  appleLogin: document.getElementById("apple-login"),
  facebookLogin: document.getElementById("facebook-login"),
  mediumButtons: [...document.querySelectorAll("[data-medium]")],
  favFilterBtn: document.getElementById("fav-filter-btn"),
  boughtFilterBtn: document.getElementById("bought-filter-btn"),
  featuredGrid: document.getElementById("featured-grid"),
  galleryGrid: document.getElementById("gallery-grid"),
  cartItems: document.getElementById("cart-items"),
  cartEmpty: document.getElementById("cart-empty"),
  cartSubtotal: document.getElementById("cart-subtotal"),
  cartDelivery: document.getElementById("cart-delivery"),
  cartTotal: document.getElementById("cart-total"),
  checkoutBtn: document.getElementById("checkout-btn"),
  favCount: document.getElementById("fav-count"),
  boughtCount: document.getElementById("bought-count"),
  boughtList: document.getElementById("bought-list"),
  boughtEmpty: document.getElementById("bought-empty"),
  modal: document.getElementById("painting-modal"),
  modalClose: document.getElementById("modal-close"),
  modalImage: document.getElementById("modal-image"),
  modalImageFallback: document.getElementById("modal-image-fallback"),
  modalNumber: document.getElementById("modal-number"),
  modalTitle: document.getElementById("modal-title"),
  modalMeta: document.getElementById("modal-meta"),
  modalDescription: document.getElementById("modal-description"),
  modalFavBtn: document.getElementById("modal-fav-btn"),
  modalCartBtn: document.getElementById("modal-cart-btn"),
  modalBuyBtn: document.getElementById("modal-buy-btn"),
  uploadForm: document.getElementById("cms-upload-form"),
  uploadPaintingId: document.getElementById("upload-painting-id"),
  uploadFile: document.getElementById("upload-file"),
  uploadPreviewImg: document.getElementById("upload-preview-img"),
  uploadPreviewText: document.getElementById("upload-preview-text"),
  uploadStatus: document.getElementById("upload-status"),
  uploadClearBtn: document.getElementById("upload-clear-btn")
};

const state = {
  currentUser: { ...GUEST_USER },
  favourites: new Set(),
  cart: new Map(),
  purchases: new Map(),
  selectedMedium: "all",
  favOnly: false,
  boughtOnly: false,
  activePaintingId: null,
  authReady: false,
  authEnabled: false
};

let firebaseAuth = null;
let authButtonsLocked = false;

const parseJson = (value, fallback) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);

const customUploads = new Map();

const loadCustomUploads = () => {
  const saved = parseJson(localStorage.getItem(UPLOADS_KEY), {});
  customUploads.clear();

  if (saved && typeof saved === "object") {
    for (const entry of Object.entries(saved)) {
      const id = Number(entry[0]);
      const payload = entry[1];
      if (!Number.isFinite(id) || !payload || typeof payload.dataUrl !== "string") {
        continue;
      }
      customUploads.set(id, {
        dataUrl: payload.dataUrl,
        fileName: payload.fileName || "",
        type: payload.type || "",
        updatedAt: payload.updatedAt || new Date().toISOString()
      });
    }
  }
};

const persistCustomUploads = () => {
  const payload = {};
  for (const [id, upload] of customUploads.entries()) {
    payload[id] = {
      dataUrl: upload.dataUrl,
      fileName: upload.fileName,
      type: upload.type,
      updatedAt: upload.updatedAt
    };
  }
  localStorage.setItem(UPLOADS_KEY, JSON.stringify(payload));
};

const getPainting = (id) => paintings.find((painting) => painting.id === id);
const isProviderEnabled = (providerName) => Boolean((SOCIAL_CONFIG.providers || {})[providerName]);
const getStorageKeyForUser = (user) => `${STORAGE_PREFIX}.profile.${user.uid}`;

const setAuthMessage = (text) => {
  elements.authMessage.textContent = text;
};

const setAuthStatus = (status, text) => {
  elements.authStatus.dataset.state = status;
  elements.authStatus.textContent = text;
};

const loadScriptOnce = (id, src) => {
  if (loadedScripts.has(id)) {
    return loadedScripts.get(id);
  }

  const promise = new Promise((resolve, reject) => {
    const existing = document.getElementById(id);
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Unable to load ${src}`));
    document.head.appendChild(script);
  });

  loadedScripts.set(id, promise);
  return promise;
};

const sanitizeEntryMap = (entries) => {
  const safeMap = new Map();
  for (const entry of entries) {
    if (!Array.isArray(entry) || entry.length < 2) {
      continue;
    }

    const id = Number(entry[0]);
    const qty = Number(entry[1]);
    if (!validPaintingIds.has(id) || !Number.isFinite(qty) || qty <= 0) {
      continue;
    }

    safeMap.set(id, Math.floor(qty));
  }

  return safeMap;
};

const sanitizeFavouriteList = (ids) =>
  new Set(ids.map((id) => Number(id)).filter((id) => validPaintingIds.has(id)));

const loadProfileForCurrentUser = () => {
  const storageKey = getStorageKeyForUser(state.currentUser);
  const saved = parseJson(localStorage.getItem(storageKey), null);

  if (!saved) {
    state.favourites = new Set();
    state.cart = new Map();
    state.purchases = new Map();
    return;
  }

  state.favourites = sanitizeFavouriteList(Array.isArray(saved.favourites) ? saved.favourites : []);
  state.cart = sanitizeEntryMap(Array.isArray(saved.cart) ? saved.cart : []);
  state.purchases = sanitizeEntryMap(Array.isArray(saved.purchases) ? saved.purchases : []);
};

const persistCurrentProfile = () => {
  const storageKey = getStorageKeyForUser(state.currentUser);
  const payload = {
    favourites: [...state.favourites],
    cart: [...state.cart.entries()],
    purchases: [...state.purchases.entries()]
  };

  localStorage.setItem(storageKey, JSON.stringify(payload));
};

const applyTheme = (theme) => {
  const nextTheme = theme === "night" ? "night" : "day";
  elements.body.dataset.theme = nextTheme;
  elements.themeToggle.textContent = nextTheme === "night" ? "Day Mode" : "Night Mode";
  localStorage.setItem(THEME_KEY, nextTheme);
};

const initTheme = () => {
  const savedTheme = localStorage.getItem(THEME_KEY);
  applyTheme(savedTheme === "night" ? "night" : "day");
};

const providerFromFirebaseId = (providerId) => {
  if (providerId === "google.com") {
    return "google";
  }
  if (providerId === "facebook.com") {
    return "facebook";
  }
  if (providerId === "apple.com") {
    return "apple";
  }
  return "unknown";
};

const userFromFirebase = (user) => {
  const primaryProviderId = user.providerData?.[0]?.providerId || user.providerId || "unknown";
  return {
    uid: String(user.uid || `uid-${Date.now()}`),
    provider: providerFromFirebaseId(primaryProviderId),
    name: user.displayName || user.email || "User",
    email: user.email || ""
  };
};

const buildViewerMeta = () => {
  if (state.currentUser.provider === "guest") {
    return "Guest mode on this device";
  }

  const provider = PROVIDER_LABELS[state.currentUser.provider] || PROVIDER_LABELS.unknown;
  const email = state.currentUser.email ? ` | ${state.currentUser.email}` : "";
  return `${provider} account${email}`;
};

const updateProviderButtonState = () => {
  const providerButtons = [
    { key: "google", element: elements.googleLogin, label: "Google" },
    { key: "apple", element: elements.appleLogin, label: "Apple" },
    { key: "facebook", element: elements.facebookLogin, label: "Facebook" }
  ];

  for (const item of providerButtons) {
    const enabledInConfig = isProviderEnabled(item.key);
    const enabledNow = authButtonsLocked ? false : enabledInConfig ? state.authEnabled : true;

    item.element.disabled = !enabledNow;
    item.element.dataset.comingSoon = enabledInConfig ? "false" : "true";
    item.element.title = enabledInConfig
      ? `Continue with ${item.label}`
      : `${item.label} integration coming soon`;
  }
};

const setAuthButtonsDisabled = (isDisabled) => {
  authButtonsLocked = isDisabled;
  updateProviderButtonState();
};

const renderAuthBlock = () => {
  elements.viewerName.textContent = state.currentUser.name || "User";
  elements.viewerMeta.textContent = buildViewerMeta();
  elements.signoutBtn.hidden = state.currentUser.provider === "guest";
};

const renderMediumFilters = () => {
  for (const button of elements.mediumButtons) {
    const isActive = button.dataset.medium === state.selectedMedium;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  }
};

const getVisiblePaintings = () =>
  paintings.filter((painting) => {
    if (state.selectedMedium !== "all" && painting.medium !== state.selectedMedium) {
      return false;
    }
    if (state.favOnly && !state.favourites.has(painting.id)) {
      return false;
    }
    if (state.boughtOnly && !state.purchases.has(painting.id)) {
      return false;
    }
    return true;
  });

const getPaintingImageSource = (painting) => {
  const upload = customUploads.get(painting.id);
  return upload?.dataUrl || painting.file;
};

const createFeaturedCard = (painting) => `
  <article class="featured-card" data-open-id="${painting.id}" role="button" tabindex="0" aria-label="Open details for ${painting.title}">
    <div class="featured-thumb" data-missing="false">
      <img src="${getPaintingImageSource(painting)}" alt="${painting.title} by Ved Sumeet Bub" loading="lazy" data-art-image="true" />
      <div class="featured-overlay">
        <span class="tag">Featured</span>
        <h3>${painting.title}</h3>
        <p class="featured-meta">${painting.medium} - ${painting.year}</p>
      </div>
    </div>
  </article>
`;

const createGalleryCard = (painting) => {
  const favActive = state.favourites.has(painting.id);
  const cartQty = state.cart.get(painting.id) || 0;
  const boughtQty = state.purchases.get(painting.id) || 0;

  return `
    <article class="gallery-card" data-id="${painting.id}" role="button" tabindex="0" aria-label="Open details for ${painting.title}">
      <div class="gallery-image" data-missing="false">
        ${boughtQty > 0 ? `<span class="status-chip">Bought x${boughtQty}</span>` : ""}
        <span class="card-number">#${painting.id}</span>
        <img src="${getPaintingImageSource(painting)}" alt="${painting.title} by Ved Sumeet Bub" loading="lazy" data-art-image="true" />
      </div>
      <div class="gallery-copy">
        <p class="gallery-title">${painting.title}</p>
        <p class="gallery-meta">${painting.medium} - ${painting.year}</p>
        <div class="gallery-actions">
          <button class="action-btn fav ${favActive ? "active" : ""}" type="button" data-action="toggle-fav" data-id="${painting.id}">
            ${favActive ? "Favourited" : "Favourite"}
          </button>
          <button class="action-btn cart" type="button" data-action="add-cart" data-id="${painting.id}">
            ${cartQty > 0 ? `Cart (${cartQty})` : "Add Cart"}
          </button>
          <button class="action-btn buy" type="button" data-action="quick-buy" data-id="${painting.id}">
            Save Now
          </button>
        </div>
      </div>
    </article>
  `;
};

const attachImageFallbackHandlers = () => {
  const images = document.querySelectorAll("img[data-art-image='true']");
  for (const image of images) {
    image.addEventListener(
      "error",
      () => {
        const frame = image.closest("[data-missing]");
        if (frame) {
          frame.dataset.missing = "true";
        }
        image.remove();
      },
      { once: true }
    );
  }
};

const renderFeatured = () => {
  const featured = paintings.slice(0, 3);
  elements.featuredGrid.innerHTML = featured.map(createFeaturedCard).join("");
  attachImageFallbackHandlers();
};

const renderUploadPaintingOptions = () => {
  if (!elements.uploadPaintingId) {
    return;
  }

  elements.uploadPaintingId.innerHTML = paintings
    .map((painting) => `<option value="${painting.id}">#${painting.id} ${painting.title}</option>`)
    .join("");

  updateUploadPreview();
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Unable to read file."));
    reader.readAsDataURL(file);
  });

const setUploadStatus = (text, isError = false) => {
  if (!elements.uploadStatus) {
    return;
  }

  elements.uploadStatus.textContent = text;
  elements.uploadStatus.style.color = isError ? "#c74b4b" : "";
};

const updateUploadPreview = () => {
  if (!elements.uploadPaintingId || !elements.uploadPreviewImg || !elements.uploadPreviewText) {
    return;
  }

  const selectedId = Number(elements.uploadPaintingId.value);
  const custom = customUploads.get(selectedId);

  if (elements.uploadFile.files && elements.uploadFile.files.length > 0) {
    const file = elements.uploadFile.files[0];
    const temporaryUrl = URL.createObjectURL(file);
    elements.uploadPreviewImg.src = temporaryUrl;
    elements.uploadPreviewImg.hidden = false;
    elements.uploadPreviewText.textContent = `Previewing ${file.name} for painting #${selectedId}.`;
    return;
  }

  if (custom) {
    elements.uploadPreviewImg.src = custom.dataUrl;
    elements.uploadPreviewImg.hidden = false;
    elements.uploadPreviewText.textContent = `Custom image currently stored for painting #${selectedId}.`;
    return;
  }

  elements.uploadPreviewImg.hidden = true;
  elements.uploadPreviewText.textContent = "Select an image and painting slot to preview.";
};

const clearUploadForSelectedPainting = () => {
  if (!elements.uploadPaintingId) {
    return;
  }

  const paintingId = Number(elements.uploadPaintingId.value);
  if (!validPaintingIds.has(paintingId)) {
    setUploadStatus("Select a valid painting slot before clearing.", true);
    return;
  }

  if (!customUploads.has(paintingId)) {
    setUploadStatus(`No custom image is stored for painting #${paintingId}.`);
    return;
  }

  customUploads.delete(paintingId);
  persistCustomUploads();
  setUploadStatus(`Custom image removed for painting #${paintingId}.`);
  elements.uploadFile.value = "";
  updateUploadPreview();
  renderAll();
};

const uploadPaintingImage = async (event) => {
  event.preventDefault();
  if (!elements.uploadPaintingId || !elements.uploadFile) {
    return;
  }

  const paintingId = Number(elements.uploadPaintingId.value);
  if (!validPaintingIds.has(paintingId)) {
    setUploadStatus("Please choose a valid painting slot.", true);
    return;
  }

  const file = elements.uploadFile.files?.[0];
  if (!file) {
    setUploadStatus("Select an image file to upload.", true);
    return;
  }

  if (!file.type.startsWith("image/")) {
    setUploadStatus("Only PNG and JPEG image files are supported.", true);
    return;
  }

  try {
    const dataUrl = String(await readFileAsDataUrl(file));
    customUploads.set(paintingId, {
      dataUrl,
      fileName: file.name,
      type: file.type,
      updatedAt: new Date().toISOString()
    });
    persistCustomUploads();
    setUploadStatus(`Uploaded ${file.name} for painting #${paintingId}.`);
    elements.uploadFile.value = "";
    updateUploadPreview();
    renderAll();
  } catch (error) {
    console.error(error);
    setUploadStatus("Upload failed. Try a smaller image or a different file.", true);
  }
};

const renderGallery = () => {
  const visiblePaintings = getVisiblePaintings();
  renderMediumFilters();

  elements.favFilterBtn.textContent = `Favourites Only: ${state.favOnly ? "On" : "Off"}`;
  elements.boughtFilterBtn.textContent = `Bought Only: ${state.boughtOnly ? "On" : "Off"}`;
  elements.favFilterBtn.setAttribute("aria-pressed", state.favOnly ? "true" : "false");
  elements.boughtFilterBtn.setAttribute("aria-pressed", state.boughtOnly ? "true" : "false");

  if (visiblePaintings.length === 0) {
    elements.galleryGrid.innerHTML = `
      <div class="empty-grid">
        No paintings match this filter yet. Try another medium or switch off active filters.
      </div>
    `;
    return;
  }

  elements.galleryGrid.innerHTML = visiblePaintings.map(createGalleryCard).join("");
  attachImageFallbackHandlers();
};

const renderCart = () => {
  const entries = [...state.cart.entries()];
  const totalSelected = entries.reduce((sum, [, qty]) => sum + qty, 0);

  elements.cartSubtotal.textContent = `${totalSelected} ${totalSelected === 1 ? "painting" : "paintings"} selected`;
  elements.cartDelivery.textContent = entries.length > 0 ? "Ready to save" : "No items selected";
  elements.cartTotal.textContent = `${totalSelected} ${totalSelected === 1 ? "item" : "items"}`;
  elements.checkoutBtn.disabled = entries.length === 0;

  if (entries.length === 0) {
    elements.cartItems.innerHTML = "";
    elements.cartEmpty.hidden = false;
    return;
  }

  elements.cartEmpty.hidden = true;
  elements.cartItems.innerHTML = entries
    .map(([id, qty]) => {
      const painting = getPainting(id);
      if (!painting) {
        return "";
      }

      return `
        <li class="cart-item">
          <div class="cart-head">
            <div>
              <p class="cart-name">${painting.title}</p>
              <p class="cart-price">Qty ${qty}</p>
            </div>
          </div>
          <div class="cart-controls">
            <button class="qty-btn" type="button" data-cart-action="decrease" data-id="${id}">-</button>
            <span class="qty-label">Qty ${qty}</span>
            <button class="qty-btn" type="button" data-cart-action="increase" data-id="${id}">+</button>
            <button class="remove-btn" type="button" data-cart-action="remove" data-id="${id}">Remove</button>
          </div>
        </li>
      `;
    })
    .join("");
};

const renderSavedPanel = () => {
  const purchaseEntries = [...state.purchases.entries()];
  const boughtTotal = purchaseEntries.reduce((sum, [, qty]) => sum + qty, 0);

  elements.favCount.textContent = String(state.favourites.size);
  elements.boughtCount.textContent = String(boughtTotal);

  if (purchaseEntries.length === 0) {
    elements.boughtList.innerHTML = "";
    elements.boughtEmpty.hidden = false;
    return;
  }

  elements.boughtEmpty.hidden = true;
  elements.boughtList.innerHTML = purchaseEntries
    .map(([id, qty]) => {
      const painting = getPainting(id);
      if (!painting) {
        return "";
      }
      return `
        <li class="bought-item">
          <strong>${painting.title}</strong>
          <p class="cart-price">${qty} purchased</p>
        </li>
      `;
    })
    .join("");
};

const closeModal = () => {
  state.activePaintingId = null;
  elements.modal.hidden = true;
};

const renderModal = () => {
  if (!state.activePaintingId) {
    elements.modal.hidden = true;
    return;
  }

  const painting = getPainting(state.activePaintingId);
  if (!painting) {
    closeModal();
    return;
  }

  const favActive = state.favourites.has(painting.id);
  const cartQty = state.cart.get(painting.id) || 0;

  elements.modal.hidden = false;
  elements.modal.dataset.id = String(painting.id);
  elements.modalNumber.textContent = `Painting #${painting.id}`;
  elements.modalTitle.textContent = painting.title;
  elements.modalMeta.textContent = `${painting.medium} - ${painting.year} - ${painting.mood}`;
  elements.modalDescription.textContent = painting.description;
  elements.modalImageFallback.hidden = true;
  elements.modalImage.src = getPaintingImageSource(painting);
  elements.modalImage.alt = `${painting.title} by Ved Sumeet Bub`;
  elements.modalFavBtn.textContent = favActive ? "Favourited" : "Favourite";
  elements.modalFavBtn.classList.toggle("active", favActive);
  elements.modalCartBtn.textContent = cartQty > 0 ? `Add Cart (${cartQty})` : "Add Cart";
};

const openModal = (paintingId) => {
  if (!validPaintingIds.has(paintingId)) {
    return;
  }
  state.activePaintingId = paintingId;
  renderModal();
};

const renderAll = () => {
  renderAuthBlock();
  renderFeatured();
  renderGallery();
  renderCart();
  renderSavedPanel();
  renderUploadPaintingOptions();
  renderModal();
  elements.year.textContent = new Date().getFullYear();
};

const handlePaintingAction = (action, paintingId) => {
  if (!validPaintingIds.has(paintingId)) {
    return;
  }

  if (action === "toggle-fav") {
    if (state.favourites.has(paintingId)) {
      state.favourites.delete(paintingId);
    } else {
      state.favourites.add(paintingId);
    }
  }

  if (action === "add-cart") {
    const currentQty = state.cart.get(paintingId) || 0;
    state.cart.set(paintingId, currentQty + 1);
  }

  if (action === "quick-buy") {
    const currentQty = state.purchases.get(paintingId) || 0;
    state.purchases.set(paintingId, currentQty + 1);
    state.cart.delete(paintingId);
  }

  persistCurrentProfile();
  renderAll();
};

const finalizeAuthUser = (firebaseUser) => {
  state.currentUser = userFromFirebase(firebaseUser);
  loadProfileForCurrentUser();
  setAuthMessage(`Signed in as ${state.currentUser.name}. Personalized Ved gallery memory is active.`);
  setAuthStatus("signed-in", "Auth Status: Signed In");
  renderAll();
};

const setGuestMode = (message, status = "ready") => {
  state.currentUser = { ...GUEST_USER };
  loadProfileForCurrentUser();
  setAuthMessage(message);
  setAuthStatus(status, status === "ready" ? "Auth Status: Ready" : "Auth Status: Not Ready");
  renderAll();
};

const isFirebaseConfigValid = (config) =>
  Boolean(config && config.apiKey && config.authDomain && config.projectId && config.appId);

const initFirebaseAuth = async () => {
  const config = SOCIAL_CONFIG.firebase || {};

  if (!isFirebaseConfigValid(config)) {
    state.authReady = true;
    state.authEnabled = false;
    setAuthButtonsDisabled(false);
    setGuestMode(
      "Auth is not configured. Add Firebase keys in auth-config.js and enable providers.",
      "config-missing"
    );
    setAuthStatus("config-missing", "Auth Status: Config Missing");
    return;
  }

  try {
    await loadScriptOnce("firebase-app-compat", "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
    await loadScriptOnce("firebase-auth-compat", "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js");

    if (!window.firebase || !window.firebase.auth) {
      throw new Error("Firebase SDK failed to initialize");
    }

    if (!window.firebase.apps.length) {
      window.firebase.initializeApp(config);
    }

    firebaseAuth = window.firebase.auth();
    state.authEnabled = true;
    state.authReady = true;
    setAuthButtonsDisabled(false);

    firebaseAuth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        finalizeAuthUser(firebaseUser);
      } else {
        setGuestMode("You are in guest mode. Sign in to save favourites and bought paintings.", "ready");
        setAuthStatus("ready", "Auth Status: Ready");
      }
    });
  } catch (error) {
    console.error(error);
    state.authReady = true;
    state.authEnabled = false;
    setAuthButtonsDisabled(false);
    setGuestMode("Auth could not be initialized. Verify Firebase config and authorized domains.", "error");
    setAuthStatus("error", "Auth Status: Init Failed");
  }
};

const signInWithProvider = async (providerName) => {
  if (!isProviderEnabled(providerName)) {
    const providerLabel = PROVIDER_LABELS[providerName] || "This provider";
    setAuthMessage(`${providerLabel} integration will be enabled soon.`);
    setAuthStatus("ready", "Auth Status: Ready");
    return;
  }

  if (!state.authEnabled || !firebaseAuth) {
    setAuthMessage("Sign-up is not ready yet. Configure Firebase in auth-config.js.");
    setAuthStatus("config-missing", "Auth Status: Config Missing");
    return;
  }

  let provider = null;

  if (providerName === "google") {
    provider = new window.firebase.auth.GoogleAuthProvider();
    provider.addScope("email");
    provider.addScope("profile");
  }

  if (providerName === "facebook") {
    provider = new window.firebase.auth.FacebookAuthProvider();
    provider.addScope("email");
  }

  if (providerName === "apple") {
    provider = new window.firebase.auth.OAuthProvider("apple.com");
    provider.addScope("email");
    provider.addScope("name");
  }

  if (!provider) {
    setAuthMessage("Unsupported provider.");
    setAuthStatus("error", "Auth Status: Unsupported Provider");
    return;
  }

  try {
    setAuthStatus("signing-in", `Auth Status: Signing In (${providerName})`);
    await firebaseAuth.signInWithPopup(provider);
  } catch (error) {
    const code = error && error.code ? error.code : "";

    if (code === "auth/popup-blocked" || code === "auth/popup-closed-by-user") {
      try {
        await firebaseAuth.signInWithRedirect(provider);
        return;
      } catch (redirectError) {
        console.error(redirectError);
      }
    }

    console.error(error);
    setAuthMessage(`Sign-in failed (${code || "unknown"}). Check provider setup and authorized domains.`);
    setAuthStatus("error", `Auth Status: Sign-in Failed (${code || "unknown"})`);
  }
};

elements.mediumButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.selectedMedium = button.dataset.medium || "all";
    renderGallery();
  });
});

elements.favFilterBtn.addEventListener("click", () => {
  state.favOnly = !state.favOnly;
  renderGallery();
});

elements.boughtFilterBtn.addEventListener("click", () => {
  state.boughtOnly = !state.boughtOnly;
  renderGallery();
});

elements.galleryGrid.addEventListener("click", (event) => {
  const actionButton = event.target.closest("button[data-action]");
  if (actionButton) {
    handlePaintingAction(actionButton.dataset.action, Number(actionButton.dataset.id));
    return;
  }

  const card = event.target.closest("article[data-id]");
  if (card) {
    openModal(Number(card.dataset.id));
  }
});

elements.galleryGrid.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  if (event.target.closest("button")) {
    return;
  }

  const card = event.target.closest("article[data-id]");
  if (!card) {
    return;
  }

  event.preventDefault();
  openModal(Number(card.dataset.id));
});

elements.featuredGrid.addEventListener("click", (event) => {
  const card = event.target.closest("article[data-open-id]");
  if (!card) {
    return;
  }
  openModal(Number(card.dataset.openId));
});

elements.featuredGrid.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  const card = event.target.closest("article[data-open-id]");
  if (!card) {
    return;
  }

  event.preventDefault();
  openModal(Number(card.dataset.openId));
});

elements.cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-cart-action]");
  if (!button) {
    return;
  }

  const paintingId = Number(button.dataset.id);
  const action = button.dataset.cartAction;
  const currentQty = state.cart.get(paintingId) || 0;

  if (!validPaintingIds.has(paintingId) || currentQty === 0) {
    return;
  }

  if (action === "increase") {
    state.cart.set(paintingId, currentQty + 1);
  }

  if (action === "decrease") {
    if (currentQty <= 1) {
      state.cart.delete(paintingId);
    } else {
      state.cart.set(paintingId, currentQty - 1);
    }
  }

  if (action === "remove") {
    state.cart.delete(paintingId);
  }

  persistCurrentProfile();
  renderAll();
});

elements.checkoutBtn.addEventListener("click", () => {
  if (state.cart.size === 0) {
    return;
  }

  for (const [id, qty] of state.cart.entries()) {
    const existingQty = state.purchases.get(id) || 0;
    state.purchases.set(id, existingQty + qty);
  }

  state.cart.clear();
  persistCurrentProfile();
  renderAll();
  window.alert("Selection recorded and saved to your profile.");
});

elements.themeToggle.addEventListener("click", () => {
  const currentTheme = elements.body.dataset.theme === "night" ? "night" : "day";
  applyTheme(currentTheme === "night" ? "day" : "night");
});

elements.uploadPaintingId?.addEventListener("change", updateUploadPreview);

elements.uploadFile?.addEventListener("change", () => {
  updateUploadPreview();
});

elements.uploadForm?.addEventListener("submit", uploadPaintingImage);

elements.uploadClearBtn?.addEventListener("click", clearUploadForSelectedPainting);

elements.signoutBtn.addEventListener("click", async () => {
  if (firebaseAuth && state.currentUser.provider !== "guest") {
    await firebaseAuth.signOut();
    return;
  }
  setGuestMode("Signed out. You are in guest mode.", "ready");
  setAuthStatus("ready", "Auth Status: Ready");
});

elements.googleLogin.addEventListener("click", () => signInWithProvider("google"));
elements.appleLogin.addEventListener("click", () => signInWithProvider("apple"));
elements.facebookLogin.addEventListener("click", () => signInWithProvider("facebook"));

elements.modal.addEventListener("click", (event) => {
  const shouldClose = event.target.closest("[data-close-modal='true']");
  if (shouldClose) {
    closeModal();
    return;
  }

  if (event.target === elements.modalFavBtn) {
    handlePaintingAction("toggle-fav", state.activePaintingId);
    return;
  }

  if (event.target === elements.modalCartBtn) {
    handlePaintingAction("add-cart", state.activePaintingId);
    return;
  }

  if (event.target === elements.modalBuyBtn) {
    handlePaintingAction("quick-buy", state.activePaintingId);
  }
});

elements.modalImage.addEventListener(
  "error",
  () => {
    elements.modalImage.removeAttribute("src");
    elements.modalImage.alt = "";
    elements.modalImageFallback.hidden = false;
  },
  { once: false }
);

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !elements.modal.hidden) {
    closeModal();
  }
});

initTheme();
setAuthButtonsDisabled(true);
loadCustomUploads();
renderAll();
setAuthMessage("Initializing authentication...");
setAuthStatus("init", "Auth Status: Initializing");
initFirebaseAuth();
