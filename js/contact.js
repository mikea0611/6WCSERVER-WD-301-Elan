const contactForm = document.getElementById('elan-contact-form');
const contactStatus = document.getElementById('contact-form-status');

contactForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!contactForm.reportValidity()) return;

  const button = contactForm.querySelector('button[type="submit"]');
  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = 'SENDING...';
  contactStatus.textContent = 'Sending your inquiry...';

  const data = Object.fromEntries(new FormData(contactForm).entries());
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Unable to send your message.');
    contactStatus.textContent = 'Your inquiry has been sent successfully!';
    contactForm.reset();
  } catch (error) {
    contactStatus.textContent = error.message || 'Please try again later.';
  } finally {
    button.disabled = false;
    button.textContent = originalText;
  }
});
