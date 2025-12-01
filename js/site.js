// site.js - shared helpers and one-time migration for localStorage
(function () {
  // Normalize liked and cart data from older formats
  function normalizeLiked() {
    if (localStorage.getItem("migration_v2_complete")) {
      return JSON.parse(localStorage.getItem("liked")) || [];
    }

    let liked = JSON.parse(localStorage.getItem("liked")) || [];
    const legacyMap =
      JSON.parse(localStorage.getItem("productLikes_v1")) || null;

    // If legacy boolean map exists, bring those names into liked[] if marked true
    if (legacyMap) {
      for (const name in legacyMap) {
        if (legacyMap[name]) {
          const idx = liked.findIndex((i) => i.name === name);
          if (idx === -1) {
            liked.push({ name, price: 0, oldPrice: "", img: "" });
          }
        }
      }
      // remove legacy map to avoid future confusion
      localStorage.removeItem("productLikes_v1");
    }

    // Sanitize entries where price may have been concatenated with oldPrice
    liked = liked.map((item) => {
      let price = item.price ?? "";
      let oldPrice = item.oldPrice ?? "";
      price = price === null || price === undefined ? "" : price.toString();
      oldPrice =
        oldPrice === null || oldPrice === undefined ? "" : oldPrice.toString();
      if (oldPrice && price.endsWith(oldPrice)) {
        price = price.slice(0, price.length - oldPrice.length);
      }
      price = price.replace(/\D/g, "").trim();
      oldPrice = oldPrice.replace(/\D/g, "").trim();
      return { ...item, price: price ? parseInt(price, 10) : 0, oldPrice };
    });

    localStorage.setItem("liked", JSON.stringify(liked));
    return liked;
  }

  function normalizeCart() {
    if (localStorage.getItem("migration_v2_complete")) {
      return JSON.parse(localStorage.getItem("cart")) || [];
    }

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart = cart.map((item) => {
      let price = item.price ?? "";
      let oldPrice = item.oldPrice ?? "";
      price = price === null || price === undefined ? "" : price.toString();
      oldPrice =
        oldPrice === null || oldPrice === undefined ? "" : oldPrice.toString();
      if (oldPrice && price.endsWith(oldPrice)) {
        price = price.slice(0, price.length - oldPrice.length);
      }
      price = parseInt(price.replace(/\D/g, "").trim()) || 0;
      oldPrice = oldPrice
        .toString()
        .replace(/\D/g, "")
        .trim();
      // normalize image path to root-relative if needed
      let img = item.img || "";
      img = normalizeImg(img);

      // ensure ratings exists (generate default between 4.0 and 5.0)
      let ratings = item.ratings || "";
      if (!ratings) {
        const val = Math.round((4 + Math.random()) * 10) / 10; // 4.0 - 5.0
        const full = Math.floor(val);
        const stars = "★".repeat(full) + "☆".repeat(5 - full);
        ratings = `${stars} (${val}/5)`;
      }
      return { ...item, price, oldPrice, img, ratings };
    });
    localStorage.setItem("cart", JSON.stringify(cart));
    return cart;
  }

  function normalizeImg(src) {
    if (!src) return "";
    if (typeof src !== "string") return "";
    src = src.trim();
    if (
      src.startsWith("http") ||
      src.startsWith("//") ||
      src.startsWith("/")
    ) {
      return src;
    }
    while (src.startsWith("../")) src = src.slice(3);
    if (src.startsWith("./")) src = src.slice(2);
    if (!src.startsWith("/")) src = "/" + src;
    return src;
  }

  // Expose helper functions
  window.__site = window.__site || {};
  window.__site.migrate = function () {
    const liked = normalizeLiked();
    const cart = normalizeCart();
    localStorage.setItem("migration_v2_complete", "true");
    return { liked, cart };
  };

  window.__site.normalizeImg = normalizeImg;

  window.__site.getLiked = function () {
    return JSON.parse(localStorage.getItem("liked")) || [];
  };

  window.__site.isLiked = function (name) {
    const liked = window.__site.getLiked();
    return liked.findIndex((x) => x.name === name) !== -1;
  };

  window.__site.toggleLiked = function (product) {
    const name = product.name;
    let liked = window.__site.getLiked();
    const idx = liked.findIndex((x) => x.name === name);
    if (idx === -1) {
      liked.push(product);
    } else {
      liked.splice(idx, 1);
    }
    localStorage.setItem("liked", JSON.stringify(liked));
    return liked;
  };

  // Search products within a container by name / alt / text content
  window.__site.searchProducts = function (
    query,
    containerSelector = ".category-container"
  ) {
    const q = (query || "").toString().toLowerCase().trim();
    const container = document.querySelector(containerSelector);
    if (!container) return 0;
    const cards = Array.from(container.querySelectorAll(".category-card"));
    let visible = 0;
    cards.forEach((card) => {
      const name = (card.querySelector("h3")?.textContent || "").toLowerCase();
      const alt = (card.querySelector("img")?.alt || "").toLowerCase();
      const text = (card.textContent || "").toLowerCase();
      const match =
        q === "" || name.includes(q) || alt.includes(q) || text.includes(q);
      card.style.display = match ? "" : "none";
      if (match) visible++;
    });
    return visible;
  };

  // Attach like button handlers to cards in a container
  // ⭐ AUTH HELPER
  window.__site.checkAuth = function () {
    const userId = localStorage.getItem("userId");
    if (!userId || userId === "undefined" || userId === "null") {
      alert("Please login to continue");
      window.location.href = "login.html";
      return false;
    }
    return true;
  };

  window.__site.attachLikeHandlers = function (containerSelector) {
    const container = containerSelector
      ? document.querySelector(containerSelector)
      : document;
    if (!container) return;

    // Support both class names
    const cards = container.querySelectorAll(".product-card, .category-card");
    cards.forEach((card) => {
      const nameEl = card.querySelector("h3");
      // Support .price class or just p tag
      const priceEl = card.querySelector(".price") || card.querySelector("p");
      const imgEl = card.querySelector("img");
      const likeBtn = card.querySelector(".like-btn");

      if (!nameEl || !priceEl || !imgEl || !likeBtn) return;

      const name = nameEl.textContent.trim();
      const priceText = priceEl.textContent.trim();
      const img = imgEl.getAttribute("src");

      // Parse price
      let price = 0;
      let oldPrice = "";
      // Match Rs. or ₹ symbol
      const match = priceText.match(/(?:Rs\.?|₹)\s*(\d+)/);
      if (match) {
        price = parseInt(match[1], 10);
      }
      // Try to find old price (strike or span with old-price)
      const strike = priceEl.querySelector("strike") || priceEl.querySelector(".old-price");
      if (strike) {
        oldPrice = strike.textContent.trim();
      }

      const product = { name, price, oldPrice, img };

      // Set initial state
      if (window.__site.isLiked(name)) {
        likeBtn.textContent = "❤️";
      } else {
        likeBtn.textContent = "🤍";
      }

      // Click handler
      likeBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // ⭐ AUTH GUARD
        if (!window.__site.checkAuth()) return;

        const updatedLiked = window.__site.toggleLiked(product);
        if (updatedLiked.some((x) => x.name === name)) {
          likeBtn.textContent = "❤️";
        } else {
          likeBtn.textContent = "🤍";
        }
      };
    });
  };

  // ⭐ UPDATE PROFILE LINK
  window.__site.updateProfileLink = function () {
    const profileLink = document.querySelector('a[href*="login.html"], a[href*="profile.html"]');
    if (!profileLink) return;

    // Find the icon inside to make sure it's the right link (user circle or circle user)
    const icon = profileLink.querySelector(".fa-user-circle, .fa-circle-user");
    if (!icon) return;

    const userId = localStorage.getItem("userId");
    if (userId && userId !== "undefined" && userId !== "null") {
      profileLink.href = "/profile.html"; // Use absolute path
    } else {
      profileLink.href = "/login.html"; // Use absolute path
    }
  };

  // Run migration and profile update immediately
  window.__site.migrate();
  document.addEventListener("DOMContentLoaded", () => {
    window.__site.updateProfileLink();
  });
})();
