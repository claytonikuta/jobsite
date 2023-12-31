"use strict"

const game = {
  title: "Jobsite",
  isRunning: false,
  wasRunning: false,
  palletCarry: false,
  loopDuration: 50,
  direction: 'up',
  difficulty: '',
  duration: 60000,
  timeLeft: 0,
  state: '',
  currentScreen: "#splash-screen",
  playButton: document.getElementById("play-button"),
  pauseButton: document.getElementById("pause-button"),
  playerInput: document.getElementById("player-input"),
  startGameButton: document.getElementById("start-button"),
  easyButton: document.getElementById("easy-button"),
  mediumButton: document.getElementById("medium-button"),
  hardButton: document.getElementById("hard-button"),
  playerNameDisplay: document.getElementsByClassName("player-name"),
  playerScoreDisplay: document.getElementsByClassName("player-score"),

  showGameScreen(screenId) {
    $("#splash-screen").hide();
    $("#game-screen").hide();
    $("#game-over-screen").hide();
    $(screenId).show();
    this.currentScreen = screenId;

    if (screenId === "#game-screen") {
      overlay.style.display = 'flex';
      overlay.style.opacity = '0.5';
      document.getElementById("game-screen").style.display = "flex";
      $("#start-game").show();
      game.playButton.style.zIndex = 0;
      game.pauseButton.style.zIndex = 0;
      $("#end-button").show();
      $("#help-modal-trigger").show();
      $("#screen-container").css({
        'background': 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("../images/Caution_Background.jpeg")',
        'background-size': 'cover'
      })
      $("#forklift").css({
        'top': '0px',
        'left': '-120px',
        'height': '50px',
        'width': '35px',
        'transform': 'rotate(0deg)'
      });
      forklift.setAttribute('src', '../images/Forklift.svg');
      player.score = 0;
      game.updatePlayerScore(player.score);
      this.spawnPallet();
      this.loadObstacles();
    } else if (screenId === "#game-over-screen") {
      game.duration = 30000;
      document.getElementById("timer").textContent = (game.duration/1000).toFixed(0);
      $("#help-modal-trigger").hide();
      $("#end-button").hide();
      document.getElementById("game-over-screen").style.display = "flex";
      const playerName = player.name;
      const playerScore = player.score;
      document.querySelector("#game-over-player .player-name").textContent = playerName;
      document.querySelector("#game-over-player .player-score").textContent = playerScore;
      clearInterval(game.loopIntervalId);
    } else if (screenId === "#splash-screen") {
      game.playerScoreDisplay.textContent = 0;
      $("#end-button").hide();
      $("#help-modal-trigger").show();
      $("#player-input").show();
      $("#screen-container").css({
        'background': 'url("../images/Caution_Background.jpeg")',
        'background-size': 'cover',
        'background-position': 'center',
      });
      $("#name-entry").attr("placeholder", player.name);
      $("#name-entry").removeAttr("required");

      clearInterval(game.loopIntervalId);
    }

    if (this.isRunning) {
      this.gameState();
    }
  },

  updateDifficulty(difficulty) {
    if(difficulty === 'easy'){
      this.easyButton.style.border = 'solid';
      this.mediumButton.style.border = 'transparent';
      this.hardButton.style.border = 'transparent';
      this.difficulty = 'easy';
    }
    else if(difficulty === 'medium'){
      this.easyButton.style.border = 'transparent';
      this.mediumButton.style.border = 'solid white';
      this.hardButton.style.border = 'transparent';
      this.difficulty = 'medium';
    }
    else if(difficulty === 'hard'){
      this.easyButton.style.border = 'transparent';
      this.mediumButton.style.border = 'transparent';
      this.hardButton.style.border = 'solid';
      this.difficulty = 'hard';
    }
    if (this.playerNameDisplay[0].textContent !== '' && this.difficulty !== '') {
      this.startGameButton.removeAttribute('disabled');
    }
  },

  gameStateModal(btn) {
    let previousState = this.isRunning;
  
    if (this.currentScreen === "#splash-screen" && btn === 'help') 
    {
      $("#help-modal").modal("show");
    } 
    else if(btn === 'end'){
      $("#end-modal").modal("show");
    }
    else {
      if (this.wasRunning) {
        this.gameState();
      }
      $("#more-info-modal").modal("show");
    }
  
    $('#help-modal, #more-info-modal, #end-modal').on('hidden.bs.modal', function () {
      if (previousState !== game.isRunning  && game.currentScreen !== '#game-over-screen') {
        game.gameState();
      }
    });
  },

  toggleButtonsOnHelpModal(isModalOpen) {
    if (isModalOpen) {
      $("#play-button").prop("disabled", true);
      $("#pause-button").prop("disabled", true);
      $("#end-button").prop("disabled", true);
    } else {
      $("#play-button").prop("disabled", false);
      $("#pause-button").prop("disabled", false);
      $("#end-button").prop("disabled", false);
    }
  },

  toggleButtonsOnEndModal(isModalOpen) {
    if (isModalOpen) {
      $("#play-button").prop("disabled", true);
      $("#pause-button").prop("disabled", true);
      $("#help-modal-trigger").prop("disabled", true);
    } else {
      $("#play-button").prop("disabled", false);
      $("#pause-button").prop("disabled", false);
      $("#help-modal-trigger").prop("disabled", false);
    }
  },

  gameState() {
    if (!this.isRunning) {
      $("#play-button").hide();
      $("#pause-button").show();
      this.isRunning = true;
      this.wasRunning = true;
      overlay.style.display = 'none';
      game.loopIntervalId = setInterval(this.gameLoop, this.loopDuration);
    } else {
      $("#pause-button").hide();
      $("#play-button").show();
      this.isRunning = false;
      this.wasRunning = false;
      overlay.style.display = 'block';
      overlay.style.opacity = '0.5';
    }
  },

  addPlayer(oPlayer) {
    this.playerNameDisplay[0].textContent = oPlayer;
    if (this.difficulty != ''){
      this.startGameButton.removeAttribute("disabled");
    }
  },

  updatePlayerScore(oPlayer) {
    this.playerScoreDisplay[0].textContent = oPlayer;
  },

  isColliding(rect1, rect2) {
    return (
      rect1.left < rect2.right &&
      rect1.right > rect2.left &&
      rect1.top < rect2.bottom &&
      rect1.bottom > rect2.top
    );
  },

  checkObstacleCollisions(object) {
    const forkliftRect = document.getElementById('forklift').getBoundingClientRect();
    const truckRect = document.getElementById('truck').getBoundingClientRect();
    const palletRect = document.getElementById('pallet').getBoundingClientRect();
    const easyObstacles = [
      document.getElementById('truck').getBoundingClientRect(),
    ];

    const mediumObstacles = [
      document.getElementById('truck').getBoundingClientRect(),
      document.getElementById('shelves1').getBoundingClientRect(),
      document.getElementById('shelves2').getBoundingClientRect(),
      document.getElementById('shelves3').getBoundingClientRect(),
      document.getElementById('shelves4').getBoundingClientRect(),
      document.getElementById('shelves5').getBoundingClientRect(),
      document.getElementById('shelves6').getBoundingClientRect(),
      document.getElementById('shelves7').getBoundingClientRect(),
      document.getElementById('shelves8').getBoundingClientRect(),
    ];

    const hardObstacles = [
      document.getElementById('truck').getBoundingClientRect(),
      document.getElementById('shelves1').getBoundingClientRect(),
      document.getElementById('shelves2').getBoundingClientRect(),
      document.getElementById('shelves3').getBoundingClientRect(),
      document.getElementById('shelves4').getBoundingClientRect(),
      document.getElementById('shelves5').getBoundingClientRect(),
      document.getElementById('shelves6').getBoundingClientRect(),
      document.getElementById('shelves7').getBoundingClientRect(),
      document.getElementById('shelves8').getBoundingClientRect(),
      document.getElementById('box-guy1').getBoundingClientRect(),
      document.getElementById('box-guy2').getBoundingClientRect(),
      document.getElementById('box-guys1').getBoundingClientRect(),
      document.getElementById('box-guys2').getBoundingClientRect(),
      document.getElementById('pallet-guy').getBoundingClientRect(),
    ];
  
    let obstacles = [];

    if (this.difficulty === 'medium') {
      obstacles = mediumObstacles;
    } else if (this.difficulty === 'hard') {
      obstacles = hardObstacles;
    } else {
      obstacles = easyObstacles;
    }

    if (object === 'forklift'){
      for (let i = 0; i < obstacles.length; i++) {
        if (this.isColliding(forkliftRect, truckRect) && this.palletCarry) {
          return 'score';
        }
        if (this.isColliding(forkliftRect, obstacles[i])) {
          return 'hit';
        }
      }
      return 'safe';
    }
    if (object === 'pallet'){
      for (let i = 0; i < obstacles.length; i++) {
        if (this.isColliding(palletRect, obstacles[i])) {
          return 'hit';
        }
      }
      return 'safe';
    }
  },

  loadObstacles() {
    if (this.difficulty === 'easy'){
      $("#shelves1").hide();
      $("#shelves2").hide();
      $("#shelves3").hide();
      $("#shelves4").hide();
      $("#shelves5").hide();
      $("#shelves6").hide();
      $("#shelves7").hide();
      $("#shelves8").hide();
      $("#box-guy1").hide();
      $("#box-guy2").hide();
      $("#box-guys1").hide();
      $("#box-guys2").hide();
      $("#pallet-guy").hide();
    }
    if (this.difficulty === 'medium'){
      $("#shelves1").show();
      $("#shelves2").show();
      $("#shelves3").show();
      $("#shelves4").show();
      $("#shelves5").show();
      $("#shelves6").show();
      $("#shelves7").show();
      $("#shelves8").show();
      $("#box-guy1").hide();
      $("#box-guy2").hide();
      $("#box-guys1").hide();
      $("#box-guys2").hide();
      $("#pallet-guy").hide();
    }
    if (this.difficulty === 'hard'){
      $("#shelves1").show();
      $("#shelves2").show();
      $("#shelves3").show();
      $("#shelves4").show();
      $("#shelves5").show();
      $("#shelves6").show();
      $("#shelves7").show();
      $("#shelves8").show();
      $("#box-guy1").show();
      $("#box-guy2").show();
      $("#box-guys1").show();
      $("#box-guys2").show();
      $("#pallet-guy").show();
    }
  },

  spawnPallet() {
    const pallet = document.getElementById('pallet');
    const truck = document.getElementById('truck');
    
    const truckRect = truck.getBoundingClientRect();
  
    let palletSpawned = false;
    const palletRect = pallet.getBoundingClientRect();
  
    while (!palletSpawned) {
      const randomY = Math.floor(Math.random() * (420)) - 210;
      const randomX = Math.floor(Math.random() * (630)) - 310;    
  
      pallet.style.top = `${randomY}px`;
      pallet.style.left = `${randomX}px`;
  
      const collision = game.checkObstacleCollisions('pallet');
      const palletPosition = pallet.getBoundingClientRect();
  
      if (collision === 'safe' && !game.isColliding(palletPosition, truckRect)) {
        palletSpawned = true;
      }
    }
    $("#pallet").show();
  },
  
  pickUpPallet() {
    const forklift = document.getElementById('forklift');
    const pallet = document.getElementById('pallet');
    
    const forkliftRect = forklift.getBoundingClientRect();
    const palletRect = pallet.getBoundingClientRect();
  
    const forkliftTop = forkliftRect.top;
    const forkliftBottom = forkliftRect.bottom;
    const forkliftLeft = forkliftRect.left;
    const forkliftRight = forkliftRect.right;
  
    const palletTop = palletRect.top;
    const palletBottom = palletRect.bottom;
    const palletLeft = palletRect.left;
    const palletRight = palletRect.right;
  
    if (
      forkliftBottom >= palletTop &&
      forkliftTop <= palletBottom &&
      forkliftRight >= palletLeft &&
      forkliftLeft <= palletRight
    ) {
      return true;
    } else {
      return false;
    }
  },

  gameLoop() {

    if (game.state === 'play') {
      game.duration -= 50;
    }
    document.getElementById("timer").textContent = (game.duration/1000).toFixed(0);
    if (game.duration <= 0){
      game.showGameScreen("#game-over-screen");
    }

    let scoreUpdated = false;
    if (game.pickUpPallet()){
      $("#pallet").hide();
      forklift.setAttribute('src', '../images/Forklift-Loaded.svg');
      $("#forklift").css({
        'height': '60px',
        'width': '45px',
      });
      game.palletCarry = true;
    }
    if (game.checkObstacleCollisions('forklift') === 'score' && game.palletCarry && !scoreUpdated){
      forklift.setAttribute('src', '../images/Forklift.svg');
      $("#forklift").css({
        'height': '50px',
        'width': '35px',
      });
      game.palletCarry = false;
      player.incrementPlayerScore();
      game.spawnPallet();
      scoreUpdated = true;
    }
  },
};

