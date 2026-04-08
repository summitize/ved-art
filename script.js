const PAINTING_PRICE = 25000;
const DELIVERY_CHARGE = 1200;

const STORAGE_PREFIX = "ved.art.v4";
const THEME_KEY = `${STORAGE_PREFIX}.theme`;

const SOCIAL_CONFIG = {
  firebase: {
    apiKey: "",
    authDomain: "",
    projectId: "",
    appId: ""
  },
  ...(window.VED_SOCIAL_CONFIG || {})
};

const GUEST_USER = {
  uid: "guest-device",
  provider: "guest",
  name: "Guest Collector",
  email: ""
};

const PROVIDER_LABELS = {
  guest: "Guest",
  google: "Google",
  apple: "Apple",
  facebook: "Facebook",
  unknown: "Social"
};

const paintingSeed = [
  { title: "Ved's Color Drift", mood: "Vibrant Flow", file: "arts/painting-01.jpg" },
  { title: "Ved's River Echo", mood: "Calm Pulse", file: "arts/painting-02.jpg" },
  { title: "Ved's Dawn Rhythm", mood: "Fresh Light", file: "arts/painting-03.jpg" },
  { title: "Ved's Quiet Bloom", mood: "Soft Energy", file: "arts/painting-04.jpg" },
  { title: "Ved's Golden Pause", mood: "Warm Glow", file: "arts/painting-05.jpg" },
  { title: "Ved's Street Sonata", mood: "Urban Melody", file: "arts/painting-06.jpg" },
  { title: "Ved's Monsoon Notes", mood: "Rain Memory", file: "arts/painting-07.jpg" },
  { title: "Ved's Bold Horizon", mood: "Open Sky", file: "arts/painting-08.jpg" },
  { title: "Ved's Sun Fragments", mood: "Radiant Layer", file: "arts/painting-09.jpg" },
  { title: "Ved's Living Texture", mood: "Raw Detail", file: "arts/painting-10.jpg" },
  { title: "Ved's City Mirage", mood: "Electric Calm", file: "arts/painting-11.jpg" },
  { title: "Ved's Memory Garden", mood: "Floral Pulse", file: "arts/painting-12.jpg" },
  { title: "Ved's Silent Lantern", mood: "Night Glow", file: "arts/painting-13.jpg" },
  { title: "Ved's Ocean Breath", mood: "Tidal Drift", file: "arts/painting-14.jpg" },
  { title: "Ved's Crimson Orbit", mood: "Fiery Motion", file: "arts/painting-15.jpg" },
  { title: "Ved's Morning Terrace", mood: "Light Breeze", file: "arts/painting-16.jpg" },
  { title: "Ved's Hidden Valley", mood: "Earth Tone", file: "arts/painting-17.jpg" },
  { title: "Ved's Chroma Rain", mood: "Playful Burst", file: "arts/painting-18.jpg" },
  { title: "Ved's Skyline Verse", mood: "Neon Air", file: "arts/painting-19.jpg" },
  { title: "Ved's Sunset Geometry", mood: "Shape & Heat", file: "arts/painting-20.jpg" },
  { title: "Ved's Indigo Silence", mood: "Deep Tone", file: "arts/painting-21.jpg" },
  { title: "Ved's Morning Pulse", mood: "Bright Calm", file: "arts/painting-22.jpg" },
  { title: "Ved's Earth Chorus", mood: "Organic Beat", file: "arts/painting-23.jpg" },
  { title: "Ved's Soft Thunder", mood: "Charged Air", file: "arts/painting-24.jpg" },
  { title: "Ved's Last Light", mood: "Evening Story", file: "arts/painting-25.jpg" }
];

const paintings = paintingSeed.map((painting, index) => ({
  id: index + 1,
  price: PAINTING_PRICE,
  ...painting
}));

const validPaintingIds = new Set(paintings.map((painting) => painting.id));
const tilePattern = ["wide", "", "narrow", "", "wide", "", "", "narrow"];

const elements = {
  body: document.body,
  year: document.getElementById("year"),
  authMessage: document.getElementById("auth-message"),
  viewerName: document.getElementById("viewer-name"),
  viewerMeta: document.getElementById("viewer-meta"),
  signoutBtn: document.getElementById("signout-btn"),
  themeToggle: document.getElementById("theme-toggle"),
  googleLogin: document.getElementById("google-login"),
  appleLogin: document.getElementById("apple-login"),
  facebookLogin: document.getElementById("facebook-login"),
  favFilterBtn: document.getElementById("fav-filter-btn"),
  boughtFilterBtn: document.getElementById("bought-filter-btn"),
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
  boughtEmpty: document.getElementById("bought-empty")
};

