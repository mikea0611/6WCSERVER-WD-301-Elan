// Step 1: Open a dedicated product page from any dress card.
// Capture phase prevents the old prompt-based click handler on the home page.
document.querySelectorAll(".dress-card, .all-dress-card").forEach((card) => {
  card.setAttribute("role", "link");
  card.setAttribute("tabindex", "0");
  card.style.cursor = "pointer";
  function openProduct(event) {
    if (event.target.closest(".elan-favorite-button")) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    window.location.href = "product.html?name=" + encodeURIComponent(card.dataset.name);
  }
  card.addEventListener("click", openProduct, true);
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") openProduct(event);
  });
});