const player = {
  name: '',
  score: 0,
  updatePlayerName(oPlayer){
      this.name = oPlayer;
      game.addPlayer(this.name);
  },
  incrementPlayerScore(oPlayer){
      this.score += 10;
      game.updatePlayerScore(this.score);
  }, 

  moveForkliftUp() {
    const forkliftElement = document.getElementById('forklift');
    const currentPosition = parseInt(window.getComputedStyle(forkliftElement).top);
    const collision = game.checkObstacleCollisions('forklift');
  
    if (currentPosition > -210) {
      const newPosition = currentPosition - 15;
      if (collision === 'safe' || game.direction === 'down') {
        forkliftElement.style.top = `${newPosition}px`;
        game.direction = 'up';
      } 
      else if ((collision === 'hit' || collision === 'score') && game.direction === 'left'){
        forkliftElement.style.top = `${newPosition}px`;
      }
      else if ((collision === 'hit' || collision === 'score') && game.direction === 'right'){
        forkliftElement.style.top = `${newPosition}px`;
      }
      else{
        // forkliftElement.style.top = `${currentPosition + 15}px`;

      }
    }
    forkliftElement.style.transform = 'rotate(0deg)';
  },
  
  moveForkliftDown() {
    const forkliftElement = document.getElementById('forklift');
    const currentPosition = parseInt(window.getComputedStyle(forkliftElement).top);
    const collision = game.checkObstacleCollisions('forklift');

    if (currentPosition < 210) {
      const newPosition = currentPosition + 15;
      
      if (collision === 'safe' || game.direction === 'up') {
        forkliftElement.style.top = `${newPosition}px`;
        game.direction = 'down';
      } 
      else if ((collision === 'hit' || collision === 'score') && game.direction === 'left'){
        forkliftElement.style.top = `${newPosition}px`;
      }
      else if ((collision === 'hit' || collision === 'score') && game.direction === 'right'){
        forkliftElement.style.top = `${newPosition}px`;
      }
      else {
        // forkliftElement.style.top = `${currentPosition - 15}px`;
      }
    }
    forkliftElement.style.transform = 'rotate(180deg)';
  },
  
  moveForkliftLeft() {
    const forkliftElement = document.getElementById('forklift');
    const currentPosition = parseInt(window.getComputedStyle(forkliftElement).left);
    const collision = game.checkObstacleCollisions('forklift');
  
    if (currentPosition > -310) {
      const newPosition = currentPosition - 15;

      if (collision === 'safe' ) {
        forkliftElement.style.left = `${newPosition}px`;
        game.direction = 'left';
      } 
      else if ((collision === 'hit' || collision === 'score') && game.direction === "down"){
        forkliftElement.style.left = `${newPosition}px`;
      }
      else if ((collision === 'hit' || collision === 'score') && game.direction === "up"){
        forkliftElement.style.left = `${newPosition}px`;
      }
      else if ((collision === 'hit' || collision === 'score') && game.direction === "right"){
        forkliftElement.style.left = `${newPosition}px`;
      }
      else if((collision === 'hit' || collision === 'score') && game.direction === "left"){
        // forkliftElement.style.left = `${currentPosition + 15}px`;
      }
    }
    forkliftElement.style.transform = 'rotate(-90deg)';
  },
  
  moveForkliftRight() {
    const forkliftElement = document.getElementById('forklift');
    const currentPosition = parseInt(window.getComputedStyle(forkliftElement).left);
    const collision = game.checkObstacleCollisions('forklift');

    if(currentPosition < 320){
      const newPosition = currentPosition + 15;
      
      if (collision === 'safe' ) {
        forkliftElement.style.left = `${newPosition}px`;
        game.direction = 'right';
      } 
      else if ((collision === 'hit' || collision === 'score') && game.direction === "down"){
        forkliftElement.style.left = `${newPosition}px`;
      }
      else if ((collision === 'hit' || collision === 'score') && game.direction === "up"){
        forkliftElement.style.left = `${newPosition}px`;
      }
      else if ((collision === 'hit' || collision === 'score') && game.direction === "left"){
        forkliftElement.style.left = `${newPosition}px`;
      }
      else {
        // forkliftElement.style.left = `${currentPosition - 15}px`;
      }
    }
    forkliftElement.style.transform = 'rotate(90deg)';
  },
}

