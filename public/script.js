document.addEventListener('DOMContentLoaded', function () {
  const hambtn = document.getElementById('hambtn');
  const mainnav = document.getElementById('mainnav');
  if(hambtn && mainnav){
    hambtn.addEventListener('click', function(){
      // Toggle a simple class to show/hide the nav (CSS should handle the rest)
      mainnav.classList.toggle('open');
    });
  }
});

/* ---------- Trivia Quiz (used only on mini-game.html) ---------- */
/* All quiz code is encapsulated under the `ValorantQuiz` namespace */
const ValorantQuiz = (function(){

  // Quiz questions
  const quizData = [
    { q: "Which role uses smokes and area denial primarily?", choices:["Duelist","Controller","Initiator","Sentinel"], a:1 },
    { q: "How many players per team in a standard match?", choices:["3","4","5","6"], a:2 },
    { q: "Which agent can resurrect teammates?", choices:["Sage","Jett","Raze","Omen"], a:0 },
    { q: "What is the highest competitive rank?", choices:["Immortal","Radiant","Diamond","Platinum"], a:1 },
    { q: "Which agent uses recon arrows?", choices:["Sova","Viper","Killjoy","Brimstone"], a:0 }
  ];

  let idx = 0;
  let score = 0;
  let elements = null;
  const nickname = localStorage.getItem('nickname') || 'Player';

  // Cache selectors once
  function cacheSelectors(){
    elements = {
      qElm: document.getElementById('question'),
      aElm: document.getElementById('answers'),
      resElm: document.getElementById('result'),
      nextBtn: document.getElementById('next'),
      restartBtn: document.getElementById('restart'),
      playerNameElm: document.getElementById('playerName')
    };
    // Initialize player name display (uses the localStorage from earlier :)
    elements.playerNameElm.textContent = `${nickname}, your current score: 0 / ${quizData.length}`;
  }

  // Load question i
  function loadQuestion(i){
    elements.resElm.textContent = '';
    elements.aElm.innerHTML = '';
    const item = quizData[i];
    elements.qElm.textContent = `${i+1}. ${item.q}`;
    item.choices.forEach((c, ci) => {
      const btn = document.createElement('button');
      btn.className = 'answer-btn';
      btn.textContent = c;
      btn.addEventListener('click', function(){ selectAnswer(ci, item.a, btn); });
      elements.aElm.appendChild(btn);
    });
  }

  // Handle answer selection
  function selectAnswer(choiceIndex, correctIndex, btn){
    const buttons = Array.from(elements.aElm.querySelectorAll('button'));
    buttons.forEach(b => b.disabled = true);
    if(choiceIndex === correctIndex){
      btn.style.borderColor = 'rgba(0,255,150,0.18)';
      elements.resElm.textContent = 'Correct!';
      score++;
    } else {
      btn.style.borderColor = 'rgba(255,80,80,0.16)';
      elements.resElm.textContent = `Incorrect — correct: ${quizData[idx].choices[correctIndex]}`;
    }
    // Update current score display
    elements.playerNameElm.textContent = `${nickname}, current score: ${score} / ${quizData.length}`;
  }

  // Wire next and restart buttons
  function wireButtons(){
    elements.nextBtn.addEventListener('click', function(){
      idx++;
      if(idx >= quizData.length){
        elements.resElm.textContent = `${nickname}, you got a score of ${score} / ${quizData.length}`;
        elements.nextBtn.disabled = true;
      } else {
        loadQuestion(idx);
      }
      // Always update score display even during quiz
      elements.playerNameElm.textContent = `${nickname}, current score: ${score} / ${quizData.length}`;
    });

    elements.restartBtn.addEventListener('click', function(){
      idx = 0; score = 0;
      elements.nextBtn.disabled = false;
      loadQuestion(0);
      elements.resElm.textContent = '';
      elements.playerNameElm.textContent = `${nickname}, your current score: 0 / ${quizData.length}`;
    });
  }

  // Public init method
  function init(){
    cacheSelectors();
    loadQuestion(0);
    wireButtons();
  }

  // Expose only init
  return { init: init };

})();

