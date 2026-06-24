// app.js — lógica de listagem, filtros e edição simples usando localStorage
(() => {
  const STORAGE_KEY = 'esportes_news_v1';

  const searchEl = document.getElementById('search');
  const filterSportEl = document.getElementById('filterSport');
  const newsListEl = document.getElementById('newsList');
  const modal = document.getElementById('modal');
  const modalArticle = document.getElementById('modalArticle');
  const modalClose = document.getElementById('modalClose');

  const addModal = document.getElementById('addModal');
  const openAdd = document.getElementById('openAdd');
  const addClose = document.getElementById('addClose');
  const addForm = document.getElementById('addForm');
  const addCancel = document.getElementById('addCancel');

  document.getElementById('year').textContent = new Date().getFullYear();

  // amostra de notícias iniciais
  const sample = [
    {
      id: id(),
      title: "Futebol: clássico termina em empate dramático",
      sport: "Futebol",
      excerpt: "Partida emocionante com gol nos acréscimos e virada que não aconteceu.",
      content: "<p>Em um duelo acirrado, as equipes empataram por 2 a 2. Torcedores vibraram, técnico comentou sobre estratégias e expectativa para a próxima rodada.</p>",
      image: "https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=1",
      publishedAt: new Date().toISOString()
    },
    {
      id: id(),
      title: "Basquete: sensação faz 40 pontos e lidera vitória",
      sport: "Basquete",
      excerpt: "Jogador foi decisivo e recebeu elogios do técnico após partida incrível.",
      content: "<p>Com arremessos precisos, a estrela do jogo registrou seu melhor desempenho da temporada.</p>",
      image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=2",
      publishedAt: new Date(Date.now() - 1000*60*60*24).toISOString()
    },
    {
      id: id(),
      title: "Fórmula 1: treinos mostram equilíbrio entre equipes",
      sport: "Fórmula 1",
      excerpt: "Treinos livres indicam que a disputa pelo pódio será apertada no GP.",
      content: "<p>Tempo de volta e setup das equipes estão muito próximos; expectativa de corrida disputada.</p>",
      image: "https://images.unsplash.com/photo-1519739835975-5096a3b2b9d8?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=3",
      publishedAt: new Date(Date.now() - 1000*60*60*48).toISOString()
    }
  ];

  // helpers
  function id(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7) }
  function load(){ try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || sample.slice() } catch(e){ return sample.slice() } }
  function save(data){ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) }

  // render
  function render(){
    const q = searchEl.value.trim().toLowerCase();
    const sport = filterSportEl.value;
    const data = load().slice().sort((a,b)=> new Date(b.publishedAt) - new Date(a.publishedAt));
    const filtered = data.filter(item => {
      const matchesQ = q === '' || (item.title + ' ' + item.excerpt + ' ' + (item.content || '')).toLowerCase().includes(q);
      const matchesSport = sport === 'all' || item.sport === sport;
      return matchesQ && matchesSport;
    });

    newsListEl.innerHTML = '';
    if(filtered.length === 0){
      newsListEl.innerHTML = '<p style="grid-column:1/-1;color:#5b6b74">Nenhuma notícia encontrada.</p>';
      return;
    }

    filtered.forEach(item => {
      const el = document.createElement('article');
      el.className = 'card';
      el.innerHTML = `
        <div class="thumb">${item.image ? `<img src="${item.image}" alt="${escapeHtml(item.title)}">` : `<div style="padding:14px;color:var(--muted)">Sem imagem</div>`}</div>
        <div class="body">
          <div class="meta"><span class="tag-badge">${escapeHtml(item.sport)}</span><small style="margin-left:auto">${new Date(item.publishedAt).toLocaleDateString()}</small></div>
          <h4 class="title">${escapeHtml(item.title)}</h4>
          <div class="excerpt">${escapeHtml(item.excerpt)}</div>
          <div class="card-actions">
            <button class="btn" data-id="${item.id}" data-action="read">Ler</button>
            <button class="btn ghost" data-id="${item.id}" data-action="share">Compartilhar</button>
            <button class="btn ghost" data-id="${item.id}" data-action="delete">Apagar</button>
          </div>
        </div>
      `;
      newsListEl.appendChild(el);
    });
  }

  function escapeHtml(s){ if(!s) return ''; return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])) }

  // open article
  function openArticle(id){
    const item = load().find(x=>x.id===id);
    if(!item) return;
    modalArticle.innerHTML = `
      <h2>${escapeHtml(item.title)}</h2>
      <div class="meta"><span class="tag-badge">${escapeHtml(item.sport)}</span> <small style="margin-left:8px;color:var(--muted)">${new Date(item.publishedAt).toLocaleString()}</small></div>
      ${item.image ? `<img src="${item.image}" alt="${escapeHtml(item.title)}">` : ''}
      <div class="content">${item.content || ''}</div>
    `;
    modal.setAttribute('aria-hidden','false');
  }

  function closeModal(){
    modal.setAttribute('aria-hidden','true');
  }

  // events
  searchEl.addEventListener('input', debounce(render, 250));
  filterSportEl.addEventListener('change', render);

  newsListEl.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if(!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;
    if(action === 'read') openArticle(id);
    if(action === 'share') {
      const item = load().find(x=>x.id===id);
      if(navigator.share){
        navigator.share({ title: item.title, text: item.excerpt }).catch(()=>{});
      } else {
        prompt('Compartilhar link (copie):', window.location.href + '#news-' + id);
      }
    }
    if(action === 'delete'){
      if(confirm('Apagar esta notícia?')){
        const data = load().filter(x=>x.id!==id);
        save(data);
        render();
      }
    }
  });

  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e)=> { if(e.target === modal) closeModal(); });

  // add news modal
  openAdd.addEventListener('click', ()=> addModal.setAttribute('aria-hidden','false'));
  addClose.addEventListener('click', ()=> addModal.setAttribute('aria-hidden','true'));
  addCancel.addEventListener('click', ()=> addModal.setAttribute('aria-hidden','true'));
  addModal.addEventListener('click', (e)=> { if(e.target === addModal) addModal.setAttribute('aria-hidden','true') });

  addForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const f = new FormData(addForm);
    const item = {
      id: id(),
      title: f.get('title').trim(),
      sport: f.get('sport'),
      excerpt: f.get('excerpt').trim(),
      content: f.get('content'),
      image: f.get('image').trim() || '',
      publishedAt: new Date().toISOString()
    };
    const data = load();
    data.push(item);
    save(data);
    addForm.reset();
    addModal.setAttribute('aria-hidden','true');
    render();
  });

  // utilities
  function debounce(fn, ms){
    let t;
    return (...args)=>{ clearTimeout(t); t = setTimeout(()=>fn(...args), ms) }
  }

  // inicializa (se localStorage vazio, preenche sample)
  (function init(){
    try{
      if(!localStorage.getItem(STORAGE_KEY)){
        save(sample);
      }
    }catch(e){}
    render();
  })();

})();