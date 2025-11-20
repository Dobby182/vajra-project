// search.js
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const query = params.get("query");

  const searchTitle = document.getElementById("search-title");
  const productCards = document.querySelectorAll(".product-card");

  if (searchTitle) {
    searchTitle.textContent = `Search results for: "${query}"`;
  }

  if (!query || query.trim() === "") return;

  productCards.forEach(card => {
    const name = card.querySelector(".product-name").textContent.toLowerCase();

    if (name.includes(query.toLowerCase())) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
});
