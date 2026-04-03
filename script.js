document.addEventListener('DOMContentLoaded', () => {

    const params = new URLSearchParams(window.location.search);
    const slug = params.get('loja');
    const idProduto = params.get('id');

    if (!slug) { console.error("Nenhuma loja especificada na URL."); return; }
    const CHAVE_CARRINHO = `carrinho_saas_${slug}`;

    const dynamicStyles = document.createElement('style');
    dynamicStyles.innerHTML = `
        .btn-primary, .btn-checkout, .btn-buy-gradient, #main-add-btn, .sticky-add-btn { background: var(--btn-gradient, var(--accent-color)) !important; color: var(--text-on-accent, #ffffff) !important; border: none !important; box-shadow: 0 4px 15px rgba(0,0,0,0.2) !important; transition: all 0.3s ease !important; text-transform: uppercase; font-weight: 800; }
        .btn-primary:hover, .btn-checkout:hover, #main-add-btn:hover, .sticky-add-btn:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 25px rgba(0,0,0,0.3) !important; filter: brightness(1.1); }
        #cart-counter, .cart-counter, .size-btn.active, .newsletter-form button { background-color: var(--accent-color) !important; color: var(--text-on-accent, #ffffff) !important; }
        .size-btn.active { border-color: var(--accent-color) !important; }
        .btn-outline:hover { background-color: var(--accent-color) !important; color: var(--text-on-accent, #ffffff) !important; border-color: var(--accent-color) !important; }
        .toast i { color: var(--text-primary) !important; }
        .filter-pill.active, .filter-pill:hover { background-color: var(--accent-color) !important; color: var(--text-on-accent, #ffffff) !important; border-color: var(--accent-color) !important; }
        #cart-sidebar { display: flex; flex-direction: column; } #cart-items-container { flex: 1; overflow-y: auto; padding-bottom: 20px; }
        .cart-footer { padding: 20px; background: var(--bg-main, #050505); border-top: 1px solid var(--glass-border); position: sticky; bottom: 0; z-index: 10; }
        .btn-checkout { width: 100%; padding: 1.2rem !important; font-size: 1.1rem !important; font-weight: 800 !important; border-radius: 12px !important; margin-top: 10px; display: flex; justify-content: center; align-items: center; gap: 10px; cursor: pointer; }
    `;
    document.head.appendChild(dynamicStyles);

    window.scrollToSection = function(event, id) {
        document.querySelectorAll('.filter-pill').forEach(btn => btn.classList.remove('active'));
        if(event && event.target) event.target.classList.add('active');
        const element = document.getElementById(id);
        if (element) { const headerOffset = 100; window.scrollTo({ top: element.getBoundingClientRect().top + window.pageYOffset - headerOffset, behavior: "smooth" }); }
    };

    const themeToggleBtn = document.getElementById('theme-toggle'); const themeIcon = document.getElementById('theme-icon'); const htmlElement = document.documentElement;
    const CHAVE_TEMA = `tema_saas_${slug}`; const savedTheme = localStorage.getItem(CHAVE_TEMA);
    if (savedTheme) { htmlElement.setAttribute('data-theme', savedTheme); updateThemeIcon(savedTheme); }
    if (themeToggleBtn) { themeToggleBtn.addEventListener('click', () => { const newTheme = htmlElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'; htmlElement.setAttribute('data-theme', newTheme); localStorage.setItem(CHAVE_TEMA, newTheme); updateThemeIcon(newTheme); }); }
    function updateThemeIcon(theme) { if (themeIcon) { themeIcon.classList.remove('fa-sun', 'fa-moon'); themeIcon.classList.add(theme === 'light' ? 'fa-moon' : 'fa-sun'); } }

    const mobileMenu = document.getElementById('mobile-menu');
    document.getElementById('open-menu')?.addEventListener('click', () => mobileMenu?.classList.add('active')); document.getElementById('close-menu')?.addEventListener('click', () => mobileMenu?.classList.remove('active'));

    const cartSidebar = document.getElementById('cart-sidebar'); const cartOverlay = document.getElementById('cart-overlay');
    function toggleCart(show) { if (show) { cartSidebar?.classList.add('active'); cartOverlay?.classList.add('active'); } else { cartSidebar?.classList.remove('active'); cartOverlay?.classList.remove('active'); } }
    document.getElementById('open-cart')?.addEventListener('click', () => toggleCart(true)); document.getElementById('close-cart')?.addEventListener('click', () => toggleCart(false)); cartOverlay?.addEventListener('click', () => toggleCart(false));

    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('navbar');
        if(navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });

    let carrinho = JSON.parse(localStorage.getItem(CHAVE_CARRINHO)) || [];
    window.atualizarCarrinho = function() {
        const container = document.getElementById('cart-items-container'); const counter = document.getElementById('cart-counter'); const totalEl = document.getElementById('cart-total-price');
        if (!container || !counter || !totalEl) return;
        if (carrinho.length === 0) { container.innerHTML = '<p class="empty-msg" style="text-align:center; color: var(--text-muted); padding: 30px 10px;">O teu carrinho está vazio.</p>'; counter.textContent = '0'; totalEl.textContent = 'R$ 0,00'; localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho)); return; }
        container.innerHTML = ''; let total = 0; let qtdTotal = 0;
        carrinho.forEach((item, index) => {
            total += (item.preco * item.quantidade); qtdTotal += item.quantidade;
            container.innerHTML += `<div class="cart-item-row glass-light" style="margin-bottom: 12px; padding: 12px; border-radius: 12px; border: 1px solid var(--glass-border); display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.02);"><div style="flex: 1;"><h4 style="font-size: 0.95rem; margin-bottom: 5px; color: var(--text-primary);">${item.nome}</h4><div class="cart-item-price" style="color: var(--accent-color); font-weight: bold;">R$ ${parseFloat(item.preco).toFixed(2).replace('.', ',')}</div></div><div style="display: flex; align-items: center; gap: 12px;"><div style="display: flex; align-items: center; background: rgba(0,0,0,0.3); border-radius: 8px; border: 1px solid var(--glass-border);"><button onclick="alterarQuantidade(${index}, -1)" style="background: none; border: none; color: var(--text-primary); padding: 5px 12px; cursor: pointer; font-size: 1.1rem;">-</button><span style="font-size: 0.95rem; width: 24px; text-align: center; color: var(--text-primary); font-weight: bold;">${item.quantidade}</span><button onclick="alterarQuantidade(${index}, 1)" style="background: none; border: none; color: var(--text-primary); padding: 5px 12px; cursor: pointer; font-size: 1.1rem;">+</button></div><button class="icon-btn remove-item" onclick="removerDoCarrinho(${index})" style="color:#ef4444; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); padding: 8px; border-radius: 8px; cursor:pointer; display: flex; align-items: center; justify-content: center;"><i class="fas fa-trash"></i></button></div></div>`;
        });
        counter.textContent = qtdTotal; totalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`; localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));
    };
    window.alterarQuantidade = function(index, delta) { if(carrinho[index]) { carrinho[index].quantidade += delta; if (carrinho[index].quantidade <= 0) carrinho.splice(index, 1); atualizarCarrinho(); } };
    window.removerDoCarrinho = function(index) { carrinho.splice(index, 1); atualizarCarrinho(); };
    atualizarCarrinho();

    window.mostrarToast = function(mensagem) {
        let container = document.getElementById('toast-container');
        if (!container) { container = document.createElement('div'); container.id = 'toast-container'; document.body.appendChild(container); }
        const toast = document.createElement('div'); toast.className = 'toast'; toast.innerHTML = `<i class="fas fa-check-circle" style="color: var(--accent-color);"></i> <span>${mensagem}</span>`;
        container.appendChild(toast); setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(100%)'; setTimeout(() => toast.remove(), 300); }, 3000);
    }

    document.addEventListener('click', (e) => {
        const btnAdd = e.target.closest('.btn-add-cart');
        if (btnAdd) {
            e.preventDefault(); 
            let nome = btnAdd.getAttribute('data-name'); 
            const preco = parseFloat(btnAdd.getAttribute('data-price'));
            
            const btnTamanhoAtivo = document.querySelector('.size-btn.active');
            if (btnTamanhoAtivo && document.getElementById('size-options-container')?.style.display !== 'none') {
                nome = `${nome} (Tam: ${btnTamanhoAtivo.innerText})`;
            }

            if (!nome || isNaN(preco)) return;
            const originalHtml = btnAdd.innerHTML; btnAdd.innerHTML = '<i class="fas fa-spinner fa-spin"></i> A processar...'; btnAdd.style.pointerEvents = 'none';
            setTimeout(() => {
                const existente = carrinho.find(i => i.nome === nome);
                if (existente) existente.quantidade += 1; else carrinho.push({ nome, preco, quantidade: 1 });
                atualizarCarrinho(); btnAdd.innerHTML = originalHtml; btnAdd.style.pointerEvents = 'auto'; mostrarToast(`<b>${nome}</b> adicionado!`);
                const cartCounter = document.getElementById('cart-counter'); if(cartCounter) { cartCounter.style.transform = 'scale(1.5)'; setTimeout(() => cartCounter.style.transform = 'scale(1)', 300); }
            }, 500);
        }
    });

    window.fecharModal = function() { const modal = document.getElementById('glass-modal'); if(modal) { modal.classList.remove('active'); setTimeout(() => modal.style.display = 'none', 400); } }
    
    function initSizeButtons() {
        const sizeBtns = document.querySelectorAll('.size-btn'); 
        sizeBtns.forEach(btn => { 
            btn.addEventListener('click', function() { 
                sizeBtns.forEach(b => b.classList.remove('active')); 
                this.classList.add('active'); 
            }); 
        });
    }
    initSizeButtons();

    const cepInput = document.getElementById('cep-input'); if(cepInput) { cepInput.addEventListener('input', function(e) { let value = e.target.value.replace(/\D/g, ""); if (value.length > 5) value = value.replace(/^(\d{5})(\d)/, "$1-$2"); e.target.value = value.substring(0, 9); }); }

    window.changeImage = function(thumbElement, imageUrl, index) {
        const carousel = document.getElementById('main-carousel');
        if (carousel && index !== undefined) {
            const slide = document.getElementById(`slide-${index}`);
            if (slide) carousel.scrollTo({ left: slide.offsetLeft, behavior: 'smooth' });
        }
        document.querySelectorAll('.thumb-img').forEach(el => el.classList.remove('active')); 
        if (thumbElement) thumbElement.classList.add('active');
    };

    function injetarSEODinamico(produto, lojaNome) {
        const metas = [ { property: 'og:title', content: `${produto.nome} | ${lojaNome}` }, { property: 'og:description', content: produto.descricao ? produto.descricao.substring(0, 150) + '...' : `Compre ${produto.nome} na ${lojaNome}.` }, { property: 'og:image', content: produto.imagem_url }, { property: 'og:type', content: 'product' } ];
        metas.forEach(metaData => { let meta = document.createElement('meta'); Object.keys(metaData).forEach(key => meta.setAttribute(key, metaData[key])); document.head.appendChild(meta); });
    }

    function getContrastYIQ(hexcolor) {
        if (!hexcolor) return '#ffffff'; hexcolor = hexcolor.replace("#", "");
        var r = parseInt(hexcolor.substr(0,2),16); var g = parseInt(hexcolor.substr(2,2),16); var b = parseInt(hexcolor.substr(4,2),16);
        return (((r*299)+(g*587)+(b*114))/1000 >= 128) ? '#000000' : '#ffffff';
    }

    // Função auxiliar para transformar HEX em RGBA e usar nas luzes de fundo
    function hexToRgba(hex, alpha) {
        if (!hex) return `rgba(255,255,255,${alpha})`;
        hex = hex.replace("#", "");
        if(hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
        let r = parseInt(hex.substring(0,2), 16),
            g = parseInt(hex.substring(2,4), 16),
            b = parseInt(hex.substring(4,6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    function liberarTela() {
        const antiPiscar = document.getElementById('anti-piscar');
        if(antiPiscar) antiPiscar.remove();
        document.body.style.opacity = '1';
        document.body.style.pointerEvents = 'auto';
    }

    const SUPABASE_URL = 'https://ikkjgtgvohrwurtiustm.supabase.co'; 
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlra2pndGd2b2hyd3VydGl1c3RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NzE4OTEsImV4cCI6MjA5MDE0Nzg5MX0.HNrSvCmSHWTe2yoQy27GOq5g_ZoZxFdox_eCW14f_nI';
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    async function init() {
        const { data: loja } = await supabase.from('lojas').select('*').eq('slug', slug).single();
        
        if (loja) {
            if (loja.ativo === false) {
                document.body.innerHTML = `<div style="height: 100vh; width: 100vw; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: #050505; color: #ffffff; font-family: 'Poppins', sans-serif; text-align: center; padding: 20px; position: fixed; top: 0; left: 0; z-index: 999999;"><i class="fas fa-store-slash" style="font-size: 5rem; color: #ef4444; margin-bottom: 1.5rem;"></i><h1 style="font-size: 2.5rem; margin-bottom: 1rem; font-weight: 700;">Loja Indisponível</h1><p style="color: #a0a0a0; font-size: 1.1rem; max-width: 500px; line-height: 1.6;">Esta loja encontra-se temporariamente suspensa. Tente novamente mais tarde.</p></div>`;
                liberarTela(); return; 
            }

            document.title = loja.nome_loja; 
            window.lojaNomeTexto = loja.nome_loja; 
            window.lojaTextosAtuais = {}; 
            
            if (loja.cor_principal) {
                const accent = loja.cor_principal; localStorage.setItem('theme_color_' + slug, accent); 
                
                let corSecundaria = '#1a1c23';
                let textColor = getContrastYIQ(accent);

                if (loja.textos) {
                    const t = typeof loja.textos === 'string' ? JSON.parse(loja.textos) : loja.textos;
                    if (t.corSecundaria) corSecundaria = t.corSecundaria;
                    if (t.corTextoBotao && t.corTextoBotao !== 'auto') {
                        textColor = t.corTextoBotao;
                    }
                }
                
                document.documentElement.style.setProperty('--accent-color', accent); 
                document.documentElement.style.setProperty('--text-on-accent', textColor); 
                document.documentElement.style.setProperty('--btn-gradient', `linear-gradient(135deg, ${accent} 0%, ${corSecundaria} 100%)`);
                document.documentElement.style.setProperty('--brand-gradient', `linear-gradient(135deg, ${accent} 0%, ${corSecundaria} 100%)`);
                
                document.documentElement.style.setProperty('--blob-color-1', hexToRgba(accent, 0.15));
                document.documentElement.style.setProperty('--blob-color-2', hexToRgba(corSecundaria, 0.15));
            }

            const nomesLojaEl = [document.getElementById('nome-loja'), document.getElementById('footer-nome-loja')];
            let logoHtml = `${loja.nome_loja}`; 

            if (loja.textos) {
                const t = typeof loja.textos === 'string' ? JSON.parse(loja.textos) : loja.textos;
                window.lojaTextosAtuais = t; 
                
                if (t.logoUrl && t.logoUrl.trim() !== '') {
                    if (t.logoStyle === 'theme') {
                        logoHtml = `<span class="brand-logo-wrapper"><img src="${t.logoUrl}" alt="${loja.nome_loja}" class="brand-logo-img theme-colored"></span>`;
                    } else {
                        logoHtml = `<img src="${t.logoUrl}" alt="${loja.nome_loja}" class="brand-logo-img">`;
                    }
                }

                const safeSet = (id, val) => { if(val) { const el = document.getElementById(id); if(el) el.innerHTML = val; } };
                safeSet('dyn-hero-title', t.heroTitle); safeSet('dyn-hero-subtitle', t.heroSubtitle); safeSet('dyn-hero-btn', t.heroBtn);
                safeSet('dyn-products-title', t.productsTitle); safeSet('dyn-trust-1', t.trust1); safeSet('dyn-trust-2', t.trust2); safeSet('dyn-trust-3', t.trust3); safeSet('dyn-footer-slogan', t.footerSlogan);
                
                const heroSection = document.getElementById('hero');
                if (heroSection && t.heroImage) {
                    heroSection.style.backgroundImage = `url('${t.heroImage}')`;
                }
            }

            nomesLojaEl.forEach(el => { 
                if(el) { 
                    el.innerHTML = logoHtml; 
                    el.href = `index.html?loja=${slug}`; 
                } 
            });
            document.getElementById('link-inicio')?.setAttribute('href', `index.html?loja=${slug}#hero`); document.getElementById('link-lancamentos')?.setAttribute('href', `index.html?loja=${slug}#products`);
        }

        // =====================================
        // MUDANÇA: LIBERAR TELA O QUANTO ANTES
        // =====================================
        // Assim que as cores e a logo estão setadas, a gente tira o anti-piscar.
        liberarTela();

        // CARREGA A VITRINE DA TELA INICIAL (COM PARALELISMO)
        const gridIndex = document.getElementById('main-product-grid');
        if (gridIndex && !idProduto && loja) {
            
            // Dispara todas as requisições ao mesmo tempo
            const [
                { data: produtos },
                { data: colecoesDb },
                { data: fotosLookbook },
                { data: avaliacoesDb }
            ] = await Promise.all([
                supabase.from('produtos').select('*').eq('loja_id', loja.id).order('id', { ascending: false }),
                supabase.from('colecoes').select('*').eq('loja_id', loja.id).order('ordem', { ascending: true, nullsFirst: false }),
                supabase.from('lookbook').select('*').eq('loja_id', loja.id).order('id', { ascending: false }),
                supabase.from('avaliacoes').select('*').eq('loja_id', loja.id).eq('aprovado', true)
            ]);
            
            gridIndex.innerHTML = '';
            
            if (!produtos || produtos.length === 0) {
                gridIndex.innerHTML = '<p style="color: var(--text-muted); text-align: center; width: 100%;">Nenhum produto disponível.</p>';
            } else {
                produtos.forEach(p => {
                    gridIndex.innerHTML += `<div class="product-card glass-light"><a href="produto.html?loja=${slug}&id=${p.id}" class="card-img" style="display:block;"><img src="${p.imagem_url}" alt="${p.nome}"></a><div class="card-info"><h3><a href="produto.html?loja=${slug}&id=${p.id}">${p.nome}</a></h3><p class="price">R$ ${parseFloat(p.preco).toFixed(2).replace('.', ',')}</p><button class="btn-outline btn-add-cart" data-name="${p.nome}" data-price="${p.preco}">Adicionar <i class="fas fa-plus"></i></button></div></div>`;
                });

                const collectionsSection = document.getElementById('collections-section'); 
                const collectionsContainer = document.getElementById('collections-container'); 
                const dynamicFilters = document.getElementById('dynamic-filters');
                
                if (collectionsContainer && collectionsSection) {
                    let nomesColecoesOrdenadas = colecoesDb ? colecoesDb.map(c => c.nome) : [];
                    const colecoesSoltas = [...new Set(produtos.map(p => p.colecao).filter(c => c && c.trim() !== ''))];
                    colecoesSoltas.forEach(c => {
                        if (!nomesColecoesOrdenadas.includes(c)) nomesColecoesOrdenadas.push(c);
                    });

                    if (nomesColecoesOrdenadas.length > 0) {
                        collectionsSection.style.display = 'block'; 
                        collectionsContainer.innerHTML = ''; 
                        let filtersHtml = `<button class="filter-pill active" onclick="scrollToSection(event, 'products')">Todos</button>`;
                        
                        nomesColecoesOrdenadas.forEach(nomeColecao => {
                            const produtosColecao = produtos.filter(p => p.colecao === nomeColecao); 
                            
                            if (produtosColecao.length > 0) {
                                const sectionId = 'col-' + nomeColecao.replace(/\s+/g, '-').toLowerCase();
                                filtersHtml += `<button class="filter-pill" onclick="scrollToSection(event, '${sectionId}')">${nomeColecao}</button>`;
                                
                                let cardsHtml = '';
                                produtosColecao.forEach(p => {
                                    cardsHtml += `<div class="product-card glass-light"><a href="produto.html?loja=${slug}&id=${p.id}" class="card-img" style="display:block;"><img src="${p.imagem_url}" alt="${p.nome}"></a><div class="card-info"><h3><a href="produto.html?loja=${slug}&id=${p.id}">${p.nome}</a></h3><p class="price">R$ ${parseFloat(p.preco).toFixed(2).replace('.', ',')}</p><button class="btn-outline btn-add-cart" data-name="${p.nome}" data-price="${p.preco}">Adicionar <i class="fas fa-plus"></i></button></div></div>`;
                                });
                                collectionsContainer.innerHTML += `<div id="${sectionId}" style="margin-bottom: 4rem; scroll-margin-top: 100px;"><h2 class="section-title" style="margin-bottom: 2rem; text-align: left; font-size: 2rem; color: var(--accent-color);">${nomeColecao}</h2><div class="product-grid">${cardsHtml}</div></div>`;
                            }
                        });
                        if (dynamicFilters) dynamicFilters.innerHTML = filtersHtml;
                    } else { 
                        if (dynamicFilters) dynamicFilters.innerHTML = `<button class="filter-pill active" onclick="scrollToSection(event, 'products')">Todos</button>`; 
                    }
                }
            }
            
            // Renderiza Lookbook
            const lookbookGrid = document.getElementById('lookbook-grid');
            if (lookbookGrid && fotosLookbook && fotosLookbook.length > 0) {
                lookbookGrid.innerHTML = '';
                fotosLookbook.forEach(f => { lookbookGrid.innerHTML += `<div class="lookbook-item"><img src="${f.imagem_url}" alt="Look" loading="lazy"></div>`; });
            }

            // Renderiza Avaliações
            const reviewsWrapper = document.getElementById('dynamic-reviews-wrapper');
            if (reviewsWrapper) {
                if (avaliacoesDb && avaliacoesDb.length > 0) {
                    const shuffled = avaliacoesDb.sort(() => 0.5 - Math.random());
                    const selecionadas = shuffled.slice(0, 6); 
                    
                    reviewsWrapper.innerHTML = '';
                    selecionadas.forEach(av => {
                        reviewsWrapper.innerHTML += `
                            <div class="review-card glass-heavy">
                                <div class="stars"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div>
                                <p class="review-text">"${av.comentario}"</p>
                                <p class="reviewer">— ${av.nome}</p>
                            </div>
                        `;
                    });
                } else {
                    const secReviews = document.getElementById('reviews');
                    if(secReviews) secReviews.style.display = 'none';
                }
            }
        }

        // CARREGA PÁGINA DE PRODUTO ESPECÍFICO
        if (idProduto) {
            // Busca o produto principal logo de cara
            const { data: p } = await supabase.from('produtos').select('*').eq('id', idProduto).single();
            if (p) {
                if (loja) { document.title = `${p.nome} | ${loja.nome_loja}`; injetarSEODinamico(p, loja.nome_loja); }
                const elName = document.getElementById('product-name'); if(elName) elName.textContent = p.nome;
                const elPrice = document.getElementById('product-price'); if(elPrice) elPrice.textContent = `R$ ${parseFloat(p.preco).toFixed(2).replace('.', ',')}`;
                const elInst = document.getElementById('product-installments'); if(elInst) elInst.textContent = `ou 10x de R$ ${(p.preco/10).toFixed(2).replace('.', ',')} sem juros`;
                
                const elCarousel = document.getElementById('main-carousel');
                const elThumb = document.getElementById('product-thumbnails');
                
                let galeria = [];
                if (p.imagens && Array.isArray(p.imagens) && p.imagens.length > 0) galeria = p.imagens;
                else if (p.imagens && typeof p.imagens === 'string') { try { galeria = JSON.parse(p.imagens); } catch(e) { galeria = [p.imagem_url]; } }
                else galeria = [p.imagem_url];

                if(elCarousel) {
                    elCarousel.innerHTML = '';
                    galeria.forEach((urlImg, idx) => { elCarousel.innerHTML += `<div class="carousel-item" id="slide-${idx}"><img src="${urlImg}" alt="${p.nome}"></div>`; });
                    elCarousel.addEventListener('scroll', () => {
                        let index = Math.round(elCarousel.scrollLeft / elCarousel.offsetWidth);
                        const thumbs = document.querySelectorAll('.thumb-img');
                        if(thumbs && thumbs[index]) { thumbs.forEach(el => el.classList.remove('active')); thumbs[index].classList.add('active'); }
                    });
                }
                
                if(elThumb) {
                    let thumbHtml = '';
                    if (galeria.length > 1) { 
                        galeria.forEach((urlImg, idx) => { const activeClass = (idx === 0) ? 'active' : ''; thumbHtml += `<div class="thumb-img ${activeClass}" onclick="changeImage(this, '${urlImg}', ${idx})"><img src="${urlImg}" alt="Miniatura"></div>`; }); 
                    }
                    elThumb.innerHTML = thumbHtml;
                }

                const elDesc = document.getElementById('product-desc'); if(elDesc) elDesc.textContent = p.descricao;
                const mainAddBtn = document.getElementById('main-add-btn'); if(mainAddBtn) { mainAddBtn.setAttribute('data-name', p.nome); mainAddBtn.setAttribute('data-price', p.preco); }

                const stickyName = document.getElementById('sticky-product-name'); const stickyPrice = document.getElementById('sticky-product-price'); const stickyBtn = document.getElementById('sticky-add-btn');
                if (stickyName) stickyName.textContent = p.nome; if (stickyPrice) stickyPrice.textContent = `R$ ${parseFloat(p.preco).toFixed(2).replace('.', ',')}`;
                if (stickyBtn) { stickyBtn.setAttribute('data-name', p.nome); stickyBtn.setAttribute('data-price', p.preco); }

                const sizeContainer = document.getElementById('size-options-container');
                const dynamicSizes = document.getElementById('dynamic-sizes');
                
                if (sizeContainer && dynamicSizes) {
                    const tipo = p.tipo_tamanho || 'numeros_calcado'; 
                    
                    if (tipo === 'unico') {
                        sizeContainer.style.display = 'none';
                    } else {
                        sizeContainer.style.display = 'block';
                        let sizes = [];
                        
                        if (tipo === 'letras') { sizes = ['P', 'M', 'G', 'GG', 'XG']; } 
                        else if (tipo === 'numeros_roupa') { sizes = ['36', '38', '40', '42', '44', '46']; } 
                        else if (tipo === 'numeros_calcado') { sizes = ['38', '39', '40', '41', '42', '43']; }

                        dynamicSizes.innerHTML = ''; 
                        sizes.forEach((s, idx) => {
                            const activeClass = (idx === 0) ? 'active' : ''; 
                            dynamicSizes.innerHTML += `<button class="size-btn ${activeClass}">${s}</button>`;
                        });
                        initSizeButtons();
                    }
                }

                const formAval = document.getElementById('form-nova-avaliacao');
                if(formAval) {
                    formAval.addEventListener('submit', async (e) => {
                        e.preventDefault(); const btn = document.getElementById('btn-enviar-aval'); const originalText = btn.innerHTML; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> A enviar...'; btn.disabled = true;
                        const { error } = await supabase.from('avaliacoes').insert([{ loja_id: loja.id, produto_id: idProduto, nome: document.getElementById('aval-nome').value, comentario: document.getElementById('aval-texto').value, aprovado: false }]);
                        if(error) alert('Erro ao enviar: ' + error.message); else { formAval.reset(); mostrarToast('Comentário enviado! Aparecerá após a aprovação.'); }
                        btn.innerHTML = originalText; btn.disabled = false;
                    });
                }

                // =====================================
                // MUDANÇA: BUSCA PARALELA NO PRODUTO
                // =====================================
                const crossSellGrid = document.getElementById('cross-sell-grid');
                const containerAvaliacoes = document.getElementById('lista-avaliacoes');

                Promise.all([
                    supabase.from('produtos').select('*').eq('loja_id', loja?.id).neq('id', idProduto).limit(4),
                    supabase.from('avaliacoes').select('*').eq('produto_id', idProduto).eq('aprovado', true).order('created_at', { ascending: false })
                ]).then(([resSugeridos, resAvaliacoes]) => {
                    const sugeridos = resSugeridos.data;
                    const avaliacoes = resAvaliacoes.data;

                    // Renderiza Cross-sell (Sugestões)
                    if (crossSellGrid && loja) {
                        crossSellGrid.innerHTML = '';
                        if (sugeridos && sugeridos.length > 0) {
                            sugeridos.forEach(s => { crossSellGrid.innerHTML += `<div class="product-card glass-light"><a href="produto.html?loja=${slug}&id=${s.id}" class="card-img" style="display:block;"><img src="${s.imagem_url}" alt="${s.nome}"></a><div class="card-info"><h3><a href="produto.html?loja=${slug}&id=${s.id}">${s.nome}</a></h3><p class="price">R$ ${parseFloat(s.preco).toFixed(2).replace('.', ',')}</p><button class="btn-outline btn-add-cart" data-name="${s.nome}" data-price="${s.preco}">Adicionar <i class="fas fa-plus"></i></button></div></div>`; });
                        } else { 
                            const crossSection = document.getElementById('cross-sell'); if(crossSection) crossSection.style.display = 'none'; 
                        }
                    }

                    // Renderiza Avaliações
                    if (containerAvaliacoes) {
                        if (!avaliacoes || avaliacoes.length === 0) { 
                            containerAvaliacoes.innerHTML = '<p style="color: var(--text-muted);">Ainda não há avaliações. Seja o primeiro a comentar!</p>'; 
                        } else {
                            containerAvaliacoes.innerHTML = '';
                            avaliacoes.forEach(av => { containerAvaliacoes.innerHTML += `<div style="padding: 1rem; border-radius: 0.8rem; background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border);"><div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; align-items: center;"><strong style="color: var(--text-primary);"><i class="fas fa-user-circle"></i> ${av.nome}</strong><div class="stars" style="color: #fbbf24; font-size: 0.8rem;"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div></div><p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.5;">"${av.comentario}"</p></div>`; });
                        }
                    }
                });
                
            } else { 
                const elName = document.getElementById('product-name'); if(elName) elName.textContent = "Produto não encontrado ou indisponível."; 
            }
        }
    }
    init();

    // ==========================================
    // FUNÇÕES DO MODAL DE PÁGINAS LEGAIS
    // ==========================================
    window.abrirModalLegal = function(tipo) {
        const titulos = {
            'rastreio': 'Rastrear Pedido',
            'faq': 'Perguntas Frequentes',
            'devolucao': 'Política de Devolução',
            'contato': 'Fale Conosco'
        };
        
        const textosPadrao = {
            'rastreio': 'Insira seu código de rastreio no site dos Correios ou da transportadora parceira para acompanhar a rota do seu pedido até a sua casa.',
            'faq': '1. Qual o prazo de entrega?\\nO prazo varia de acordo com a sua região, geralmente levando de 5 a 12 dias úteis após o despacho.\\n\\n2. Os produtos são originais?\\nSim, garantimos a procedência e qualidade de todas as peças em nossa loja.',
            'devolucao': 'Garantimos o seu direito de arrependimento. Você tem até 7 dias corridos após o recebimento do produto para solicitar a devolução ou troca. O produto deve estar com as etiquetas e sem marcas de uso.',
            'contato': 'Estamos prontos para te ajudar!\\n\\nEnvie um email para: suporte@' + (window.lojaNomeTexto ? window.lojaNomeTexto.toLowerCase().replace(/\\s/g, '') : 'loja') + '.com\\nResponderemos em até 24 horas úteis.'
        };

        const titulo = titulos[tipo];
        const conteudo = (window.lojaTextosAtuais && window.lojaTextosAtuais[tipo]) ? window.lojaTextosAtuais[tipo] : textosPadrao[tipo];
        const nomeLoja = window.lojaNomeTexto || 'Nossa Loja';

        document.getElementById('modal-legal-titulo').innerText = titulo;
        document.getElementById('modal-legal-loja').innerText = nomeLoja;
        document.getElementById('modal-legal-conteudo').innerText = conteudo;

        const modal = document.getElementById('modal-legal');
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);
    };

    window.fecharModalLegal = function() {
        const modal = document.getElementById('modal-legal');
        modal.classList.remove('active');
        setTimeout(() => modal.style.display = 'none', 400); 
    };

});