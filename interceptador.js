// interceptador.js
if (!window.__SaaS_Intercepted__) {
    window.__SaaS_Intercepted__ = true;
    (async function() {
        try {
            const params = new URLSearchParams(window.location.search);
            const slug = params.get('loja');
            
            if (!slug) {
                document.getElementById('cortina-saas')?.remove();
                return;
            }

            const SUPABASE_URL = 'https://ikkjgtgvohrwurtiustm.supabase.co'; 
            const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlra2pndGd2b2hyd3VydGl1c3RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NzE4OTEsImV4cCI6MjA5MDE0Nzg5MX0.HNrSvCmSHWTe2yoQy27GOq5g_ZoZxFdox_eCW14f_nI';
            const supaClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

            const { data } = await supaClient.from('lojas').select('codigo_customizado').eq('slug', slug).single();
            
            let usouCodigoNovo = false;

            if (data && data.codigo_customizado) {
                const codigos = typeof data.codigo_customizado === 'string' ? JSON.parse(data.codigo_customizado) : data.codigo_customizado;
                
                let paginaAtual = window.location.pathname.split('/').pop().replace('.html', '');
                if (!paginaAtual || paginaAtual === '') paginaAtual = 'index'; 
                
                if (codigos[paginaAtual] && codigos[paginaAtual].length > 50) {
                    usouCodigoNovo = true;
                    
                    let tagFechamento = '</' + 'style>';
                    let cortinaRegex = new RegExp('<style id="cortina-saas">[\\s\\S]*?' + tagFechamento, 'ig');
                    let htmlLimpo = codigos[paginaAtual].replace(cortinaRegex, '');

                    // === ISOLAMENTO TOTAL (CSS E JS) ===
                    // Aplica o design e as funções personalizadas APENAS na montra
                    let paginasVitrine = ['index', 'produto'];
                    if (paginasVitrine.includes(paginaAtual)) {
                        if (codigos.style) {
                            htmlLimpo = htmlLimpo.replace(/<\/head>/i, "<style>" + codigos.style + "</style></head>");
                        }
                        if (codigos.script) {
                            htmlLimpo = htmlLimpo.replace(/<\/body>/i, "<script>" + codigos.script + "<\/script></body>");
                        }
                    }

                    // === SISTEMA ANTI-ECRÃ PRETO (FAILSAFE) ===
                    // Garante que o ecrã sempre apareça, libertando a opacidade automaticamente
                    let scriptFailsafe = "<script>setTimeout(() => { document.body.style.opacity = '1'; document.body.style.visibility = 'visible'; document.body.style.pointerEvents = 'auto'; }, 800);<\/script></body>";
                    htmlLimpo = htmlLimpo.replace(/<\/body>/i, scriptFailsafe);

                    document.open();
                    document.write(htmlLimpo);
                    document.close();
                }
            }

            if (!usouCodigoNovo) {
                document.getElementById('cortina-saas')?.remove();
                if(document.body) {
                    document.body.style.opacity = '1';
                    document.body.style.visibility = 'visible';
                }
            }

        } catch (err) {
            console.error("Erro no interceptador:", err);
            document.getElementById('cortina-saas')?.remove();
            if(document.body) {
                document.body.style.opacity = '1';
                document.body.style.visibility = 'visible';
            }
        }
    })();
}