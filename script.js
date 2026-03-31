document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 0. CAPTURA A LOJA ATUAL (SLUG) E CRIA A CHAVE ISOLADA
    // ==========================================
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('loja');
    const idProduto = params.get('id');

    if (!slug) {
        console.error("Nenhuma loja especificada na URL.");
        return; 
    }

    const CHAVE_CARRINHO = `carrinho_saas_${slug}`;

    // ==========================================
    // 1. SISTEMA GLOBAL: TEMA DARK/LIGHT E MENU
    // ==========================================
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const htmlElement = document.documentElement;

    const CHAVE_TEMA = `tema_saas_${slug}`;
    const savedTheme = localStorage.getItem(CHAVE_TEMA);
    
    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const newTheme = htmlElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem(CHAVE_TEMA, newTheme);
            updateThemeIcon(newTheme);
        });
    }

    function updateThemeIcon(theme) {
        if (!themeIcon) return;
        themeIcon.classList.remove('fa-sun', 'fa-moon');
        themeIcon.classList.add(theme === 'light' ? 'fa-moon' : 'fa-sun');
    }

    const mobileMenu = document.getElementById('mobile-menu');
    document.getElementById('open-menu')?.addEventListener('click', () => mobileMenu?.classList.add('active'));
    document.getElementById('close-menu')?.addEventListener('click', () => mobileMenu?.classList.remove('active'));

    // ==========================================
    // 2. SISTEMA GLOBAL: CARRINHO DE COMPRAS E TOASTS
    // ==========================================
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    
    function toggleCart(show) {
        if (show) {
            cartSidebar?.classList.add('active');
            cartOverlay?.classList.add('active');
        } else {
            cartSidebar?.classList.remove('active');
            cartOverlay?.classList.remove('active');
        }
    }

    document.getElementById('open-cart')?.addEventListener('click', () => toggleCart(true));
    document.getElementById('close-cart')?.addEventListener('click', () => toggleCart(false));
    cartOverlay?.addEventListener('click', () => toggleCart(false));

    let carrinho = JSON.parse(localStorage.getItem(CHAVE_CARRINHO)) || [];

    window.atualizarCarrinho = function() {
        const container = document.getElementById('cart-items-container');
        const counter = document.getElementById('cart-counter');
        const totalEl = document.getElementById('cart-total-price');
        
        if (!container || !counter || !totalEl) return;

        if (carrinho.length === 0) {
            container.innerHTML = '<p class="empty-msg">Seu carrinho está vazio.</p>';
            counter.textContent = '0';
            totalEl.textContent = 'R$ 0,00';
            localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));
            return;
        }

        container.innerHTML = '';
        let total = 0;
        let qtdTotal = 0;

        carrinho.forEach((item, index) => {
            total += (item.preco * item.quantidade);
            qtdTotal += item.quantidade;
            container.innerHTML += `
                <div class="cart-item-row glass-light" style="margin-bottom: 10px;">
                    <div>
                        <h4 style="font-size: 0.9rem; margin-bottom: 5px;">${item.nome}</h4>
                        <div class="cart-item-price">R$ ${parseFloat(item.preco).toFixed(2).replace('.', ',')} (x${item.quantidade})</div>
                    </div>
                    <button class="icon-btn remove-item" onclick="removerDoCarrinho(${index})" title="Remover item" style="color:#ff4757;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        });

        counter.textContent = qtdTotal;
        totalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));
    };

    window.removerDoCarrinho = function(index) {
        carrinho.splice(index, 1);
        atualizarCarrinho();
    };

    atualizarCarrinho();

    // Sistema de Toast Notification para UX de adição ao carrinho
    function mostrarToast(mensagem) {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }
        
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i class="fas fa-check-circle" style="color: #10b981;"></i> <span>${mensagem}</span>`;
        
        container.appendChild(toast);
        setTimeout(() => { 
            toast.style.opacity = '0'; 
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300); 
        }, 3000);
    }

    // ==========================================
    // 3. EVENTOS DE CLIQUE GERAIS
    // ==========================================
    document.addEventListener('click', (e) => {
        
        // 3.1 - Lógica de Adicionar ao Carrinho com Feedback de Loading e Toast
        const btnAdd = e.target.closest('.btn-add-cart');
        if (btnAdd) {
            e.preventDefault();
            const nome = btnAdd.getAttribute('data-name');
            const preco = parseFloat(btnAdd.getAttribute('data-price'));
            if (!nome || isNaN(preco)) return;

            // Efeito de Loading Visual
            const originalHtml = btnAdd.innerHTML;
            btnAdd.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adicionando...';
            btnAdd.style.pointerEvents = 'none';

            // Simula um delay rápido para percepção de processamento
            setTimeout(() => {
                const existente = carrinho.find(i => i.nome === nome);
                if (existente) existente.quantidade += 1;
                else carrinho.push({ nome, preco, quantidade: 1 });

                atualizarCarrinho();
                
                // Restaura o botão
                btnAdd.innerHTML = originalHtml;
                btnAdd.style.pointerEvents = 'auto';

                // Dispara a notificação Toast ao invés de abrir a barra agressivamente
                mostrarToast(`<b>${nome}</b> adicionado ao carrinho!`);
                
                // Animação sutil no contador
                const cartCounter = document.getElementById('cart-counter');
                if(cartCounter) {
                    cartCounter.style.transform = 'scale(1.5)';
                    setTimeout(() => cartCounter.style.transform = 'scale(1)', 300);
                }
            }, 500);
        }

        // 3.2 - Lógica do Modal do Rodapé
        const footerLink = e.target.closest('.footer-links a');
        if (footerLink) {
            e.preventDefault(); 
            
            const modal = document.getElementById('glass-modal');
            const modalTitle = document.getElementById('modal-title');
            const modalText = document.getElementById('modal-text');
            
            if (modal && modalTitle && modalText) {
                const linkText = footerLink.textContent.trim();
                const nomeLoja = document.title.split('|')[0].trim() || "nossa loja";
                
                modalTitle.textContent = linkText;

                let conteudoHTML = "";
                if (linkText.includes("Rastrear")) {
                    conteudoHTML = `<p>Acompanhe cada passo da sua exclusividade. A <strong>${nomeLoja}</strong> utiliza um sistema de logística de alta performance para garantir que seu drop chegue intacto e no prazo.</p><p>Em breve, você poderá inserir seu código de rastreio aqui para visualizar o status da entrega em tempo real com precisão milimétrica.</p>`;
                } else if (linkText.includes("FAQ")) {
                    conteudoHTML = `<p>Bem-vindo à nossa base de conhecimento. Aqui na <strong>${nomeLoja}</strong>, a transparência é inegociável.</p><p>Nossa central de dúvidas frequentes está sendo atualizada para trazer detalhes sobre materiais, cuidados com as peças, métodos de pagamento seguros e nossos processos de fabricação premium.</p>`;
                } else if (linkText.includes("Política")) {
                    conteudoHTML = `<p>Garantia de satisfação elevada ao máximo. Se a peça não atingir suas expectativas, a <strong>${nomeLoja}</strong> oferece <strong>30 dias</strong> para trocas ou devoluções de forma totalmente descomplicada.</p><p>Nosso processo é 100% digital, sem burocracias ou letras miúdas, focado inteiramente na sua melhor experiência.</p>`;
                } else if (linkText.includes("Fale")) {
                    conteudoHTML = `<p>Conexão direta e sem filtros com nossa equipe. A <strong>${nomeLoja}</strong> oferece um suporte de nível concierge para nossos clientes.</p><p>Seja para dúvidas sobre o drop atual, assistência com pedidos ou parcerias, nossos canais de atendimento operam em alta velocidade para entregar a solução que você precisa.</p><p style="margin-top: 15px;"><a href="#" class="btn-outline" style="display: inline-block; padding: 0.5rem 1rem; border-color: var(--text-secondary); color: var(--text-primary);"><i class="fas fa-envelope"></i> Enviar Mensagem</a></p>`;
                } else {
                    conteudoHTML = `<p>Você acessou uma área restrita da <strong>${nomeLoja}</strong>.</p><p>Esta página está sendo gerada dinamicamente pelo nosso motor de alta performance para garantir que seus dados e navegação estejam sempre protegidos.</p>`;
                }

                modalText.innerHTML = conteudoHTML;
                modal.style.display = 'flex'; 
                setTimeout(() => modal.classList.add('active'), 10);
            }
        }
    });

    window.fecharModal = function() {
        const modal = document.getElementById('glass-modal');
        if(modal) {
            modal.classList.remove('active'); 
            setTimeout(() => modal.style.display = 'none', 400); 
        }
    }

    // ==========================================
    // 4. INTERAÇÕES DE UI (FORMULÁRIOS, CEP E TAMANHOS)
    // ==========================================
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault(); 
            const btn = newsletterForm.querySelector('button');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> VIP!';
            btn.style.background = '#10b981';
            btn.style.color = '#fff';
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '';
                btn.style.color = '';
                newsletterForm.reset();
            }, 3000);
        });
    }

    const sizeBtns = document.querySelectorAll('.size-btn');
    sizeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            sizeBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // CEP com Validação de Segurança (Apenas Números)
    const cepInput = document.getElementById('cep-input');
    if(cepInput) {
        cepInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, ""); // Remove não-números
            if (value.length > 5) value = value.replace(/^(\d{5})(\d)/, "$1-$2");
            e.target.value = value.substring(0, 9); // Trava o tamanho
        });
    }

    window.changeImage = function(thumbElement, imageUrl) {
        const mainImg = document.getElementById('main-product-img');
        if (mainImg) mainImg.src = imageUrl;
        document.querySelectorAll('.thumb-img').forEach(el => el.classList.remove('active'));
        thumbElement.classList.add('active');
    };

    window.calculateShipping = function() {
        const cep = document.getElementById('cep-input')?.value;
        if(cep && cep.length === 9) {
            const btn = document.querySelector('.shipping-form button');
            if (btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            setTimeout(() => {
                const result = document.getElementById('shipping-result');
                if (result) result.classList.add('active');
                if (btn) btn.innerHTML = 'OK';
            }, 800);
        } else {
            alert("Por favor, insira um CEP válido de 8 dígitos.");
        }
    };

    // Função de Injeção de SEO Dinâmico
    function injetarSEODinamico(produto, lojaNome) {
        const metas = [
            { property: 'og:title', content: `${produto.nome} | ${lojaNome}` },
            { property: 'og:description', content: produto.descricao ? produto.descricao.substring(0, 150) + '...' : `Compre ${produto.nome} na ${lojaNome}.` },
            { property: 'og:image', content: produto.imagem_url },
            { property: 'og:type', content: 'product' }
        ];

        metas.forEach(metaData => {
            let meta = document.createElement('meta');
            Object.keys(metaData).forEach(key => meta.setAttribute(key, metaData[key]));
            document.head.appendChild(meta);
        });
    }

    // ==========================================
    // 5. SUPABASE: BANCO DE DADOS E LÓGICA DE PRODUTO
    // ==========================================
    const SUPABASE_URL = 'https://ikkjgtgvohrwurtiustm.supabase.co'; 
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlra2pndGd2b2hyd3VydGl1c3RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NzE4OTEsImV4cCI6MjA5MDE0Nzg5MX0.HNrSvCmSHWTe2yoQy27GOq5g_ZoZxFdox_eCW14f_nI';
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    async function init() {
        const { data: loja } = await supabase.from('lojas').select('*').eq('slug', slug).single();
        if (loja) {
            document.title = loja.nome_loja; 
            const nomesLojaEl = [document.getElementById('nome-loja'), document.getElementById('footer-nome-loja')];
            nomesLojaEl.forEach(el => {
                if(el) { el.innerHTML = `${loja.nome_loja}<span>.</span>`; el.href = `index.html?loja=${slug}`; }
            });
            
            document.getElementById('link-inicio')?.setAttribute('href', `index.html?loja=${slug}#hero`);
            document.getElementById('link-lancamentos')?.setAttribute('href', `index.html?loja=${slug}#products`);

            if (loja.cor_principal) document.documentElement.style.setProperty('--accent-color', loja.cor_principal);
        }

        const gridIndex = document.getElementById('main-product-grid');
        if (gridIndex && !idProduto && loja) {
            const { data: produtos } = await supabase.from('produtos').select('*').eq('loja_id', loja.id).order('id', { ascending: false });
            gridIndex.innerHTML = '';
            if (!produtos || produtos.length === 0) {
                gridIndex.innerHTML = '<p style="color: var(--text-muted); text-align: center; width: 100%;">Nenhum produto disponível.</p>';
            } else {
                produtos.forEach(p => {
                    gridIndex.innerHTML += `
                        <div class="product-card glass-light">
                            <a href="produto.html?loja=${slug}&id=${p.id}" class="card-img" style="display:block;">
                                <img src="${p.imagem_url}" alt="${p.nome}">
                            </a>
                            <div class="card-info">
                                <h3><a href="produto.html?loja=${slug}&id=${p.id}">${p.nome}</a></h3>
                                <p class="price">R$ ${parseFloat(p.preco).toFixed(2).replace('.', ',')}</p>
                                <button class="btn-outline btn-add-cart" data-name="${p.nome}" data-price="${p.preco}">
                                    Adicionar <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                    `;
                });
            }
        }

        const lookbookGrid = document.getElementById('lookbook-grid');
        if (lookbookGrid && loja) { 
            const { data: fotos } = await supabase.from('lookbook').select('*').eq('loja_id', loja.id).order('id', { ascending: false });
            
            if (fotos && fotos.length > 0) {
                lookbookGrid.innerHTML = ''; 
                fotos.forEach(f => {
                    lookbookGrid.innerHTML += `
                        <div class="lookbook-item">
                            <img src="${f.imagem_url}" alt="Look" loading="lazy">
                        </div>
                    `;
                });
            }
        }

        // --- LÓGICA EXCLUSIVA DA PÁGINA DE PRODUTO ÚNICO ---
        if (idProduto) {
            const { data: p } = await supabase.from('produtos').select('*').eq('id', idProduto).single();
            if (p) {
                if (loja) {
                    document.title = `${p.nome} | ${loja.nome_loja}`;
                    injetarSEODinamico(p, loja.nome_loja);
                }
                
                // Preenche dados principais
                const elName = document.getElementById('product-name'); if(elName) elName.textContent = p.nome;
                const elPrice = document.getElementById('product-price'); if(elPrice) elPrice.textContent = `R$ ${parseFloat(p.preco).toFixed(2).replace('.', ',')}`;
                const elInst = document.getElementById('product-installments'); if(elInst) elInst.textContent = `ou 10x de R$ ${(p.preco/10).toFixed(2).replace('.', ',')} sem juros`;
                
                const elImg = document.getElementById('main-product-img');
                if(elImg) { elImg.src = p.imagem_url; elImg.style.opacity = '1'; }
                
                const elThumb = document.getElementById('product-thumbnails');
                if(elThumb) elThumb.innerHTML = `<div class="thumb-img active" onclick="changeImage(this, '${p.imagem_url}')"><img src="${p.imagem_url}" alt="Thumb"></div>`;
                
                const elDesc = document.getElementById('product-desc'); if(elDesc) elDesc.textContent = p.descricao;
                
                const mainAddBtn = document.getElementById('main-add-btn');
                if(mainAddBtn) { mainAddBtn.setAttribute('data-name', p.nome); mainAddBtn.setAttribute('data-price', p.preco); }

                // 5.1 GATILHOS MENTAIS (Simulação de Urgência Realista)
                const viewersEl = document.getElementById('live-viewers');
                const stockEl = document.getElementById('stock-left');
                if(viewersEl) viewersEl.textContent = Math.floor(Math.random() * 12) + 6; // Entre 6 e 17 pessoas
                if(stockEl) stockEl.textContent = Math.floor(Math.random() * 3) + 1; // Entre 1 e 3 no estoque
                
                // 5.2 ZOOM DA IMAGEM PRINCIPAL (Desktop)
                const mainImageContainer = document.querySelector('.main-image');
                if (mainImageContainer && elImg && window.innerWidth > 768) {
                    mainImageContainer.addEventListener('mousemove', function(e) {
                        const { left, top, width, height } = this.getBoundingClientRect();
                        const x = (e.clientX - left) / width * 100;
                        const y = (e.clientY - top) / height * 100;
                        elImg.style.transformOrigin = `${x}% ${y}%`;
                    });
                    
                    mainImageContainer.addEventListener('mouseleave', function() {
                        elImg.style.transformOrigin = 'center center';
                    });
                }

                // 5.3 BARRA STICKY (Mobile)
                const stickyName = document.getElementById('sticky-product-name');
                const stickyPrice = document.getElementById('sticky-product-price');
                const stickyBtn = document.getElementById('sticky-add-btn');

                if (stickyName) stickyName.textContent = p.nome;
                if (stickyPrice) stickyPrice.textContent = `R$ ${parseFloat(p.preco).toFixed(2).replace('.', ',')}`;
                if (stickyBtn) {
                    stickyBtn.setAttribute('data-name', p.nome);
                    stickyBtn.setAttribute('data-price', p.preco);
                }

                const stickyBar = document.getElementById('sticky-cart-bar');
                if (mainAddBtn && stickyBar && window.innerWidth <= 768) {
                    const observer = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (!entry.isIntersecting) stickyBar.classList.add('visible');
                            else stickyBar.classList.remove('visible');
                        });
                    }, { threshold: 0 });
                    observer.observe(mainAddBtn);
                }

                // 5.4 CROSS-SELL (Puxa outros produtos do banco)
                const crossSellGrid = document.getElementById('cross-sell-grid');
                if (crossSellGrid && loja) {
                    const { data: sugeridos } = await supabase
                        .from('produtos')
                        .select('*')
                        .eq('loja_id', loja.id)
                        .neq('id', idProduto) 
                        .limit(4); 

                    crossSellGrid.innerHTML = '';
                    if (sugeridos && sugeridos.length > 0) {
                        sugeridos.forEach(s => {
                            crossSellGrid.innerHTML += `
                                <div class="product-card glass-light">
                                    <a href="produto.html?loja=${slug}&id=${s.id}" class="card-img" style="display:block;">
                                        <img src="${s.imagem_url}" alt="${s.nome}">
                                    </a>
                                    <div class="card-info">
                                        <h3><a href="produto.html?loja=${slug}&id=${s.id}">${s.nome}</a></h3>
                                        <p class="price">R$ ${parseFloat(s.preco).toFixed(2).replace('.', ',')}</p>
                                        <button class="btn-outline btn-add-cart" data-name="${s.nome}" data-price="${s.preco}">
                                            Adicionar <i class="fas fa-plus"></i>
                                        </button>
                                    </div>
                                </div>
                            `;
                        });
                    } else {
                        const crossSection = document.getElementById('cross-sell');
                        if(crossSection) crossSection.style.display = 'none';
                    }
                }

            } else {
                const elName = document.getElementById('product-name'); 
                if(elName) elName.textContent = "Produto não encontrado ou indisponível.";
            }
        }
    }
    init();
});