/* ---------- Agents Favorites and Notes (used only on agents.html) ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector(".grid-index");
  if (!grid) return; // Only run on pages with .grid-index

  const cards = document.querySelectorAll(".card, .card2");

  // CRUD Data Manager
  const DataManager = {
    favorites: JSON.parse(localStorage.getItem("valofy_favorites")) || [],
    notes: JSON.parse(localStorage.getItem("valofy_notes")) || {},

    // CREATE
    addFavorite(agent) {
      if (!this.favorites.includes(agent)) {
        this.favorites.push(agent);
        this.save();
      }
    },

    addNote(agent, text) {
      this.notes[agent] = text;
      this.save();
    },

    // READ
    isFavorite(agent) {
      return this.favorites.includes(agent);
    },

    getNote(agent) {
      return this.notes[agent] || "";
    },

    getAllFavorites() {
      return [...this.favorites];
    },

    getAllNotes() {
      return { ...this.notes };
    },

    // UPDATE
    updateNote(agent, text) {
      this.notes[agent] = text;
      this.save();
    },

    // DELETE
    removeFavorite(agent) {
      this.favorites = this.favorites.filter(a => a !== agent);
      this.save();
    },

    clearNote(agent) {
      delete this.notes[agent];
      this.save();
    },

    clearAllFavorites() {
      this.favorites = [];
      this.save();
    },

    clearAllNotes() {
      this.notes = {};
      this.save();
    },

    // PERSIST
    save() {
      localStorage.setItem("valofy_favorites", JSON.stringify(this.favorites));
      localStorage.setItem("valofy_notes", JSON.stringify(this.notes));
    },

    // EXPORT/IMPORT
    exportData() {
      return {
        favorites: this.favorites,
        notes: this.notes,
        exportDate: new Date().toISOString()
      };
    },

    importData(data) {
      if (data.favorites) this.favorites = data.favorites;
      if (data.notes) this.notes = data.notes;
      this.save();
    }
  };

  // Initialize cards with CRUD operations
  cards.forEach(card => {
    const titleElm = card.querySelector("h3");
    const agent = card.dataset.agent || titleElm?.textContent.trim();
    if (!agent) return;
    if (!card.dataset.agent) card.dataset.agent = agent;

    let favBtn = card.querySelector(".fav-btn");
    let noteInput = card.querySelector(".note-input");
    let clearBtn = card.querySelector(".clear-notes-btn");
    let buttonGroup = card.querySelector(".button-group");

    if (!buttonGroup) {
      buttonGroup = document.createElement("div");
      buttonGroup.className = "button-group";
      card.insertBefore(buttonGroup, card.firstChild);
    }

    if (!favBtn) {
      favBtn = document.createElement("button");
      favBtn.className = "fav-btn";
      favBtn.textContent = "☆ Favorite";
      buttonGroup.appendChild(favBtn);
    } else if (favBtn.parentNode !== buttonGroup) {
      buttonGroup.appendChild(favBtn);
    }

    if (!clearBtn) {
      clearBtn = document.createElement("button");
      clearBtn.className = "clear-notes-btn";
      clearBtn.title = "Clear notes";
      clearBtn.textContent = "✕";
      buttonGroup.appendChild(clearBtn);
    } else if (clearBtn.parentNode !== buttonGroup) {
      buttonGroup.appendChild(clearBtn);
    }

    if (!noteInput) {
      noteInput = document.createElement("textarea");
      noteInput.className = "note-input";
      noteInput.placeholder = "Add notes...";
      card.appendChild(noteInput);
    }

    // LOAD (READ)
    if (DataManager.isFavorite(agent)) {
      card.classList.add("favorited");
      favBtn.textContent = "★ Favorited";
    }

    const noteText = DataManager.getNote(agent);
    if (noteText) {
      noteInput.value = noteText;
    }

    // Favorite button - CREATE/DELETE
    favBtn.addEventListener("click", () => {
      if (DataManager.isFavorite(agent)) {
        DataManager.removeFavorite(agent);
        card.classList.remove("favorited");
        favBtn.textContent = "☆ Favorite";
      } else {
        DataManager.addFavorite(agent);
        card.classList.add("favorited");
        favBtn.textContent = "★ Favorited";
      }
      sortCards();
    });

    // Notes textarea - CREATE/UPDATE
    noteInput.addEventListener("input", () => {
      DataManager.updateNote(agent, noteInput.value);
    });

    // Clear notes button - DELETE
    clearBtn.addEventListener("click", () => {
      if (confirm(`Clear notes for ${agent}?`)) {
        DataManager.clearNote(agent);
        noteInput.value = "";
      }
    });
  });

  function sortCards() {
    const cardsArray = Array.from(cards);
    const favorites = DataManager.getAllFavorites();

    cardsArray.sort((a, b) => {
      return favorites.includes(b.dataset.agent) - favorites.includes(a.dataset.agent);
    });

    cardsArray.forEach(card => grid.appendChild(card));
  }

  sortCards();

  // Expose DataManager globally for debugging/manual operations
  window.ValorantDataManager = DataManager;
});