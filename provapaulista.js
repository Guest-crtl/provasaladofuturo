(function() {
    // Remover qualquer painel existente para evitar duplicatas
    var existingPanel = document.getElementById('saladofuturo-panel');
    if (existingPanel) {
        existingPanel.remove();
    }

    // Criar o painel principal
    var panel = document.createElement('div');
    panel.id = 'saladofuturo-panel';
    panel.style.position = 'fixed';
    panel.style.top = '10px';
    panel.style.right = '10px';
    panel.style.width = '200px';
    panel.style.backgroundColor = '#282c34';
    panel.style.border = '1px solid #61afef';
    panel.style.borderRadius = '8px';
    panel.style.padding = '15px';
    panel.style.zIndex = '99999';
    panel.style.fontFamily = 'Arial, sans-serif';
    panel.style.color = '#abb2bf';
    panel.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    panel.style.transition = 'all 0.3s ease';

    // Título do painel
    var title = document.createElement('h3');
    title.textContent = 'Salada do Futuro';
    title.style.color = '#61afef';
    title.style.marginBottom = '15px';
    title.style.textAlign = 'center';
    panel.appendChild(title);

    // Função para criar botões
    function createButton(text, action, shortcut) {
        var button = document.createElement('button');
        button.textContent = text + (shortcut ? ` (Tecla ${shortcut})` : '');
        button.style.display = 'block';
        button.style.width = '100%';
        button.style.padding = '10px';
        button.style.marginBottom = '10px';
        button.style.backgroundColor = '#61afef';
        button.style.color = '#282c34';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.style.fontSize = '14px';
        button.style.fontWeight = 'bold';
        button.style.transition = 'background-color 0.2s ease';
        button.onmouseover = function() { this.style.backgroundColor = '#569cd6'; };
        button.onmouseout = function() { this.style.backgroundColor = '#61afef'; };
        button.onclick = action;
        panel.appendChild(button);
        return button;
    }

    // Campo de resposta (para exibir o que for "pego")
    var responseArea = document.createElement('textarea');
    responseArea.placeholder = 'Resposta da questão aparecerá aqui...';
    responseArea.style.width = 'calc(100% - 20px)';
    responseArea.style.height = '80px';
    responseArea.style.margin = '10px 0';
    responseArea.style.padding = '10px';
    responseArea.style.backgroundColor = '#3e4451';
    responseArea.style.border = '1px solid #61afef';
    responseArea.style.borderRadius = '5px';
    responseArea.style.color = '#abb2bf';
    responseArea.style.resize = 'vertical';
    responseArea.style.boxSizing = 'border-box';
    panel.appendChild(responseArea);

    // Botões e suas ações
    createButton('Fechar Painel', function() { panel.remove(); }, 'Esc'); // Usaremos Esc para fechar o painel
    createButton('Pegar Resposta (Seleção)', function() {
        var selectedText = window.getSelection().toString().trim();
        if (selectedText) {
            responseArea.value = selectedText;
            console.log('Texto selecionado pego:', selectedText);
        } else {
            responseArea.value = 'Nenhum texto selecionado.';
            console.log('Nenhum texto selecionado para pegar.');
        }
    }, '2');
    createButton('Voltar', function() { history.back(); }, '1');
    createButton('Sair (Fechar Aba)', function() { window.close(); }, '4'); // Esta função raramente funciona devido a seguranca

    document.body.appendChild(panel);

    // Adicionar um ouvinte de evento para teclas
    function handleKeyPress(event) {
        if (event.key === 'Escape') { // Fechar painel com Esc
            panel.remove();
            document.removeEventListener('keydown', handleKeyPress);
            return;
        }

        if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
            return; // Ignorar se Ctrl, Cmd, Alt ou Shift estiverem pressionados
        }

        switch (event.key) {
            case '1':
                history.back();
                console.log('Voltar');
                break;
            case '2':
                // Simular "Pegar Resposta" - neste exemplo, copia o texto selecionado
                var selectedText = window.getSelection().toString().trim();
                if (selectedText) {
                    responseArea.value = selectedText;
                    console.log('Texto selecionado pego:', selectedText);
                } else {
                    responseArea.value = 'Nenhum texto selecionado.';
                    console.log('Nenhum texto selecionado para pegar.');
                }
                break;
            case '3':
                // "Fechar Aba" (window.close()) - raramente funciona para abas não abertas por script
                alert('A função "Fechar Aba" (Tecla 3) geralmente é bloqueada por segurança do navegador, a menos que a aba tenha sido aberta por um script.');
                // window.close(); // Descomente para testar, mas provavelmente não funcionará.
                console.log('Tentativa de fechar aba.');
                break;
            case '4':
                // "Sair" - aqui configurado para fechar o painel, pois fechar aba é problemático.
                panel.remove();
                document.removeEventListener('keydown', handleKeyPress);
                console.log('Sair (Painel fechado)');
                break;
            default:
                break;
        }
    }

    document.addEventListener('keydown', handleKeyPress);

    console.log('Painel Salada do Futuro carregado!');
})();
