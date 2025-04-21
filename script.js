// Variáveis globais
let currentSlide = 0;
let track;
let slides;
let totalSlides;
let quizForm;
let quizResult;
let selectedQuestions = [];

// Referências aos botões de navegação (adicione estas linhas)
let prevButton;
let nextButton;

// Banco de questões (mantido igual)
const questionsPool = [
  { q: "Qual linguagem é usada no Android?", options: ["Swift", "Kotlin", "Objective-C"], answer: 1 },
  { q: "O que é Flutter?", options: ["Linguagem", "Framework", "IDE"], answer: 1 },
  { q: "Qual ferramenta é usada para iOS?", options: ["Android Studio", "VS Code", "Xcode"], answer: 2 },
  { q: "MVVM é um exemplo de:", options: ["Linguagem", "Framework", "Arquitetura"], answer: 2 },
  { q: "React Native usa qual linguagem?", options: ["Java", "Dart", "JavaScript"], answer: 2 },
  { q: "Kotlin é usado em:", options: ["iOS", "Android", "Web"], answer: 1 },
  { q: "Xcode é exclusivo do:", options: ["Android", "Linux", "macOS"], answer: 2 },
  { q: "Figma ajuda com:", options: ["Desenvolvimento", "Design", "Testes"], answer: 1 },
  { q: "onCreate() pertence a:", options: ["iOS", "Ciclo Android", "Design"], answer: 1 },
  { q: "Emulador simula:", options: ["Interface", "Banco", "Dispositivo"], answer: 2 }
];

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  initializeElements();
  // setupEventListeners(); // Remova ou ajuste se estiver usando onclick no HTML
  updateCarousel(); // Chama a atualização inicial (que agora inclui botões)
});

function initializeElements() {
  track = document.getElementById("track");
  slides = document.querySelectorAll(".slide");
  totalSlides = slides.length;
  quizForm = document.getElementById("quiz-form");
  quizResult = document.getElementById("quiz-result");

  // Guarda referências aos botões de navegação (adicione estas linhas)
  const navButtons = document.querySelectorAll('.nav-buttons button');
  if (navButtons.length === 2) {
    prevButton = navButtons[0];
    nextButton = navButtons[1];
  } else {
      console.error("Botões de navegação não encontrados como esperado.");
  }
}

// Remova ou comente esta função se estiver usando onclick="" no HTML para evitar duplicidade
/*
function setupEventListeners() {
  // ... listeners ...
}
*/


function startQuiz() {
  selectedQuestions = getRandomQuestions();
  // Calcula o índice do slide do quiz dinamicamente
  const quizSlideIndex = Array.from(slides).findIndex(slide => slide.id === 'quiz-slide');
  if (quizSlideIndex !== -1) {
      goToSlide(quizSlideIndex);
  } else {
      console.error("Slide do quiz não encontrado!");
  }
}

function getRandomQuestions() {
  const shuffled = [...questionsPool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 5); // Pega 5 questões
}

function buildQuiz() {
  quizForm.innerHTML = ""; // Limpa o formulário anterior

  selectedQuestions.forEach((q, idx) => {
    const questionEl = document.createElement("div");
    questionEl.className = "question";

    const title = document.createElement("p");
    title.className = "quiz-question"; // Mantenha ou remova a classe se não usar
    title.innerHTML = `<strong>${idx + 1}. ${q.q}</strong>`; // Usa innerHTML para negrito
    questionEl.appendChild(title);

    const optionsDiv = document.createElement('div'); // Cria div para as opções
    optionsDiv.className = 'quiz-options'; // Adiciona classe para estilização

    q.options.forEach((opt, i) => {
      const label = document.createElement("label");
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = `q${idx}`;
      radio.value = i;
      radio.required = true; // Torna a resposta obrigatória

      label.appendChild(radio);
      // Adiciona um espaço antes do texto da opção
      label.appendChild(document.createTextNode(` ${opt}`));
      optionsDiv.appendChild(label); // Adiciona label na div de opções
    });

    questionEl.appendChild(optionsDiv); // Adiciona a div de opções ao container da questão
    quizForm.appendChild(questionEl);
  });

  // Adiciona o botão de finalizar DENTRO do formulário
  const submitBtn = document.createElement("button");
  submitBtn.type = "submit"; // MUITO IMPORTANTE: Mude para type="submit"
  submitBtn.className = "btn"; // Use classes CSS genéricas ou específicas
  submitBtn.textContent = "Finalizar Quiz";
  // Não precisa de event listener aqui, o submit do form vai cuidar disso
  quizForm.appendChild(submitBtn);

  // Adiciona um event listener para o SUBMIT do formulário
  quizForm.onsubmit = function(event) {
      event.preventDefault(); // Previne o recarregamento da página
      submitQuiz();         // Chama a função para processar o quiz
  };

  // Reabilita a navegação geral se necessário (embora já deva estar habilitada)
   enableNavigation(); // Garante que os botões gerais estejam ok
}


function submitQuiz() {
  const results = calculateResults();
  displayResults(results);
  // Calcula o índice do slide de resultado dinamicamente
  const resultSlideIndex = Array.from(slides).findIndex(slide => slide.id === 'result-slide');
   if (resultSlideIndex !== -1) {
      goToSlide(resultSlideIndex);
   } else {
       console.error("Slide de resultado não encontrado!");
   }
}


function calculateResults() {
  let score = 0;
  const results = [];

  selectedQuestions.forEach((q, i) => {
    // Encontra o input radio checado para a questão i
    const selectedInput = quizForm.querySelector(`input[name="q${i}"]:checked`);
    const userAnswerIndex = selectedInput ? parseInt(selectedInput.value) : null;
    const isCorrect = userAnswerIndex === q.answer;

    if (isCorrect) score++;

    results.push({
      question: q.q,
      userAnswer: userAnswerIndex !== null ? q.options[userAnswerIndex] : 'Não respondida',
      correctAnswer: q.options[q.answer],
      isCorrect
    });
  });

  return {
    score,
    total: selectedQuestions.length,
    details: results
  };
}


