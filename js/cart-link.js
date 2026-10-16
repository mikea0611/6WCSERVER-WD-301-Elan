// Replaces the old bag alert with a link to the dedicated rental bag page.
const bagIcon = document.getElementById('bagIcon');
if (bagIcon) {
  bagIcon.setAttribute('role','link');
  bagIcon.setAttribute('tabindex','0');
  bagIcon.setAttribute('aria-label','Open rental bag');
  bagIcon.addEventListener('click', event => {event.stopImmediatePropagation();window.location.href='cart.html'}, true);
  bagIcon.addEventListener('keydown', event => {if(event.key==='Enter'||event.key===' '){event.preventDefault();window.location.href='cart.html'}});
}
