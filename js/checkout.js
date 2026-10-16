
const form = document.getElementById('checkoutForm');
const money = n => '₱' + n.toLocaleString('en-PH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const bag = (() => {
  try {
    const b = JSON.parse(localStorage.getItem('elanBag'));
    return Array.isArray(b) ? b : [];
  } catch {
    return [];
  }
})();

const productsEl = document.getElementById('checkoutItems');
const errorEl = document.getElementById('formError');

let products = [];
let ready = false;
let subtotal = 0;
let total = 0;

const discountActive = localStorage.getItem('elanDiscount') === 'true';

const localDate = d => [
  d.getFullYear(),
  String(d.getMonth() + 1).padStart(2, '0'),
  String(d.getDate()).padStart(2, '0')
].join('-');

const today = localDate(new Date());

document.getElementById('startDate').min = today;
document.getElementById('returnDate').min = today;
document.getElementById('returnDate').max = localDate(
  new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate() + 3
  )
);

// Retrieve product data for the rental summary using HTTP GET.
async function init() {
  if (!bag.length) {
    productsEl.textContent = 'Your bag is empty. Please add a dress first.';
    form.querySelector('button[type=submit]').disabled = true;
  }

  try {
    const response = await fetch('/api/products', { method: 'GET' });
    if (!response.ok) throw new Error('Products GET request failed');
    products = await response.json();
    if (!Array.isArray(products)) throw new Error('Invalid product dataset');
    ready = true;
  } catch (e) {
    errorEl.textContent = 'Unable to retrieve products. Please refresh the page.';
    form.querySelector('button[type=submit]').disabled = true;
    return;
  }

  if (!bag.length) return;

  // Display rental items using the products dataset
  for (const item of bag) {
    const product = products.find(p => p.name === item.name);

    if (
      !product ||
      product.availability !== 'Available for Rental' ||
      !product.sizes.includes(item.size)
    ) {
      errorEl.textContent =
        'An item is unavailable or has an invalid size. Please update your rental bag.';
      form.querySelector('button[type=submit]').disabled = true;
      return;
    }

    subtotal += Number(product.price);

    const row = document.createElement('div');
    row.className = 'checkout-item';

    const label = document.createElement('span');
    label.textContent = product.name;

    const size = document.createElement('small');
    size.textContent = 'Size: ' + item.size;
    label.appendChild(size);

    const price = document.createElement('span');
    price.textContent = money(Number(product.price));

    row.append(label, price);
    productsEl.appendChild(row);
  }

  const discount = discountActive ? subtotal * 0.15 : 0;
  total = subtotal - discount;

  document.getElementById('checkoutSubtotal').textContent = money(subtotal);

  document.getElementById('checkoutDiscountRow').hidden = !discountActive;

  document.getElementById('checkoutDiscount').textContent =
    '−' + money(discount);

  document.getElementById('checkoutTotal').textContent = money(total);
}

// Rental date handling
document.getElementById('startDate').addEventListener('change', e => {
  const start = e.target.value;

  if (!start) return;

  const [y, m, d] = start.split('-').map(Number);
  const latest = new Date(y, m - 1, d + 3);

  const returnInput = document.getElementById('returnDate');

  returnInput.min = start;
  returnInput.max = localDate(latest);

  if (
    !returnInput.value ||
    returnInput.value < start ||
    returnInput.value > returnInput.max
  ) {
    returnInput.value = start;
  }
});

// Restrict phone number input
document.querySelector('[name=phone]').addEventListener('input', e => {
  e.target.value = e.target.value.replace(/\D/g, '').slice(0, 11);
});

// Restrict ZIP code input
document.querySelector('[name=postalCode]').addEventListener('input', e => {
  e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
});