const state = {
  currentUser: { ...GUEST_USER },
  favourites: new Set(),
  cart: new Map(),
  purchases: new Map(),
  favOnly: false,
  boughtOnly: false,
  authReady: false,
  authEnabled: false
};

const loadedScripts = new Map();
let firebaseAuth = null;

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

const getPainting = (id) => paintings.find((painting) => painting.id === id);

const setAuthMessage = (text) => {
  elements.authMessage.textContent = text;
};

const setAuthButtonsDisabled = (isDisabled) => {
  elements.googleLogin.disabled = isDisabled;
  elements.appleLogin.disabled = isDisabled;
  elements.facebookLogin.disabled = isDisabled;
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

const isFirebaseConfigValid = (config) =>
  Boolean(config && config.apiKey && config.authDomain && config.projectId && config.appId);

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
    name: user.displayName || user.email || "Collector",
    email: user.email || ""
  };
};

const getStorageKeyForUser = (user) => `${STORAGE_PREFIX}.profile.${user.uid}`;

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
  elements.themeToggle.textContent = nextTheme === "night" ? "Switch to Day" : "Switch to Night";
  localStorage.setItem(THEME_KEY, nextTheme);
};

const initTheme = () => {
  const savedTheme = localStorage.getItem(THEME_KEY);
  applyTheme(savedTheme === "night" ? "night" : "day");
};

const buildViewerMeta = () => {
  if (state.currentUser.provider === "guest") {
    return "Guest mode on this device";
  }

  const provider = PROVIDER_LABELS[state.currentUser.provider] || PROVIDER_LABELS.unknown;
  const email = state.currentUser.email ? ` | ${state.currentUser.email}` : "";
  return `${provider} account${email}`;
};

const renderAuthBlock = () => {
  elements.viewerName.textContent = state.currentUser.name || "Collector";
  elements.viewerMeta.textContent = buildViewerMeta();
  elements.signoutBtn.hidden = state.currentUser.provider === "guest";
};

const getVisiblePaintings = () =>
  paintings.filter((painting) => {
    if (state.favOnly && !state.favourites.has(painting.id)) {
      return false;
    }

    if (state.boughtOnly && !state.purchases.has(painting.id)) {
      return false;
    }

    return true;
  });

const createPaintingTile = (painting, index) => {
  const patternClass = tilePattern[index % tilePattern.length];
  const number = String(painting.id).padStart(2, "0");
  const favActive = state.favourites.has(painting.id);
  const cartQty = state.cart.get(painting.id) || 0;
  const boughtQty = state.purchases.get(painting.id) || 0;

  return `
    <article class="art-tile ${patternClass}" style="animation-delay:${index * 35}ms">
      <div class="tile-image" data-missing="false">
        ${boughtQty > 0 ? `<span class="status-badge">Bought x${boughtQty}</span>` : ""}
        <img
          src="${painting.file}"
          alt="${painting.title} by Ved Sumeet Bub"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div class="tile-body">
        <div class="tile-head">
          <p class="tile-title">${number}. ${painting.title}</p>
        </div>
        <p class="tile-mood">${painting.mood}</p>
        <div class="tile-actions">
          <button class="tile-btn fav ${favActive ? "active" : ""}" type="button" data-action="toggle-fav" data-id="${painting.id}">
            ${favActive ? "Favourited" : "Favourite"}
          </button>
          <button class="tile-btn cart" type="button" data-action="add-cart" data-id="${painting.id}">
            ${cartQty > 0 ? `Add Cart (${cartQty})` : "Add Cart"}
          </button>
          <button class="tile-btn buy" type="button" data-action="quick-buy" data-id="${painting.id}">
            Buy Now
          </button>
        </div>
      </div>
    </article>
  `;
};

const attachImageFallbackHandlers = () => {
  const images = elements.galleryGrid.querySelectorAll(".tile-image img");

  for (const image of images) {
    image.addEventListener(
      "error",
      () => {
        const frame = image.closest(".tile-image");

        if (!frame) {
          return;
        }

        frame.dataset.missing = "true";
        image.remove();
      },
      { once: true }
    );
  }
};

