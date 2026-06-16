const tabs = [
  {
    label: "Home",
    href: "home.html",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
               </svg>`,
  },
  {
    label: "Stores",
    href: "stores.html",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
               </svg>`,
  },
  {
    label: "Cart",
    href: "live-cart.html",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
               </svg>`,
  },
];
const renderNav = () => {
  const path = window.location.pathname;
  const navHTML = tabs
    .map((tab) => {
      const isActive = path.includes(tab.href);
      return `
            <a href="${tab.href}" class="nav-tab ${isActive ? "nav-tab--active" : ""}">
                ${tab.icon}
                <span class="nav-label">${tab.label}</span>
            </a>
        `;
    })
    .join("");

  document.getElementById("nav-bar").innerHTML = `
        <nav class="bottom-nav">${navHTML}</nav>
    `;
};
renderNav();
