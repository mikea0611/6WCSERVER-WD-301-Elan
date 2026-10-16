
// Load dress categories and availability from MongoDB Atlas
// through the ÉLAN Express API.
(async () => {
  const cards = document.querySelectorAll(".all-dress-card");
  if (!cards.length) return;

  try {
    const response = await fetch("/api/products", {
      method: "GET"
    });

    if (!response.ok) {
      throw new Error("HTTP " + response.status);
    }

    const products = await response.json();

    for (const card of cards) {
      const product = products.find(
        p => p.name === card.dataset.name
      );

      const info = card.querySelector(".all-dress-info");

      if (!product || !info) continue;

      // Prevent duplicate metadata if the script runs again.
      info.querySelector(".elan-dress-meta")?.remove();

      const meta = document.createElement("div");
      meta.className = "elan-dress-meta";

      const category = document.createElement("span");
      category.className = "elan-dress-category";
      category.textContent =
        product.category || "Occasion Wear";

      const availability = document.createElement("span");
      availability.className = "elan-dress-availability";
      availability.textContent =
        product.availability || "Ask about availability";

      if (product.availability !== "Available for Rental") {
        availability.classList.add("is-rented");
        card.classList.add("elan-rented-card");
      } else {
        card.classList.remove("elan-rented-card");
      }

      meta.append(category, availability);
      info.appendChild(meta);
    }

    console.log("ÉLAN dress metadata loaded from MongoDB API.");

  } catch (error) {
    console.warn("Dress metadata could not be loaded:", error);
  }
})();
