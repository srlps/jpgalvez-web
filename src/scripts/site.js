// Únicos comportamientos del tema original que el sitio realmente usa (antes jQuery + main.js).
const sticky = document.getElementById("masthead-sticky");
const gotoTop = document.querySelector(".goto-top");
const mobileNav = document.getElementById("site-navigator-mobile");
const largeScreen = window.matchMedia("(min-width: 992px)");

function onScroll() {
  const y = window.scrollY;
  sticky.classList.toggle("active", largeScreen.matches && y > 100);
  gotoTop.classList.toggle("active", y > 600);
}

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

mobileNav.querySelector(".navigator-toggle").addEventListener("click", (event) => {
  event.preventDefault();
  mobileNav.classList.toggle("active");
});

gotoTop.addEventListener("click", (event) => {
  event.preventDefault();
  window.scrollTo({ top: 0, behavior: "smooth" });
});