// Handle rental request submission
form.addEventListener('submit', async e => {
  e.preventDefault();

  if (!ready || !bag.length) return;

  errorEl.textContent = '';

  if (!validateCheckout()) return;

  const data = Object.fromEntries(new FormData(form));

  const start = new Date(data.startDate + 'T12:00:00');
  const end = new Date(data.returnDate + 'T12:00:00');

  const days = Math.round((end - start) / 86400000) + 1;

  if (days < 1 || days > 4 || data.startDate < today) {
    errorEl.textContent =
      'Please choose a rental period of 1 to 4 calendar days, starting today or later.';
    return;
  }

  if (!/^09\d{9}$/.test(data.phone.trim())) {
    errorEl.textContent =
      'Enter a valid Philippine mobile number (09XXXXXXXXX).';
    return;
  }

  if (!/^\d{4}$/.test(data.postalCode.trim())) {
    errorEl.textContent =
      'Enter a valid 4-digit Philippine ZIP code.';
    return;
  }

  let ref;

  const order = {
    reference: ref,
    customer: {
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      address: {
        street: data.street.trim(),
        barangay: data.barangay.trim(),
        city: data.city.trim(),
        province: data.province.trim(),
        postalCode: data.postalCode.trim()
      }
    },
    rental: {
      startDate: data.startDate,
      returnDate: data.returnDate
    },
    paymentMethod: data.payment,
    items: bag.map(item => ({
      name: item.name,
      size: item.size
    })),
    total,
    createdAt: new Date().toISOString(),
    status: 'Saved locally — not submitted'
  };

  try {
    const response = await fetch('/api/orders', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({customer:order.customer,rental:order.rental,paymentMethod:order.paymentMethod,items:order.items,memberDiscount:discountActive})
    });
    const saved=await response.json();
    if(!response.ok)throw Error(saved.error||'Unable to save rental request.');
    ref=saved.reference;
    total=saved.total;
    localStorage.removeItem('elanBag');
  } catch(error) {
    errorEl.textContent=error.message||'Unable to save your rental request. Please try again.';
    return;
  }

  document.getElementById('reference').textContent = ref;

  document.getElementById('confirmationDetails').textContent =
    'Rental: ' + data.startDate +
    ' to ' + data.returnDate +
    ' · Total: ' + money(total) +
    ' · Payment: ' + data.payment;

  document.querySelector('.checkout-grid').hidden = true;
  document.querySelector('.checkout-sub').hidden = true;
  document.querySelector('.checkout-back').hidden = true;

  const confirmation = document.getElementById('confirmation');

  confirmation.hidden = false;
  confirmation.focus();

  window.scrollTo(0, 0);
});

// Friendly field-level validation
const validationMessages = {
  name: 'Please enter your full name.',
  email: 'Please enter a valid email address (example: name@example.com).',
  phone: 'Please enter a valid 11-digit Philippine mobile number starting with 09.',
  street: 'Please enter your house/unit number and street address.',
  barangay: 'Please enter your barangay.',
  city: 'Please enter your city or municipality.',
  province: 'Please enter your province.',
  postalCode: 'Please enter a valid 4-digit Philippine ZIP code.',
  startDate: 'Please choose a rental start date (today or later).',
  returnDate: 'Please choose a return date within 1 to 4 days of the rental start.',
  payment: 'Please select a payment method.'
};

function getMessage(input) {
  if (input.validity.valueMissing) {
    return input.name === 'payment'
      ? validationMessages.payment
      : 'This field is required.';
  }

  if (
    input.name === 'email' &&
    (
      input.validity.typeMismatch ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim())
    )
  ) {
    return validationMessages.email;
  }

  if (
    input.name === 'phone' &&
    !/^09\d{9}$/.test(input.value.trim())
  ) {
    return validationMessages.phone;
  }

  if (
    input.name === 'postalCode' &&
    !/^\d{4}$/.test(input.value.trim())
  ) {
    return validationMessages.postalCode;
  }

  if (
    input.validity.patternMismatch ||
    input.validity.tooShort ||
    input.validity.tooLong
  ) {
    return validationMessages[input.name] || 'Please check this value.';
  }

  if (input.name === 'startDate' && input.value < today) {
    return validationMessages.startDate;
  }

  if (input.name === 'returnDate') {
    const start = form.elements.startDate.value;

    if (start && input.value) {
      const days = Math.round(
        (
          new Date(input.value + 'T12:00:00') -
          new Date(start + 'T12:00:00')
        ) / 86400000
      ) + 1;

      if (days < 1 || days > 4) {
        return validationMessages.returnDate;
      }
    }
  }

  if (!input.validity.valid) {
    return validationMessages[input.name] ||
      'Please enter valid information.';
  }

  return '';
}

function validateField(input) {
  const label = input.closest('label');

  if (!label || input.type === 'radio') {
    return !getMessage(input);
  }

  let message = label.querySelector('.field-warning');

  if (!message) {
    message = document.createElement('small');
    message.className = 'field-warning';
    message.setAttribute('role', 'alert');
    label.appendChild(message);
  }

  const error = getMessage(input);

  message.textContent = error;

  input.classList.toggle('input-invalid', Boolean(error));

  input.setAttribute('aria-invalid', error ? 'true' : 'false');

  return !error;
}

form.querySelectorAll('input:not([type=radio])').forEach(input => {
  input.addEventListener('blur', () => validateField(input));

  input.addEventListener('input', () => {
    if (input.classList.contains('input-invalid')) {
      validateField(input);
    }
  });

  input.addEventListener('change', () => validateField(input));
});

function validateCheckout() {
  let firstInvalid = null;

  form.querySelectorAll('input:not([type=radio])').forEach(input => {
    if (!validateField(input) && !firstInvalid) {
      firstInvalid = input;
    }
  });

  const payment = form.querySelector('input[name=payment]:checked');

  if (!payment) {
    errorEl.textContent = validationMessages.payment;

    if (!firstInvalid) {
      firstInvalid = form.querySelector('input[name=payment]');
    }
  } else {
    errorEl.textContent = '';
  }

  if (firstInvalid) {
    firstInvalid.focus();
    return false;
  }

  return true;
}

// Initialize checkout
init();
