javascript:(function(){
  // Cria painel
  let panel = document.createElement('div');
  panel.style.position = 'fixed';
  panel.style.bottom = '20px';
  panel.style.right = '20px';
  panel.style.padding = '10px';
  panel.style.backgroundColor = 'white';
  panel.style.border = '2px solid black';
  panel.style.zIndex = 9999;
  panel.innerHTML = `
    <b>Painel Mini</b><br>
    1 - Voltar<br>
    2 - Pegar Resposta<br>
    3 - Fechar<br>
    4 - Sair
  `;
  document.body.appendChild(panel);

  // Função fictícia que simula IA retornando resposta
  async function pegarResposta(questao, alternativas){
    // Aqui você chamaria sua API do Gemini
    // Exemplo: fetch('https://api.gemini/ask', {method:'POST', body: JSON.stringify({questao, alternativas})})
    // Retorna alternativa correta
    return alternativas[0]; // só retorna a primeira como placeholder
  }

  // Detecta questões na tela
  function detectarQuestoes(){
    let questoes = [];
    document.querySelectorAll('.questao').forEach(q=>{
      let texto = q.querySelector('.pergunta')?.innerText;
      let alt = Array.from(q.querySelectorAll('.alternativa')).map(a=>a.innerText);
      if(texto && alt.length) questoes.push({texto, alt, element:q});
    });
    return questoes;
  }

  // Atalhos de teclado
  document.addEventListener('keydown', async e=>{
    let questoes = detectarQuestoes();
    if(e.key === '1'){ alert('Voltar'); }
    else if(e.key === '2'){ 
      for(let q of questoes){
        let resp = await pegarResposta(q.texto, q.alt);
        console.log('Resposta sugerida:', resp);
        // Aqui você pode automatizar clique no botão da alternativa:
        // q.element.querySelector(`.alternativa:contains("${resp}")`)?.click();
      }
      alert('Respostas processadas!');
    }
    else if(e.key === '3'){ panel.remove(); }
    else if(e.key === '4'){ window.close(); }
  });
})();