/*Event listeners*/

document.getElementById("player-input").addEventListener('submit', (event) => {
  event.preventDefault();
  const nameUpdate = document.getElementById("name-entry");
  if (nameUpdate.value !== "") {
    player.updatePlayerName(nameUpdate.value);
    nameUpdate.value = "";
    game.playerInput.style.display = "none";
  }
});

document.getElementById("easy-button").addEventListener("click", () => {
  game.updateDifficulty('easy');
});

document.getElementById("medium-button").addEventListener("click", () => {
  game.updateDifficulty('medium');
});

document.getElementById("hard-button").addEventListener("click", () => {
  game.updateDifficulty('hard');
});

document.addEventListener('keydown', (event) => {
    if (game.currentScreen === '#game-screen' && game.isRunning) {
    switch (event.key) {
      case 'ArrowLeft':
        player.moveForkliftLeft();
        break;
      case 'ArrowRight':
        player.moveForkliftRight();
        break;
      case 'ArrowUp':
        player.moveForkliftUp();
        break;
      case 'ArrowDown':
        player.moveForkliftDown();
        break;
      default:
        break;
    }
  }
});

$("#help-modal-trigger").on("click", () => {
  game.gameStateModal('help');
  game.toggleButtonsOnHelpModal(true);
});

$("#more-info-modal-trigger").on("click", () => {
  $("#more-info-modal").modal("show");
});

$('#help-modal, #more-info-modal').on('hidden.bs.modal', function () {
  game.toggleButtonsOnHelpModal(false);
});

$("#start-game").on("click", () => {
  $("#start-game").hide();
  game.playButton.style.zIndex = 9999;
  game.pauseButton.style.zIndex = 9999;
  game.gameState();
});

$("#play-button").on("click", () => {
  game.state = 'play';
  game.gameState();
});

$("#pause-button").on("click", () => {
  game.state = 'pause';
  game.gameState();
});

$("#start-button").on("click", () => {
  game.state = 'play';
  game.showGameScreen("#game-screen");
});

$("#end-button").on("click", () => {
  game.gameStateModal('end');
  game.toggleButtonsOnEndModal(true);
});

$('#end-modal').on('hidden.bs.modal', function () {
  game.toggleButtonsOnEndModal(false);
});

$("#end-to-game-over-button").on("click", () => {
  game.showGameScreen("#game-over-screen");
});

$("#quit-btn").on("click", () => {
  game.showGameScreen("#splash-screen");
});

$("#play-again-btn").on("click", () => {
  game.showGameScreen("#game-screen");
});