const renderGallery = () => {
  const visiblePaintings = getVisiblePaintings();

  if (visiblePaintings.length === 0) {
    elements.galleryGrid.innerHTML = `
      <div class="empty-wall">
        No paintings match this filter yet. Toggle filters or add favourites and purchases.
      </div>
    `;
  } else {
    elements.galleryGrid.innerHTML = visiblePaintings.map(createPaintingTile).join("");
    attachImageFallbackHandlers();
  }

  elements.favFilterBtn.textContent = `Favourites Only: ${state.favOnly ? "On" : "Off"}`;
  elements.boughtFilterBtn.textContent = `Bought Only: ${state.boughtOnly ? "On" : "Off"}`;
};

const renderCart = () => {
  const entries = [...state.cart.entries()];
  const subtotal = entries.reduce((sum, [id, qty]) => {
    const painting = getPainting(id);
    return sum + (painting ? painting.price * qty : 0);
  }, 0);
  const delivery = subtotal > 0 ? DELIVERY_CHARGE : 0;
  const total = subtotal + delivery;

  elements.cartSubtotal.textContent = formatCurrency(subtotal);
  elements.cartDelivery.textContent = formatCurrency(delivery);
  elements.cartTotal.textContent = formatCurrency(total);
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
              <p class="cart-price">${formatCurrency(painting.price)} each</p>
            </div>
            <strong>${formatCurrency(painting.price * qty)}</strong>
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

const renderAll = () => {
  renderAuthBlock();
  renderGallery();
  renderCart();
  renderSavedPanel();
  elements.year.textContent = new Date().getFullYear();
};

const finalizeAuthUser = (firebaseUser) => {
  state.currentUser = userFromFirebase(firebaseUser);
  loadProfileForCurrentUser();
  setAuthMessage(`Signed in as ${state.currentUser.name}. Personalized Ved collection is active.`);
  renderAll();
};

const setGuestMode = (message) => {
  state.currentUser = { ...GUEST_USER };
  loadProfileForCurrentUser();
  setAuthMessage(message);
  renderAll();
};

const initFirebaseAuth = async () => {
  const config = SOCIAL_CONFIG.firebase || {};

  if (!isFirebaseConfigValid(config)) {
    state.authReady = true;
    state.authEnabled = false;
    setAuthButtonsDisabled(false);
    setGuestMode("Auth is not configured. Add Firebase keys in auth-config.js and enable Google/Facebook/Apple providers.");
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
        setGuestMode("You are in guest mode. Sign in to save favourites and purchases to your account.");
      }
    });
  } catch (error) {
    console.error(error);
    state.authReady = true;
    state.authEnabled = false;
    setAuthButtonsDisabled(false);
    setGuestMode("Auth could not be initialized. Check Firebase config and authorized domains.");
  }
};

const signInWithProvider = async (providerName) => {
  if (!state.authEnabled || !firebaseAuth) {
    setAuthMessage("Sign-up is not ready yet. Configure Firebase in auth-config.js first.");
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
    return;
  }

  try {
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
    setAuthMessage(`Sign-in failed (${code || "unknown"}). Verify provider setup and authorized domains.`);
  }
};

elements.galleryGrid.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");

  if (!button) {
    return;
  }

  const paintingId = Number(button.dataset.id);
  const action = button.dataset.action;

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
  window.alert("Purchase recorded and saved to your account profile.");
});

elements.favFilterBtn.addEventListener("click", () => {
  state.favOnly = !state.favOnly;
  renderGallery();
});

elements.boughtFilterBtn.addEventListener("click", () => {
  state.boughtOnly = !state.boughtOnly;
  renderGallery();
});

elements.themeToggle.addEventListener("click", () => {
  const currentTheme = elements.body.dataset.theme === "night" ? "night" : "day";
  applyTheme(currentTheme === "night" ? "day" : "night");
});

elements.signoutBtn.addEventListener("click", async () => {
  if (firebaseAuth && state.currentUser.provider !== "guest") {
    await firebaseAuth.signOut();
    return;
  }

  setGuestMode("Signed out. You are in guest mode.");
});

elements.googleLogin.addEventListener("click", () => signInWithProvider("google"));
elements.appleLogin.addEventListener("click", () => signInWithProvider("apple"));
elements.facebookLogin.addEventListener("click", () => signInWithProvider("facebook"));

initTheme();
setAuthButtonsDisabled(true);
renderAll();
setAuthMessage("Initializing authentication...");
initFirebaseAuth();
