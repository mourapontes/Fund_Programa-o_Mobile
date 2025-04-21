// Variáveis globais
let currentSlide = 0;
let track;
let slides;
let totalSlides;
let quizForm;
let quizResult;
let selectedQuestions = [];

// Banco de questões
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
  setupEventListeners();
  updateCarousel();
});

function initializeElements() {
  track = document.getElementById("track");
  slides = document.querySelectorAll(".slide");
  totalSlides = slides.length;
  quizForm = document.getElementById("quiz-form");
  quizResult = document.getElementById("quiz-result");
}

function setupEventListeners() {
  // Botões de navegação
  document.querySelectorAll('.nav-buttons button').forEach(button => {
    button.addEventListener('click', (e) => {
      const direction = e.target.textContent.includes('Anterior') ? -1 : 1;
      navigate(direction);
    });
  });
  
  // Botões "Iniciar Quiz"
  document.querySelectorAll('.quiz-start-btn').forEach(button => {
    button.addEventListener('click', startQuiz);
  });
}

function startQuiz() {
  selectedQuestions = getRandomQuestions();
  const quizSlideIndex = Array.from(slides).findIndex(slide => slide.id === 'quiz-slide');
  goToSlide(quizSlideIndex);
}

function getRandomQuestions() {
  const shuffled = [...questionsPool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 5);
}

function buildQuiz() {
  quizForm.innerHTML = "";
  
  selectedQuestions.forEach((q, idx) => {
    const questionEl = document.createElement("div");
    questionEl.className = "question";
    
    const title = document.createElement("p");
    title.className = "quiz-question";
    title.textContent = `${idx + 1}. ${q.q}`;
    questionEl.appendChild(title);
    
    q.options.forEach((opt, i) => {
      const label = document.createElement("label");
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = `q${idx}`;
      radio.value = i;
      
      label.appendChild(radio);
      label.appendChild(document.createTextNode(` ${opt}`));
      questionEl.appendChild(label);
    });
    
    quizForm.appendChild(questionEl);
  });

  // Botão de finalizar sempre visível
  const submitBtn = document.createElement("button");
  submitBtn.className = "btn btn-primary";
  submitBtn.textContent = "Finalizar Quiz";
  submitBtn.type = "button";
  submitBtn.addEventListener("click", submitQuiz);
  quizForm.appendChild(submitBtn);

  // Permitir navegação livre durante o quiz
  enableNavigation();
}

function submitQuiz() {
  const results = calculateResults();
  displayResults(results);
  const resultSlideIndex = Array.from(slides).findIndex(slide => slide.id === 'result-slide');
  goToSlide(resultSlideIndex);
}

function calculateResults() {
  let score = 0;
  const results = [];
  
  selectedQuestions.forEach((q, i) => {
    const selected = document.querySelector(`input[name="q${i}"]:checked`);
    const userAnswer = selected ? parseInt(selected.value) : null;
    const isCorrect = userAnswer === q.answer;
    
    if (isCorrect) score++;
    
    results.push({
      question: q.q,
      userAnswer: userAnswer !== null ? q.options[userAnswer] : 'Não respondida',
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
    <h2><i class="fas fa-chart-bar"></i> Resultado do Quiz</h2>
    <div class="results-container">
  `;
  
  results.details.forEach((res, i) => {
    html += `
      <div class="question-result ${res.isCorrect ? 'correct' : 'incorrect'}">
        <p class="question-text"><strong>${i + 1}. ${res.question}</strong></p>
        <p class="user-answer">Sua resposta: ${res.userAnswer}</p>
        <p class="correct-answer">Resposta correta: ${res.correctAnswer}</p>
        <p class="result-status">${res.isCorrect ? '✓ Acertou' : '✗ Errou'}</p>
      </div>
    `;
  });
  
  const percentage = (results.score / results.total) * 100;
  let message;
  
  if (percentage >= 80) {
    message = `🎉 Excelente! Você acertou ${results.score} de ${results.total} questões!`;
  } else if (percentage >= 50) {
    message = `👍 Bom trabalho! Você acertou ${results.score} de ${results.total} questões.`;
  } else {
    message = `✏️ Você acertou ${results.score} de ${results.total} questões. Continue estudando!`;
  }
  
  html += `
    </div>
    <div class="final-score">
      <h3>${message}</h3>
      <button onclick="goToSlide(0)" class="btn btn-success">
        <i class="fas fa-home"></i> Voltar ao Início
      </button>
    </div>
  `;
  
  quizResult.innerHTML = html;
}

function enableNavigation() {
  const nextBtn = document.querySelector('.nav-buttons button:nth-child(2)');
  if (nextBtn) {
    nextBtn.disabled = false;
    nextBtn.style.opacity = '1';
    nextBtn.style.cursor = 'pointer';
  }
}

function navigate(direction) {
  currentSlide = (currentSlide + direction + totalSlides) % totalSlides;
  updateCarousel();
}

function goToSlide(index) {
  if (index >= 0 && index < totalSlides) {
    currentSlide = index;
    updateCarousel();
    
    if (slides[currentSlide].id === 'quiz-slide') {
      buildQuiz();
    }
  }
}

function updateCarousel() {
  const slideWidth = track.clientWidth;
  track.style.transform = `translateX(-${currentSlide * slideWidth}px)`;
  
  slides.forEach((slide, index) => {
    slide.classList.toggle('active', index === currentSlide);
  });
}

window.addEventListener("resize", updateCarousel);
