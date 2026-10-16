// Read-only demonstration of the two course-required datasets.
const addText = (parent, tag, text) => {
  const el = document.createElement(tag);
  el.textContent = String(text ?? 'N/A');
  parent.appendChild(el);
  return el;
};
async function showDataset(file, statusId, resultsId, render) {
  const status = document.getElementById(statusId);
  const results = document.getElementById(resultsId);
  try {
    const response = await fetch(file, { method: 'GET' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Unexpected dataset format');
    results.replaceChildren();
    data.forEach(item => render(results, item));
    status.textContent = `GET successful · HTTP ${response.status} · ${data.length} record(s) retrieved`;
    if (!data.length) addText(results, 'p', 'No records found.');
  } catch (error) {
    status.textContent = `Could not load ${file}: ${error.message}`;
    status.classList.add('api-error');
  }
}
showDataset('/api/products', 'productsStatus', 'productsResults', (parent, item) => {
  const record = document.createElement('article');
  record.className = 'api-record';
  if (typeof item.image === 'string' && /^assets\/[a-zA-Z0-9._/-]+$/.test(item.image)) {
    const img = document.createElement('img');
    img.src = item.image;
    img.alt = item.name || 'Dress';
    img.loading = 'lazy';
    record.appendChild(img);
  }
  addText(record, 'h3', item.name);
  addText(record, 'p', `Category: ${item.category ?? 'N/A'}`);
  addText(record, 'p', `Price: ₱${Number(item.price || 0).toLocaleString('en-PH')}`);
  addText(record, 'p', `Availability: ${item.availability ?? 'N/A'}`);
  parent.appendChild(record);
});
showDataset('/api/customers', 'customersStatus', 'customersResults', (parent, item) => {
  const record = document.createElement('article');
  record.className = 'api-record';
  addText(record, 'h3', item.name);
  addText(record, 'p', `Customer ID: ${item.id ?? 'N/A'}`);
  addText(record, 'p', `Email: ${item.email ?? 'N/A'}`);
  addText(record, 'p', `Phone: ${item.phone ?? 'N/A'}`);
  parent.appendChild(record);
});
