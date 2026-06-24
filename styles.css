// app.js — lógica simples usando localStorage
const FORM = document.getElementById('tripForm');
const PHOTO = document.getElementById('photo');
const TRIPS_LIST = document.getElementById('tripsList');
const CLEAR_ALL = document.getElementById('clearAll');

const MODAL = document.getElementById('modal');
const MODAL_IMG = document.getElementById('modalImage');
const MODAL_TEXT = document.getElementById('modalText');
const MODAL_CLOSE = document.getElementById('modalClose');

const STORAGE_KEY = 'viagens_diario_v1';

// helpers
function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,8) }
function readFileAsDataURL(file){ return new Promise((res, rej) => {
  const fr = new FileReader();
  fr.onload = ()=> res(fr.result);
  fr.onerror = ()=> rej(new Error('Erro ao ler arquivo'));
  fr.readAsDataURL(file);
});}

function loadTrips(){ try {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}catch(e){ return [] }
}
function saveTrips(trips){ localStorage.setItem(STORAGE_KEY, JSON.stringify(trips)) }

function renderTrips(){
  const trips = loadTrips();
  TRIPS_LIST.innerHTML = '';
  if(trips.length === 0){
    TRIPS_LIST.innerHTML = '<p style="grid-column:1/-1; color:var(--muted)">Nenhuma viagem registrada ainda.</p>';
    return;
  }
  trips.slice().reverse().forEach(trip => {
    const card = document.createElement('article');
    card.className = 'trip-card';
    card.innerHTML = `
      <div class="trip-image">
        ${trip.imageData ? `<img src="${trip.imageData}" alt="${escapeHtml(trip.title||trip.phrase)}"/>` : `<div style="padding:12px;color:var(--muted)">Sem foto</div>`}
      </div>
      <div class="trip-body">
        <div class="trip-title">${escapeHtml(trip.title || '—')}</div>
        <div class="trip-phrase">${escapeHtml(trip.phrase)}</div>
        <div class="trip-comment">${escapeHtml(trip.comment || '')}</div>
        <div class="card-actions">
          <button class="small-btn btn-view" data-id="${trip.id}">Ver</button>
          <button class="small-btn btn-edit" data-id="${trip.id}">Editar</button>
          <button class="small-btn btn-delete" data-id="${trip.id}">Apagar</button>
        </div>
      </div>
    `;
    TRIPS_LIST.appendChild(card);
  });
}

function escapeHtml(s){ if(!s) return ''; return String(s).replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]) }) }

// form submit
FORM.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const title = FORM.title.value.trim();
  const phrase = FORM.phrase.value.trim();
  const comment = FORM.comment.value.trim();
  const file = PHOTO.files[0];

  if(!phrase){
    alert('Por favor escreva uma frase/legenda.');
    return;
  }

  let imageData = null;
  if(file){
    try{ imageData = await readFileAsDataURL(file) }catch(err){ console.error(err); alert('Erro ao ler imagem') }
  }

  const trips = loadTrips();
  trips.push({
    id: uid(),
    title, phrase, comment, imageData,
    createdAt: new Date().toISOString()
  });
  saveTrips(trips);
  FORM.reset();
  renderTrips();
});

// clear all
CLEAR_ALL.addEventListener('click', ()=>{
  if(confirm('Apagar todas as viagens salvas localmente?')) {
    localStorage.removeItem(STORAGE_KEY);
    renderTrips();
  }
});

// delegated actions (view/edit/delete)
TRIPS_LIST.addEventListener('click', (e)=>{
  const id = e.target.dataset && e.target.dataset.id;
  if(!id) return;
  if(e.target.classList.contains('btn-view')){
    doView(id);
  } else if(e.target.classList.contains('btn-delete')){
    doDelete(id);
  } else if(e.target.classList.contains('btn-edit')){
    doEdit(id);
  }
});

function doView(id){
  const trips = loadTrips();
  const t = trips.find(x=>x.id===id);
  if(!t) return;
  if(t.imageData){
    MODAL_IMG.src = t.imageData;
  } else {
    MODAL_IMG.src = '';
  }
  MODAL_TEXT.innerHTML = `<h3 style="margin-top:0">${escapeHtml(t.title || '')}</h3>
    <p style="font-style:italic;color:var(--muted)">${escapeHtml(t.phrase)}</p>
    <p>${escapeHtml(t.comment || '')}</p>
    <small style="color:#667d86">Registrado em: ${new Date(t.createdAt).toLocaleString()}</small>`;
  MODAL.setAttribute('aria-hidden','false');
}

MODAL_CLOSE.addEventListener('click', ()=> MODAL.setAttribute('aria-hidden','true'));
MODAL.addEventListener('click', (e)=> { if(e.target === MODAL) MODAL.setAttribute('aria-hidden','true') })

function doDelete(id){
  if(!confirm('Apagar esta viagem?')) return;
  let trips = loadTrips();
  trips = trips.filter(t=>t.id !== id);
  saveTrips(trips);
  renderTrips();
}

function doEdit(id){
  const trips = loadTrips();
  const t = trips.find(x=>x.id===id);
  if(!t) return;
  // preenche formulário para edição simples: iremos apagar o item antigo e permitir salvar novo
  if(!confirm('O formulário será preenchido com os dados desta viagem para edição. Ao salvar, a entrada será atualizada. Continuar?')) return;
  FORM.title.value = t.title || '';
  FORM.phrase.value = t.phrase || '';
  FORM.comment.value = t.comment || '';
  // se houver imagem, não podemos preencher input file; avisamos o usuário
  if(t.imageData){
    alert('A imagem existente será mantida se você não escolher outra foto ao salvar.');
    // para preservar a imagem, ao salvar vamos copiar a imagem existente caso não haja novo arquivo
    // implementamos um pequeno flag no formulário
    FORM.dataset.preserveImage = t.imageData;
  } else {
    delete FORM.dataset.preserveImage;
  }
  // remove o item antigo (será substituído)
  const remaining = trips.filter(x=>x.id !== id);
  saveTrips(remaining);
  renderTrips();
}

// quando salvar e houver preserveImage e nenhum novo arquivo, usamos a imagem preservada
// para isso, interceptamos o submit handler: se dataset.preserveImage existe e não há arquivo, usamos-a.
// (o submit handler já lida assim; apenas ajustamos o logic: se não houver file, usamos preserveImage)
FORM.addEventListener('submit', function handlePreserve(e){
  // o primeiro submit já é tratado; esta listener só garante a preserveImage é usada —
  // no fluxo atual a primeira listener roda e, se não há file, imageData fica null.
  // então ajustamos o saving step: se preserveImage presente e no campo photo não há file, recuperamos preserveImage e adicionamos ao último trip salvo.
  // Implementação simples: mover esse ajuste para depois do submit original é mais complexo — em vez disso,
  // melhor leitura: monkey-patch a bit: (no nosso fluxo atual, já gravamos a nova entrada com imageData null).
  // Para simplicidade, aqui apenas limpa o flag (preserveImage) — o comportamento de "manter imagem" é tratado abaixo.
  // Nota: essa listener não impede o submit.
  setTimeout(()=>{
    if(FORM.dataset.preserveImage){
      // pega trips mais recentes; o último gravado pode ter imageData null — atualiza-o para a preserveImage
      const trips = loadTrips();
      const last = trips[trips.length - 1];
      if(last && !last.imageData){
        last.imageData = FORM.dataset.preserveImage;
        saveTrips(trips);
        delete FORM.dataset.preserveImage;
        renderTrips();
      }
    }
  }, 250);
});

// inicializa
renderTrips();