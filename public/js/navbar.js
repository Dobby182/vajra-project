// navbar.js
document.addEventListener("DOMContentLoaded", () => {
  const navbarContainer = document.getElementById("navbar-container");
  if (!navbarContainer) {
    console.warn("Navbar container not found on this page.");
    return;
  }

  navbarContainer.innerHTML = `
    <nav class="navbar">
      <div class="nav-left">
        <a href="index.html">
          <img src="images/vajralogo.png" class="logo" alt="Logo">
        </a>
      </div>

      <div class="nav-center">
        <input type="text" id="search-box" placeholder="Search products...">
        <button id="search-btn">Search</button>
      </div>

      <div class="nav-right">
        <a href="login.html">Login</a>
        <a href="register.html">Register</a>
        <a href="contact.html">Contact</a>
      </div>
    </nav>
  `;

  const searchBox = document.getElementById("search-box");
  const searchBtn = document.getElementById("search-btn");

  if (searchBtn && searchBox) {
    searchBtn.addEventListener("click", () => {
      window.location.href = `search.html?query=${encodeURIComponent(
        searchBox.value
      )}`;
    });
  }
});
