const PAINTING_PRICE = 25000;
const DELIVERY_CHARGE = 1200;

const STORAGE_PREFIX = "ved.art.v3";
const THEME_KEY = `${STORAGE_PREFIX}.theme`;
const SESSION_KEY = `${STORAGE_PREFIX}.session`;

const SOCIAL_CONFIG = {
  googleClientId: "",
  facebookAppId: "",
  appleClientId: "",
  appleRedirectURI: "",
  ...(window.VED_SOCIAL_CONFIG || {})
};

const GUEST_USER = {
  id: "local-guest",
  provider: "guest",
  name: "Guest Collector",
  email: ""
};

const PROVIDER_LABELS = {
  guest: "Guest",
  google: "Google",
  apple: "Apple",
  facebook: "Facebook"
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
  boughtOnly: false
};

const loadedScripts = new Map();
let facebookInitPromise = null;

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

const decodeJwtPayload = (token) => {
  try {
    const encoded = token.split(".")[1];

    if (!encoded) {
      return {};
    }

    const normalized = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return {};
  }
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
    script.src = src;
    script.id = id;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Unable to load ${src}`));
    document.head.appendChild(script);
  });

  loadedScripts.set(id, promise);
  return promise;
};

const getStorageKeyForUser = (user) => `${STORAGE_PREFIX}.profile.${user.provider}.${user.id}`;

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

const persistSession = () => {
  if (state.currentUser.provider === "guest") {
    localStorage.removeItem(SESSION_KEY);
    return;
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify(state.currentUser));
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

  const provider = PROVIDER_LABELS[state.currentUser.provider] || "Social";
  const email = state.currentUser.email ? ` | ${state.currentUser.email}` : "";
  return `${provider} profile${email}`;
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

const finalizeSocialLogin = (user) => {
  state.currentUser = {
    id: String(user.id),
    provider: user.provider,
    name: user.name || "Collector",
    email: user.email || ""
  };

  persistSession();
  loadProfileForCurrentUser();
  setAuthMessage(`Welcome ${state.currentUser.name}. Your Ved collection memory is active.`);
  renderAll();
};

const runFallbackProfileLogin = (provider) => {
  const providerName = PROVIDER_LABELS[provider] || "Social";
  const name = window.prompt(`Enter your name for ${providerName} profile mode:`);

  if (!name) {
    return;
  }

  const email = window.prompt(`Enter your email for ${providerName} profile mode (optional):`) || "";
  const stableIdSeed = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const stableId = stableIdSeed ? `${provider}-${stableIdSeed}` : `${provider}-${Date.now()}`;

  finalizeSocialLogin({
    id: stableId,
    provider,
    name: name.trim(),
    email: email.trim()
  });

  setAuthMessage(`${providerName} OAuth key not configured, so local profile mode is running.`);
};

const loginWithGoogle = async () => {
  if (!SOCIAL_CONFIG.googleClientId) {
    runFallbackProfileLogin("google");
    return;
  }

  try {
    await loadScriptOnce("google-identity-sdk", "https://accounts.google.com/gsi/client");

    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
      throw new Error("Google SDK unavailable");
    }

    const accessToken = await new Promise((resolve, reject) => {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: SOCIAL_CONFIG.googleClientId,
        scope: "openid profile email",
        callback: (response) => {
          if (response.error || !response.access_token) {
            reject(new Error(response.error || "Google authentication failed"));
            return;
          }

          resolve(response.access_token);
        }
      });

      client.requestAccessToken({ prompt: "consent" });
    });

    const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!profileResponse.ok) {
      throw new Error("Unable to fetch Google profile");
    }

    const profile = await profileResponse.json();

    finalizeSocialLogin({
      id: profile.sub || profile.email || `google-${Date.now()}`,
      provider: "google",
      name: profile.name || "Google Collector",
      email: profile.email || ""
    });
  } catch (error) {
    console.error(error);
    runFallbackProfileLogin("google");
  }
};

const ensureFacebookSdk = async () => {
  if (facebookInitPromise) {
    return facebookInitPromise;
  }

  facebookInitPromise = new Promise(async (resolve, reject) => {
    if (!SOCIAL_CONFIG.facebookAppId) {
      reject(new Error("Facebook App ID missing"));
      return;
    }

    try {
      await loadScriptOnce("facebook-jssdk", "https://connect.facebook.net/en_US/sdk.js");
    } catch (error) {
      reject(error);
      return;
    }

    const tryInit = () => {
      if (!window.FB || !window.FB.init) {
        reject(new Error("Facebook SDK unavailable"));
        return;
      }

      window.FB.init({
        appId: SOCIAL_CONFIG.facebookAppId,
        cookie: true,
        xfbml: false,
        version: "v20.0"
      });

      resolve();
    };

    setTimeout(tryInit, 150);
  });

  return facebookInitPromise;
};

const loginWithFacebook = async () => {
  if (!SOCIAL_CONFIG.facebookAppId) {
    runFallbackProfileLogin("facebook");
    return;
  }

  try {
    await ensureFacebookSdk();

    await new Promise((resolve, reject) => {
      window.FB.login(
        (response) => {
          if (!response || !response.authResponse) {
            reject(new Error("Facebook login cancelled"));
            return;
          }

          resolve();
        },
        { scope: "public_profile,email" }
      );
    });

    const profile = await new Promise((resolve, reject) => {
      window.FB.api("/me", { fields: "id,name,email" }, (response) => {
        if (!response || response.error) {
          reject(new Error("Unable to fetch Facebook profile"));
          return;
        }

        resolve(response);
      });
    });

    finalizeSocialLogin({
      id: profile.id || `facebook-${Date.now()}`,
      provider: "facebook",
      name: profile.name || "Facebook Collector",
      email: profile.email || ""
    });
  } catch (error) {
    console.error(error);
    runFallbackProfileLogin("facebook");
  }
};

const loginWithApple = async () => {
  if (!SOCIAL_CONFIG.appleClientId || !SOCIAL_CONFIG.appleRedirectURI) {
    runFallbackProfileLogin("apple");
    return;
  }

  try {
    await loadScriptOnce(
      "apple-id-sdk",
      "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"
    );

    if (!window.AppleID || !window.AppleID.auth) {
      throw new Error("Apple SDK unavailable");
    }

    window.AppleID.auth.init({
      clientId: SOCIAL_CONFIG.appleClientId,
      scope: "name email",
      redirectURI: SOCIAL_CONFIG.appleRedirectURI,
      usePopup: true
    });

    const response = await window.AppleID.auth.signIn();
    const tokenPayload = decodeJwtPayload(response.authorization?.id_token || "");
    const firstName = response.user?.name?.firstName || "";
    const lastName = response.user?.name?.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim();

    finalizeSocialLogin({
      id: tokenPayload.sub || `apple-${Date.now()}`,
      provider: "apple",
      name: fullName || tokenPayload.name || "Apple Collector",
      email: tokenPayload.email || ""
    });
  } catch (error) {
    console.error(error);
    runFallbackProfileLogin("apple");
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
  window.alert("Purchase recorded. Bought paintings were saved to your profile.");
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
  const nextTheme = currentTheme === "night" ? "day" : "night";
  applyTheme(nextTheme);
});

elements.signoutBtn.addEventListener("click", () => {
  state.currentUser = { ...GUEST_USER };
  persistSession();
  loadProfileForCurrentUser();
  setAuthMessage("Signed out. You are in guest mode.");
  renderAll();
});

elements.googleLogin.addEventListener("click", loginWithGoogle);
elements.facebookLogin.addEventListener("click", loginWithFacebook);
elements.appleLogin.addEventListener("click", loginWithApple);

const initSession = () => {
  const savedSession = parseJson(localStorage.getItem(SESSION_KEY), null);

  if (
    savedSession &&
    typeof savedSession === "object" &&
    savedSession.id &&
    savedSession.provider &&
    savedSession.name
  ) {
    state.currentUser = {
      id: String(savedSession.id),
      provider: String(savedSession.provider),
      name: String(savedSession.name),
      email: typeof savedSession.email === "string" ? savedSession.email : ""
    };
  } else {
    state.currentUser = { ...GUEST_USER };
  }

  loadProfileForCurrentUser();
};

initTheme();
initSession();
setAuthMessage("Sign in with Google, Apple, or Facebook to personalize Ved's collection memory.");
renderAll();
