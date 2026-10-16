// Élan favorites and live catalog search.
(() => {
 const key='elanFavorites';
 const read=()=>{try{const x=JSON.parse(localStorage.getItem(key));return Array.isArray(x)?x:[]}catch{return []}};
 const heart='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.8a5.5 5.5 0 0 0-7.8 0L12 5.9l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.4a5.5 5.5 0 0 0 0-7.8Z"/></svg>';
 function notify(message){let t=document.getElementById('elanFavoriteToast');if(!t){t=document.createElement('div');t.id='elanFavoriteToast';t.setAttribute('role','status');t.setAttribute('aria-live','polite');document.body.appendChild(t)}t.textContent=message;t.classList.add('visible');clearTimeout(window.elanToastTimer);window.elanToastTimer=setTimeout(()=>t.classList.remove('visible'),3000)}
 function refresh(){const list=read();document.querySelectorAll('.elan-favorite-button').forEach(b=>{const selected=list.some(x=>x.name===b.dataset.name);b.classList.toggle('is-favorite',selected);b.setAttribute('aria-pressed',String(selected));b.setAttribute('aria-label',(selected?'Remove ':'Add ')+b.dataset.name+(selected?' from':' to')+' favorites');b.title=selected?'Remove from favorites':'Add to favorites'})}
 document.querySelectorAll('.dress-card,.all-dress-card').forEach(card=>{
  const image=card.querySelector('.dress-image,.all-dress-image');if(!image)return;
  let b=image.querySelector('.elan-favorite-button');if(!b){b=document.createElement('button');b.type='button';b.className='elan-favorite-button';b.innerHTML=heart;image.appendChild(b)}
  b.dataset.name=card.dataset.name;
  b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();const list=read(),idx=list.findIndex(x=>x.name===b.dataset.name);if(idx>=0){list.splice(idx,1);notify(b.dataset.name+' removed from favorites.')}else{list.push({name:b.dataset.name,price:Number(card.dataset.price)||0});notify(b.dataset.name+' added to favorites! View it using the heart in the header.')}localStorage.setItem(key,JSON.stringify(list));refresh()},true);
  b.addEventListener('keydown',e=>e.stopPropagation());
 });
 refresh();
 const input=document.getElementById('dressSearchInput'),button=document.getElementById('dressSearchButton'),cards=[...document.querySelectorAll('.all-dress-card')];
 if(input&&cards.length){const count=document.getElementById('dressCount'),status=document.getElementById('dressSearchStatus');const filter=()=>{const q=input.value.trim().toLocaleLowerCase();let n=0;cards.forEach(c=>{const match=c.dataset.name.toLocaleLowerCase().includes(q);c.hidden=!match;if(match)n++});if(count)count.textContent=n+' '+(n===1?'item':'items');if(status)status.textContent=n?'':'No dresses found. Try another name.'};input.addEventListener('input',filter);button?.addEventListener('click',e=>{e.preventDefault();filter();input.focus()});filter()}
})();
