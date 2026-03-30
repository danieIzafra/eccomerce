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
    // 2. SISTEMA GLOBAL: CARRINHO DE COMPRAS
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

    // ==========================================
    // 3. EVENTOS DE CLIQUE GERAIS (CARRINHO E RODAPÉ)
    // ==========================================
    document.addEventListener('click', (e) => {
        
        // 3.1 - Lógica de Adicionar ao Carrinho
        const btnAdd = e.target.closest('.btn-add-cart');
        if (btnAdd) {
            e.preventDefault();
            const nome = btnAdd.getAttribute('data-name');
            const preco = parseFloat(btnAdd.getAttribute('data-price'));
            if (!nome || isNaN(preco)) return;

            const existente = carrinho.find(i => i.nome === nome);
            if (existente) existente.quantidade += 1;
            else carrinho.push({ nome, preco, quantidade: 1 });

            atualizarCarrinho();
            toggleCart(true);
        }

        // 3.2 - Lógica do Modal do Rodapé (Textos Premium e Dinâmicos)
        const footerLink = e.target.closest('.footer-links a');
        if (footerLink) {
            e.preventDefault(); 
            
            const modal = document.getElementById('glass-modal');
            const modalTitle = document.getElementById('modal-title');
            const modalText = document.getElementById('modal-text');
            
            if (modal && modalTitle && modalText) {
                const linkText = footerLink.textContent.trim();
                const nomeLoja = document.title || "nossa loja";
                
                modalTitle.textContent = linkText;

                // Dicionário de textos premium para cada link
                let conteudoHTML = "";

                if (linkText.includes("Rastrear")) {
                    conteudoHTML = `
                        <p>Acompanhe cada passo da sua exclusividade. A <strong>${nomeLoja}</strong> utiliza um sistema de logística de alta performance para garantir que seu drop chegue intacto e no prazo.</p>
                        <p>Em breve, você poderá inserir seu código de rastreio aqui para visualizar o status da entrega em tempo real com precisão milimétrica.</p>
                    `;
                } 
                else if (linkText.includes("FAQ")) {
                    conteudoHTML = `
                        <p>Bem-vindo à nossa base de conhecimento. Aqui na <strong>${nomeLoja}</strong>, a transparência é inegociável.</p>
                        <p>Nossa central de dúvidas frequentes está sendo atualizada para trazer detalhes sobre materiais, cuidados com as peças, métodos de pagamento seguros e nossos processos de fabricação premium.</p>
                    `;
                } 
                else if (linkText.includes("Política")) {
                    conteudoHTML = `
                        <p>Garantia de satisfação elevada ao máximo. Se a peça não atingir suas expectativas, a <strong>${nomeLoja}</strong> oferece <strong>30 dias</strong> para trocas ou devoluções de forma totalmente descomplicada.</p>
                        <p>Nosso processo é 100% digital, sem burocracias ou letras miúdas, focado inteiramente na sua melhor experiência.</p>
                    `;
                } 
                else if (linkText.includes("Fale")) {
                    conteudoHTML = `
                        <p>Conexão direta e sem filtros com nossa equipe. A <strong>${nomeLoja}</strong> oferece um suporte de nível concierge para nossos clientes.</p>
                        <p>Seja para dúvidas sobre o drop atual, assistência com pedidos ou parcerias, nossos canais de atendimento operam em alta velocidade para entregar a solução que você precisa.</p>
                        <p style="margin-top: 15px;"><a href="#" class="btn-outline" style="display: inline-block; padding: 0.5rem 1rem; border-color: var(--text-secondary); color: var(--text-primary);"><i class="fas fa-envelope"></i> Enviar Mensagem</a></p>
                    `;
                } 
                else {
                    // Texto genérico de segurança caso adicione novos links depois
                    conteudoHTML = `
                        <p>Você acessou uma área restrita da <strong>${nomeLoja}</strong>.</p>
                        <p>Esta página está sendo gerada dinamicamente pelo nosso motor de alta performance para garantir que seus dados e navegação estejam sempre protegidos.</p>
                    `;
                }

                modalText.innerHTML = conteudoHTML;
                
                // Dispara a animação do Glassmorphism
                modal.style.display = 'flex'; 
                setTimeout(() => {
                    modal.classList.add('active'); 
                }, 10);
            }
        }
    });
    // Função para fechar o Modal com animação
    window.fecharModal = function() {
        const modal = document.getElementById('glass-modal');
        if(modal) {
            modal.classList.remove('active'); // Remove o zoom e opacidade
            setTimeout(() => {
                modal.style.display = 'none'; // Some da tela após a transição
            }, 400); // 400ms = tempo da animação do CSS
        }
    }

    // ==========================================
    // 4. NEWSLETTER - BLOQUEIO DE REFRESH
    // ==========================================
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Impede o envio real que recarrega a página
            
            const btn = newsletterForm.querySelector('button');
            const originalText = btn.innerHTML;
            
            // Sucesso visual
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

    // ==========================================
    // 5. INTERAÇÕES DA PÁGINA DE PRODUTOS
    // ==========================================
    const sizeBtns = document.querySelectorAll('.size-btn');
    sizeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            sizeBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    const cepInput = document.getElementById('cep-input');
    if(cepInput) {
        cepInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, "");
            if (value.length > 5) value = value.replace(/^(\d{5})(\d)/, "$1-$2");
            e.target.value = value;
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
            alert("Por favor, insira um CEP válido.");
        }
    };

    // ==========================================
    // 6. SUPABASE: BANCO DE DADOS
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

        // ==========================================
        // CARREGAR LOOKBOOK DO BANCO DE DADOS
        // ==========================================
        const lookbookGrid = document.getElementById('lookbook-grid');
        if (lookbookGrid && loja) { // <-- Removi o "!idProduto" daqui
            const { data: fotos } = await supabase.from('lookbook').select('*').eq('loja_id', loja.id).order('id', { ascending: false });
            
            if (fotos && fotos.length > 0) {
                lookbookGrid.innerHTML = ''; // Limpa a "placa" de aviso
                fotos.forEach(f => {
                    lookbookGrid.innerHTML += `
                        <div class="lookbook-item">
                            <img src="${f.imagem_url}" alt="Look" loading="lazy">
                        </div>
                    `;
                });
            }
        }

        if (idProduto) {
            const { data: p } = await supabase.from('produtos').select('*').eq('id', idProduto).single();
            if (p) {
                if (loja) document.title = `${p.nome} | ${loja.nome_loja}`;
                
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
            } else {
                const elName = document.getElementById('product-name'); if(elName) elName.textContent = "Produto não encontrado";
            }
        }
    }
    init();
});