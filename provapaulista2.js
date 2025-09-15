(function() {
    // --- Configurações (Preencha com sua chave API se for usar o Gemini de verdade) ---
    const GEMINI_API_KEY = "AIzaSyBlzdH0vfP0J90p6rtMytvJFcJaFCbv4HI"; // <<<<<<< IMPORTANTE: Substitua pela sua chave!
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
    const RESPONSE_DISPLAY_DURATION = 6000; // 6 segundos

    // --- Funções Auxiliares ---

    // Função para limpar o DOM de elementos anteriores do script
    function cleanupPreviousElements() {
        ['saladofuturo-panel', 'saladofuturo-response-display'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.remove();
        });
        document.removeEventListener('keydown', handleKeyPress);
    }

    // Tenta extrair a pergunta e as alternativas da página
    function extractQuestionAndOptions() {
        let questionText = '';
        const options = [];

        // Tentativa 1: Procurar um elemento <div class="question-container"> ou similar
        // Este é um exemplo, você pode precisar ajustar os seletores para o site exato
        const questionContainer = document.querySelector('.question-container, .question-card, .assessment-question');
        
        if (questionContainer) {
            // Tenta pegar o texto da pergunta
            const questionEl = questionContainer.querySelector('h2, h3, p.question-text, div.question-body');
            if (questionEl) {
                questionText = questionEl.textContent.trim();
            }

            // Tenta pegar as alternativas
            const optionEls = questionContainer.querySelectorAll('li.option-item, div.answer-option, .alternative-text');
            optionEls.forEach(el => {
                options.push(el.textContent.trim());
            });
        } else {
            // Tentativa 2: Mais genérica, pode precisar de ajuste
            // Procura por algum texto que se pareça com uma pergunta (termina com '?')
            // ou elementos de lista que possam ser alternativas.
            const mainContent = document.querySelector('body'); // Pode ser um elemento mais específico
            if (mainContent) {
                // Muito genérico, pode pegar texto indesejado.
                // Idealmente, você ajustaria isso para seletores CSS específicos do site.
                const possibleQuestion = mainContent.innerText.split('\n').find(line => line.includes('?') && line.length > 20);
                if (possibleQuestion) {
                    questionText = possibleQuestion.trim();
                }

                // Tenta pegar alternativas como itens de lista (ul/ol)
                const listItems = mainContent.querySelectorAll('ul li, ol li');
                listItems.forEach(item => {
                    const text = item.textContent.trim();
                    if (text.length > 5 && text.length < 200 && !text.includes('Menu') && !text.includes('Página')) { // Filtros básicos
                        options.push(text);
                    }
                });
            }
        }
        
        // Se não encontrar opções, tenta pegar elementos que parecem ser radios/checkbox labels
        if (options.length === 0) {
            const radioLabels = document.querySelectorAll('input[type="radio"] + label, input[type="checkbox"] + label');
            radioLabels.forEach(label => {
                options.push(label.textContent.trim());
            });
        }

        return { question: questionText, options: options };
    }

    // Chama a API do Gemini
    async function getGeminiResponse(question, options) {
        if (!GEMINI_API_KEY || GEMINI_API_KEY === "SUA_CHAVE_API_DO_GEMINI_AQUI") {
            console.error("Chave API do Gemini não configurada!");
            return "Erro: Chave API do Gemini não configurada. Edite provapaulista.js";
        }

        const prompt = `A pergunta é: "${question}". As opções são: ${options.map((opt, i) => `${i + 1}. ${opt}`).join(', ')}. Qual a melhor resposta? Responda APENAS com a opção mais provável (ex: "A opção 3 é a correta" ou "A resposta é: ${options[index]}").`;

        try {
            const response = await fetch(GEMINI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Erro na API do Gemini: ${response.status} - ${errorData.error.message || response.statusText}`);
            }

            const data = await response.json();
            const textResponse = data.candidates[0].content.parts[0].text;
            return textResponse;

        } catch (error) {
            console.error("Erro ao chamar Gemini API:", error);
            return `Erro ao obter resposta da IA: ${error.message}`;
        }
    }

    // Exibe a resposta em um balão no canto inferior esquerdo
    function showResponseOnScreen(message) {
        let display = document.getElementById('saladofuturo-response-display');
        if (!display) {
            display = document.createElement('div');
            display.id = 'saladofuturo-response-display';
            display.style.position = 'fixed';
            display.style.bottom = '20px';
            display.style.left = '20px';
            display.style.backgroundColor = '#1e88e5'; // Azul vibrante
            display.style.color = 'white';
            display.style.padding = '15px 20px';
            display.style.borderRadius = '10px';
            display.style.zIndex = '100000';
            display.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
            display.style.fontSize = '16px';
            display.style.fontWeight = 'bold';
            display.style.opacity = '0';
            display.style.transform = 'translateY(20px)';
            display.style.transition = 'opacity 0.4s ease-out, transform 0.4s ease-out';
            document.body.appendChild(display);
        }

        display.textContent = message;
        // Forçar reflow para garantir a transição
        void display.offsetWidth; 
        display.style.opacity = '1';
        display.style.transform = 'translateY(0)';

        setTimeout(() => {
            display.style.opacity = '0';
            display.style.transform = 'translateY(20px)';
            // Remover depois da transição
            setTimeout(() => {
                if (display && display.parentNode) {
                    display.remove();
                }
            }, 500); // tempo da transição
        }, RESPONSE_DISPLAY_DURATION);
    }

    // --- Criação e Manipulação do Painel ---

    cleanupPreviousElements(); // Limpa elementos anteriores ao iniciar

    var panel = document.createElement('div');
    panel.id = 'saladofuturo-panel';
    panel.style.position = 'fixed';
    panel.style.bottom = '20px'; // Ajustado para inferior direito
    panel.style.right = '20px';
    panel.style.width = '180px'; // Tamanho menor
    panel.style.backgroundColor = 'rgba(40, 44, 52, 0.9)'; // Fundo semi-transparente
    panel.style.border = '1px solid #61afef';
    panel.style.borderRadius = '8px';
    panel.style.padding = '10px';
    panel.style.zIndex = '99999';
    panel.style.fontFamily = 'Arial, sans-serif';
    panel.style.color = '#abb2bf';
    panel.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.4)';
    panel.style.transition = 'all 0.3s ease';
    panel.style.textAlign = 'left'; // Alinhamento dos itens

    // Botões e suas ações para o menu menor
    function createMenuItem(text, action, shortcut) {
        var item = document.createElement('div');
        item.style.padding = '8px 10px';
        item.style.cursor = 'pointer';
        item.style.fontSize = '14px';
        item.style.borderBottom = '1px solid rgba(97, 175, 239, 0.2)';
        item.textContent = `${shortcut}: ${text}`;
        item.onmouseover = function() { this.style.backgroundColor = 'rgba(97, 175, 239, 0.2)'; };
        item.onmouseout = function() { this.style.backgroundColor = 'transparent'; };
        item.onclick = action;
        return item;
    }

    panel.appendChild(createMenuItem('Voltar', function() {
        history.back();
        showResponseOnScreen('Navegando para a página anterior.');
    }, '1'));

    panel.appendChild(createMenuItem('Pegar Resposta', async function() {
        showResponseOnScreen('Analisando pergunta e buscando resposta...');
        const { question, options } = extractQuestionAndOptions();
        if (question && options.length > 0) {
            const iaResponse = await getGeminiResponse(question, options);
            showResponseOnScreen(`IA: ${iaResponse}`);
        } else {
            showResponseOnScreen('Não consegui identificar a pergunta e as opções na tela.');
        }
    }, '2'));

    panel.appendChild(createMenuItem('Fechar Menu', function() {
        panel.remove();
        document.removeEventListener('keydown', handleKeyPress);
    }, '3')); // Botão para fechar APENAS o menu

    panel.appendChild(createMenuItem('Sair (Fechar Aba)', function() {
        // window.close() só funciona se a aba foi aberta pelo script,
        // ou em pouquíssimos outros cenários.
        alert('A função "Fechar Aba" (Tecla 4) geralmente é bloqueada por segurança do navegador, a menos que a aba tenha sido aberta por um script.');
        // panel.remove(); // Opcional: remover o painel mesmo que a aba não feche
        // document.removeEventListener('keydown', handleKeyPress);
        // window.close(); // Descomente se quiser tentar, mas provavelmente não funcionará
    }, '4'));


    document.body.appendChild(panel);

    // --- Manipulação de Teclas ---
    function handleKeyPress(event) {
        // Ignorar se Ctrl, Cmd, Alt ou Shift estiverem pressionados, para não conflitar com atalhos do navegador
        if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
            return;
        }

        switch (event.key) {
            case '1':
                event.preventDefault(); // Previne ação padrão do navegador (se houver)
                history.back();
                showResponseOnScreen('Navegando para a página anterior.');
                break;
            case '2':
                event.preventDefault();
                (async () => { // Usar uma IIFE assíncrona para chamar a função async
                    showResponseOnScreen('Analisando pergunta e buscando resposta...');
                    const { question, options } = extractQuestionAndOptions();
                    if (question && options.length > 0) {
             

