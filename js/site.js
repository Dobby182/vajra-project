// site.js - shared helpers and one-time migration for localStorage
(function () {
  // Normalize liked and cart data from older formats
  function normalizeLiked() {
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
      price = price.replace(/[^0-9]/g, "").trim();
      oldPrice = oldPrice.replace(/[^0-9]/g, "").trim();
      return { ...item, price: price ? parseInt(price, 10) : 0, oldPrice };
    });

    localStorage.setItem("liked", JSON.stringify(liked));
    return liked;
  }

  function normalizeCart() {
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
      price = parseInt(price.replace(/[^0-9]/g, "").trim()) || 0;
      oldPrice = oldPrice
        .toString()
        .replace(/[^0-9]/g, "")
        .trim();
      return { ...item, price, oldPrice };
    });
    localStorage.setItem("cart", JSON.stringify(cart));
    return cart;
  }

  // Expose helper functions
  window.__site = window.__site || {};
  window.__site.migrate = function () {
    const liked = normalizeLiked();
    const cart = normalizeCart();
    return { liked, cart };
  };

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

  // Run migration immediately
  window.__site.migrate();
})();