function displayResults(results) {
    let html = `
    <div class="results-container"> <!-- Container para estilização -->
  `; // Começa o container dos resultados

  results.details.forEach((res, i) => {
    html += `
      <div class="question-result ${res.isCorrect ? 'correct' : 'incorrect'}">
        <p><strong>${i + 1}. ${res.question}</strong></p>
        <p>Sua resposta: ${res.userAnswer}</p>
        ${!res.isCorrect ? `<p class="correct-answer">Resposta correta: ${res.correctAnswer}</p>` : ''}
        <p class="result-status">${res.isCorrect ? '<i class="fas fa-check"></i> Acertou!' : '<i class="fas fa-times"></i> Errou!'}</p>
      </div>
    `;
  });

  const percentage = results.total > 0 ? (results.score / results.total) * 100 : 0;
  let message;

  if (percentage === 100) {
      message = `🎉 Perfeito! Você acertou todas as ${results.total} questões!`;
  } else if (percentage >= 70) {
    message = `👍 Muito bem! Você acertou ${results.score} de ${results.total} (${percentage.toFixed(0)}%)!`;
  } else if (percentage >= 50) {
    message = `🙂 Bom esforço! Você acertou ${results.score} de ${results.total} (${percentage.toFixed(0)}%).`;
  } else {
    message = `🤔 Continue estudando! Você acertou ${results.score} de ${results.total} (${percentage.toFixed(0)}%).`;
  }

  // Adiciona o placar final e o botão de voltar ao início
  html += `
    </div> <!-- Fim do results-container -->
    <div class="final-score">
      <h3>${message}</h3>
      <button onclick="goToSlide(0)" class="return-btn">
          <i class="fas fa-redo"></i> Refazer Quiz / Voltar ao Início
      </button>
    </div>
  `;

  quizResult.innerHTML = html; // Insere o HTML gerado na div de resultado
}


// Função para garantir que a navegação esteja habilitada (se necessário)
function enableNavigation() {
  // Esta função pode não ser estritamente necessária se updateNavigationButtons
  // já cuida do estado dos botões corretamente.
  // Se precisar forçar a habilitação em algum ponto específico, faça aqui.
  // Exemplo:
  // if (nextButton) nextButton.disabled = false;
  // if (prevButton) prevButton.disabled = false;
}

function navigate(direction) {
    // Verifica se o botão correspondente está desabilitado antes de navegar
    const targetButton = direction === 1 ? nextButton : prevButton;
    if (targetButton && targetButton.disabled) {
        console.log("Navegação ignorada: botão desabilitado.");
        return; // Sai da função se o botão estiver desabilitado
    }

    currentSlide = (currentSlide + direction + totalSlides) % totalSlides;
    updateCarousel();
}

function goToSlide(index) {
  if (index >= 0 && index < totalSlides) {
    currentSlide = index;
    updateCarousel(); // Atualiza o slide e os botões

    // Se estiver navegando PARA o slide do quiz, constrói o quiz
    if (slides[currentSlide].id === 'quiz-slide') {
      buildQuiz();
    }
  } else {
      console.warn(`Tentativa de ir para slide inválido: ${index}`);
  }
}

// ****** NOVA FUNÇÃO para atualizar estado dos botões ******
function updateNavigationButtons() {
    if (!prevButton || !nextButton) return; // Sai se os botões não foram encontrados

    const conclusionSlideIndex = totalSlides - 3; // Índice da conclusão
    const quizSlideIndex = totalSlides - 2;       // Índice do quiz
    const resultSlideIndex = totalSlides - 1;     // Índice do resultado

    // Habilita/Desabilita botão "Anterior"
    if (currentSlide === 0) {
        prevButton.disabled = true;
        prevButton.style.opacity = '0.5';
        prevButton.style.cursor = 'not-allowed';
    } else {
        prevButton.disabled = false;
        prevButton.style.opacity = '1';
        prevButton.style.cursor = 'pointer';
    }

    // Habilita/Desabilita botão "Próximo"
    // Desabilita na Conclusão, Quiz e Resultado
    if (currentSlide >= conclusionSlideIndex) {
        nextButton.disabled = true;
        nextButton.style.opacity = '0.5';
        nextButton.style.cursor = 'not-allowed';
    } else {
        nextButton.disabled = false;
        nextButton.style.opacity = '1';
        nextButton.style.cursor = 'pointer';
    }
}

function updateCarousel() {
  const slideWidth = track.clientWidth; // Pega a largura atual do contêiner
  // Verifica se a largura é válida antes de aplicar a transformação
  if (slideWidth > 0) {
      track.style.transform = `translateX(-${currentSlide * slideWidth}px)`;
  } else {
      console.warn("Largura do track é 0, adiando transform.");
      // Pode ser necessário re-chamar updateCarousel após um pequeno delay ou no resize
      // requestAnimationFrame(() => updateCarousel()); // Uma opção
  }

  // Atualiza a classe 'active' em todos os slides
  slides.forEach((slide, index) => {
    slide.classList.toggle('active', index === currentSlide);
  });

  // ****** CHAMA A ATUALIZAÇÃO DOS BOTÕES ******
  updateNavigationButtons();
}

// Adiciona listener para resize para recalcular a posição se a tela mudar
window.addEventListener("resize", () => {
    // Apenas chama updateCarousel, que já pega a nova clientWidth
    updateCarousel();
});
