const money = amount => '₱' + amount.toLocaleString('en-PH', {minimumFractionDigits:2,maximumFractionDigits:2});
const itemsElement = document.getElementById('cartItems');
const summaryElement = document.getElementById('cartSummary');
const statusElement = document.getElementById('cartStatus');
let products = [];
function getBag(){try{const value=JSON.parse(localStorage.getItem('elanBag'));return Array.isArray(value)?value:[]}catch{return []}}
function saveBag(bag){localStorage.setItem('elanBag',JSON.stringify(bag))}
function renderBag(){
  const bag=getBag();itemsElement.replaceChildren();
  if(!bag.length){statusElement.textContent='';summaryElement.hidden=true;const empty=document.createElement('div');empty.className='cart-empty';empty.textContent='Your rental bag is empty. ';const link=document.createElement('a');link.href='dresses.html';link.textContent='Browse dresses →';empty.appendChild(link);itemsElement.appendChild(empty);return}
  statusElement.textContent=bag.length+' '+(bag.length===1?'dress':'dresses')+' in your bag';summaryElement.hidden=false;
  let subtotal=0;
  bag.forEach((item,index)=>{
    const product=products.find(p=>p.name===item.name);
    const unavailable=product && product.availability !== 'Available for Rental';
    const price=Number(item.price)||0;subtotal+=price;
    const row=document.createElement('article');row.className='cart-item';
    const img=document.createElement('img');img.src=product?.image||'assets/dress1.jpg';img.alt=item.name||'Dress';row.appendChild(img);
    const details=document.createElement('div');const title=document.createElement('h2');title.textContent=item.name||'Dress';details.appendChild(title);
    const size=document.createElement('p');size.textContent='Size: '+(item.size||'Not selected');details.appendChild(size);
    const duration=document.createElement('p');duration.textContent='Rental period: '+(product?.rentalDays||4)+' days';details.appendChild(duration);
    if(unavailable){const warning=document.createElement('p');warning.textContent='Currently rented — remove this dress before checkout.';warning.style.color='#a05b4e';details.appendChild(warning)}
    const remove=document.createElement('button');remove.type='button';remove.className='cart-remove';remove.textContent='Remove';remove.addEventListener('click',()=>{const current=getBag();current.splice(index,1);saveBag(current);renderBag()});details.appendChild(remove);row.appendChild(details);
    const priceEl=document.createElement('strong');priceEl.className='cart-price';priceEl.textContent=money(price);row.appendChild(priceEl);itemsElement.appendChild(row);
  });
  const discountActive=localStorage.getItem('elanDiscount')==='true';const discount=discountActive?subtotal*.15:0;
  const blocked=bag.some(item=>{const p=products.find(p=>p.name===item.name);return !p||p.availability!=='Available for Rental'});
  document.getElementById('checkoutButton').disabled=blocked;
  if(blocked)statusElement.textContent='One or more dresses are unavailable. Remove them to continue.';
  document.getElementById('subtotal').textContent=money(subtotal);document.getElementById('discountLine').hidden=!discountActive;
  document.getElementById('discount').textContent='−'+money(discount);document.getElementById('total').textContent=money(subtotal-discount);
}
async function start(){try{const response=await fetch('/api/products',{method:'GET'});if(!response.ok)throw new Error('HTTP '+response.status);products=await response.json()}catch(error){console.warn('Could not load product images:',error)}renderBag()}
document.getElementById('checkoutButton').addEventListener('click',()=>{if(getBag().length && !document.getElementById('checkoutButton').disabled)window.location.href='checkout.html';});
start();
