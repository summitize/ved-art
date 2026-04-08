const PAINTING_PRICE = 25000;
const DELIVERY_FEE = 1200;

const paintingData = [
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

const paintings = paintingData.map((painting, index) => ({
  id: index + 1,
  price: PAINTING_PRICE,
  ...painting
}));

const galleryGrid = document.getElementById("gallery-grid");
const favFilterBtn = document.getElementById("fav-filter-btn");
const cartItemsNode = document.getElementById("cart-items");
const cartEmptyNode = document.getElementById("cart-empty");
const cartCountNode = document.getElementById("cart-count");
const cartSubtotalNode = document.getElementById("cart-subtotal");
const cartDeliveryNode = document.getElementById("cart-delivery");
const cartTotalNode = document.getElementById("cart-total");
const favCountNode = document.getElementById("fav-count");
const checkoutBtn = document.getElementById("checkout-btn");
const yearNode = document.getElementById("year");

const favourites = new Set();
const cart = new Map();
let favouritesOnly = false;

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);

const findPainting = (id) => paintings.find((painting) => painting.id === id);

const getVisiblePaintings = () => {
  if (!favouritesOnly) {
    return paintings;
  }

  return paintings.filter((painting) => favourites.has(painting.id));
};

const createCardMarkup = (painting, index) => {
  const delay = index * 45;
  const number = String(painting.id).padStart(2, "0");
  const isFavourite = favourites.has(painting.id);
  const quantityInCart = cart.get(painting.id) || 0;

  return `
    <article class="art-card" style="animation-delay:${delay}ms">
      <div class="art-frame" data-missing="false">
        <img
          src="${painting.file}"
          alt="${painting.title} by Ved Sumeet Bub"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div class="art-body">
        <h3>${number}. ${painting.title}</h3>
        <div class="art-meta">
          <p>${painting.mood}</p>
          <p class="art-price">${formatCurrency(painting.price)}</p>
        </div>
        <div class="art-actions">
          <button class="fav-btn ${isFavourite ? "is-active" : ""}" type="button" data-action="toggle-favourite" data-id="${painting.id}">
            ${isFavourite ? "Favourited" : "Add Favourite"}
          </button>
          <button class="cart-add-btn" type="button" data-action="add-to-cart" data-id="${painting.id}">
            ${quantityInCart > 0 ? `Add More (${quantityInCart})` : "Add to Cart"}
          </button>
        </div>
      </div>
    </article>
  `;
};

const attachImageFallback = () => {
  const images = galleryGrid.querySelectorAll(".art-frame img");

  for (const image of images) {
    image.addEventListener(
      "error",
      () => {
        const frame = image.closest(".art-frame");

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
    galleryGrid.innerHTML = `
      <div class="empty-gallery">
        No favourites selected yet. Add paintings to favourites and switch this filter on.
      </div>
    `;
  } else {
    galleryGrid.innerHTML = visiblePaintings.map(createCardMarkup).join("");
    attachImageFallback();
  }

  favFilterBtn.textContent = `Show Favourites Only: ${favouritesOnly ? "On" : "Off"}`;
};

const renderCart = () => {
  const cartEntries = [...cart.entries()];
  const totalQuantity = cartEntries.reduce((sum, [, quantity]) => sum + quantity, 0);
  const subtotal = cartEntries.reduce((sum, [id, quantity]) => {
    const painting = findPainting(id);
    return sum + (painting ? painting.price * quantity : 0);
  }, 0);
  const delivery = totalQuantity > 0 ? DELIVERY_FEE : 0;
  const total = subtotal + delivery;

  cartCountNode.textContent = String(totalQuantity);
  cartSubtotalNode.textContent = formatCurrency(subtotal);
  cartDeliveryNode.textContent = formatCurrency(delivery);
  cartTotalNode.textContent = formatCurrency(total);
  favCountNode.textContent = String(favourites.size);

  checkoutBtn.disabled = totalQuantity === 0;

  if (cartEntries.length === 0) {
    cartItemsNode.innerHTML = "";
    cartEmptyNode.hidden = false;
    return;
  }

  cartEmptyNode.hidden = true;
  cartItemsNode.innerHTML = cartEntries
    .map(([id, quantity]) => {
      const painting = findPainting(id);

      if (!painting) {
        return "";
      }

      return `
        <li class="cart-item">
          <div class="cart-item-head">
            <div>
              <p class="cart-item-title">${painting.title}</p>
              <p class="cart-item-price">${formatCurrency(painting.price)} each</p>
            </div>
            <strong>${formatCurrency(painting.price * quantity)}</strong>
          </div>
          <div class="cart-qty-row">
            <button class="qty-btn" type="button" data-cart-action="decrease" data-id="${painting.id}">-</button>
            <span class="qty-label">Qty ${quantity}</span>
            <button class="qty-btn" type="button" data-cart-action="increase" data-id="${painting.id}">+</button>
            <button class="remove-btn" type="button" data-cart-action="remove" data-id="${painting.id}">Remove</button>
          </div>
        </li>
      `;
    })
    .join("");
};

galleryGrid.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");

  if (!button) {
    return;
  }

  const paintingId = Number(button.dataset.id);
  const action = button.dataset.action;

  if (!paintingId || !action) {
    return;
  }

  if (action === "toggle-favourite") {
    if (favourites.has(paintingId)) {
      favourites.delete(paintingId);
    } else {
      favourites.add(paintingId);
    }
  }

  if (action === "add-to-cart") {
    const currentQty = cart.get(paintingId) || 0;
    cart.set(paintingId, currentQty + 1);
  }

  renderGallery();
  renderCart();
});

cartItemsNode.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-cart-action]");

  if (!button) {
    return;
  }

  const paintingId = Number(button.dataset.id);
  const cartAction = button.dataset.cartAction;
  const currentQty = cart.get(paintingId) || 0;

  if (!paintingId || !cartAction || currentQty === 0) {
    return;
  }

  if (cartAction === "increase") {
    cart.set(paintingId, currentQty + 1);
  }

  if (cartAction === "decrease") {
    if (currentQty <= 1) {
      cart.delete(paintingId);
    } else {
      cart.set(paintingId, currentQty - 1);
    }
  }

  if (cartAction === "remove") {
    cart.delete(paintingId);
  }

  renderGallery();
  renderCart();
});

favFilterBtn.addEventListener("click", () => {
  favouritesOnly = !favouritesOnly;
  renderGallery();
});

checkoutBtn.addEventListener("click", () => {
  if (cart.size === 0) {
    return;
  }

  window.alert("Thanks for choosing Ved's paintings. Checkout flow can be connected next.");
});

yearNode.textContent = new Date().getFullYear();
renderGallery();
renderCart();
