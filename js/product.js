// GET product dataset using fetch(). Serve the project via a local web server.
async function loadProduct() {
  const status = document.getElementById("loadingMessage");
  try {
    const response = await fetch("products.json", { method: "GET" });
    if (!response.ok) throw new Error("HTTP " + response.status);
    const products = await response.json();
    const name = new URLSearchParams(window.location.search).get("name");
    const product = products.find(item => item.name === name);
    if (!product) { status.textContent = "Dress not found. Please return to the collection."; return; }
    document.title = product.name + " | Élan";
    document.getElementById("productImage").src = product.image;
    document.getElementById("productImage").alt = product.name;
    document.getElementById("productName").textContent = product.name;
    document.getElementById("productPrice").textContent = "₱" + product.price.toLocaleString("en-PH") + " / " + product.rentalDays + " days";
    document.getElementById("productDescription").textContent = product.description;
    document.getElementById("productCategory").textContent = product.category || "Occasion Wear";
    document.getElementById("productAvailability").textContent = product.availability || "Ask about availability";
    const isAvailable = product.availability === "Available for Rental";
    const addButton = document.getElementById("addToBag");
    addButton.disabled = !isAvailable;
    document.getElementById("productAvailability").classList.toggle("is-rented", !isAvailable);
    if (!isAvailable) {
      addButton.textContent = "Currently Rented";
      document.getElementById("bagMessage").textContent = "This dress is currently rented and cannot be added to your Rental Bag.";
    }
    const sizeSelect = document.getElementById("dressSize");
    product.sizes.forEach(size => { const option = document.createElement("option"); option.value = size; option.textContent = size; sizeSelect.appendChild(option); });
    addButton.addEventListener("click", () => {
      if (!isAvailable) return;
      let bag;
      try { bag = JSON.parse(localStorage.getItem("elanBag")) || []; if (!Array.isArray(bag)) bag = []; }
      catch { bag = []; }
      // Compatible with the existing rental bag's name/price entries.
      if (bag.some(item => item.name === product.name)) {
        document.getElementById("bagMessage").textContent = "This dress is already in your Rental Bag. You can remove it there before adding it again.";
        return;
      }
      bag.push({ name: product.name, price: product.price, size: sizeSelect.value });
      localStorage.setItem("elanBag", JSON.stringify(bag));
      document.getElementById("bagMessage").textContent = product.name + " (" + sizeSelect.value + ") added to your Rental Bag!";
    });
    status.hidden = true;
    document.getElementById("productDetails").hidden = false;
  } catch (error) {
    status.textContent = "Could not load dresses. Run this project through a local web server (not file://).";
    console.error("Product GET failed:", error);
  }
}
loadProduct();
