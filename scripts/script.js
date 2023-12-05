"use strict"

const game = {
  title: "Jobsite",
  isRunning: false,
  wasRunning: false,
  palletCarry: false,
  loopDuration: 50,
  direction: 'up',
  playerInput: document.getElementById("player-input"),
  startGameButton: document.getElementById("start-button"),
  playerNameDisplay: document.getElementById("player-name"),
  playerScoreDisplay: document.getElementById("player-score"),
  gOPlayerNameDisplay: document.getElementById("game-over-player-name"),
  gOPlayerScoreDisplay: document.getElementById("game-over-player-score"),
  currentScreen: "#splash-screen",

  showGameScreen(screenId) {
    $("#splash-screen").hide();
    $("#game-screen").hide();
    $("#game-over-screen").hide();
    $(screenId).show();
    this.currentScreen = screenId;

    if (screenId === "#game-screen") {
      overlay.style.display = 'block';
      overlay.style.opacity = '0.5';
      document.getElementById("game-screen").style.display = "flex";
      $("#end-button").show();
      $("#help-modal-trigger").show();
      $("#screen-container").css({
        'background': 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("../images/Caution_Background.jpeg")',
        'background-size': 'cover'
      })
      $("#forklift").css({
        'top': '0px',
        'left': '0px',
        'transform': 'rotate(0deg)'
      });
      this.spawnPallet();
    } else if (screenId === "#game-over-screen") {
      this.gOPlayerNameDisplay.textContent = this.playerNameDisplay;
      this.gOPlayerScoreDisplay.textContent = this.playerScoreDisplay;
      $("#help-modal-trigger").hide();
      $("#end-button").hide();
      document.getElementById("game-over-screen").style.display = "flex";
      clearInterval(game.loopIntervalId);
    } else if (screenId === "#splash-screen") {
      game.playerScoreDisplay.textContent = 0;
      $("#end-button").hide();
      $("#help-modal-trigger").show();
      $("#player-input").show();
      $("#player-input").css({
        'margin-top': '20px',
      });
      $("#start-button").css({
        'margin-top': '0px',
      });
      $("#screen-container").css({
        'background': 'url("../images/Caution_Background.jpeg")',
        'background-size': 'cover'
      });
      clearInterval(game.loopIntervalId);
    }

    if (this.isRunning) {
      this.gameState();
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
    this.playerNameDisplay.textContent = oPlayer;
  },

  updatePlayerScore(oPlayer) {
    this.playerScoreDisplay.textContent = oPlayer;
  },

  truckCollision() {
    const forklift = document.getElementById('forklift');
    const truck = document.getElementById('truck');
    
    const forkliftRect = forklift.getBoundingClientRect();
    const truckRect = truck.getBoundingClientRect();
  
    const forkliftTop = forkliftRect.top;
    const forkliftBottom = forkliftRect.bottom;
    const forkliftLeft = forkliftRect.left;
    const forkliftRight = forkliftRect.right;

    const truckTop = truckRect.top;
    const truckBottom = truckRect.bottom;
    const truckLeft = truckRect.left;
    const truckRight = truckRect.right;
  
    if (
      forkliftBottom >= truckTop &&
      forkliftTop <= truckBottom &&
      forkliftRight >= truckLeft &&
      forkliftLeft <= truckRight
    ) {
      return true;
    } else {
      return false;
    }
  },

  spawnPallet() {
    const pallet = document.getElementById('pallet');
    const truck = document.getElementById('truck');
  
    const truckRect = truck.getBoundingClientRect();
  
    let palletSpawned = false;
  
    while (!palletSpawned) {
      const randomX = Math.floor(Math.random() * 580) - 300;
      const randomY = Math.floor(Math.random() * 360) - 180;
  
      pallet.style.top = `${randomY}px`;
      pallet.style.left = `${randomX}px`;
  
      const palletRect = pallet.getBoundingClientRect();
  
      const palletTop = palletRect.top;
      const palletBottom = palletRect.bottom;
      const palletLeft = palletRect.left;
      const palletRight = palletRect.right;
  
      if (
        palletBottom >= truckRect.top &&
        palletTop <= truckRect.bottom &&
        palletRight >= truckRect.left &&
        palletLeft <= truckRect.right
      ) {
        continue;
      } else {
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
    let scoreUpdated = false;
    if (game.pickUpPallet()){
      $("#pallet").hide();
      forklift.setAttribute('src', '../images/Forklift-Loaded.svg');
      $("#forklift").css({
        'height': '100px',
        'width': '100px',
      });
      game.palletCarry = true;
    }
    if (game.truckCollision() && game.palletCarry && !scoreUpdated){
      forklift.setAttribute('src', '../images/Forklift.svg');
      $("#forklift").css({
        'height': '80px',
        'width': '80px',
      });
      game.palletCarry = false;
      player.incrementPlayerScore();
      game.spawnPallet();
      scoreUpdated = true;
    }

  },
};

const player = {
  name: "Player1",
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
    const collision = game.truckCollision();
  
    if (currentPosition > -180) {
      const newPosition = currentPosition - 10;
      if (!collision || game.direction === 'down') {
        forkliftElement.style.top = `${newPosition}px`;
        game.direction = 'up';
      } 
      else if (collision && game.direction === 'left'){
        forkliftElement.style.top = `${newPosition}px`;
      }
      else {
        forkliftElement.style.top = `${currentPosition + 10}px`;
      }
    }
    forkliftElement.style.transform = 'rotate(0deg)';
  },
  
  moveForkliftDown() {
    const forkliftElement = document.getElementById('forklift');
    const currentPosition = parseInt(window.getComputedStyle(forkliftElement).top);
    const collision = game.truckCollision();

    if (currentPosition < 180) {
      const newPosition = currentPosition + 10;
      
      if (!collision || game.direction === 'up') {
        forkliftElement.style.top = `${newPosition}px`;
        game.direction = 'down';
      } 
      else if (collision && game.direction === 'left'){
        forkliftElement.style.top = `${newPosition}px`;
      }
      else {
        forkliftElement.style.top = `${currentPosition - 10}px`;
      }
    }
    forkliftElement.style.transform = 'rotate(180deg)';
  },
  
  moveForkliftLeft() {
    const forkliftElement = document.getElementById('forklift');
    const currentPosition = parseInt(window.getComputedStyle(forkliftElement).left);
    const collision = game.truckCollision();
    console.log(currentPosition);
  
    if (currentPosition > -280) {
      const newPosition = currentPosition - 10;

      if (!collision ) {
        forkliftElement.style.left = `${newPosition}px`;
        game.direction = 'left';
      } 
      else if (collision && game.direction === "down"){
        forkliftElement.style.left = `${newPosition}px`;
      }
      else if (collision && game.direction === "up"){
        forkliftElement.style.left = `${newPosition}px`;
      }
      else {
        forkliftElement.style.left = `${currentPosition + 10}px`;
      }
    }
    forkliftElement.style.transform = 'rotate(-90deg)';
  },
  
  moveForkliftRight() {
    const forkliftElement = document.getElementById('forklift');
    const currentPosition = parseInt(window.getComputedStyle(forkliftElement).left);
    console.log(currentPosition);

    if(currentPosition < 320){
      const newPosition = currentPosition + 10;
      forkliftElement.style.left = `${newPosition}px`;
      this.direction = 'right';
    }
    forkliftElement.style.transform = 'rotate(90deg)';
  },
}

/*Event listeners*/

document.getElementById("join-id").addEventListener("click", () => {
  const nameUpdate = document.getElementById("name-entry");
  if (nameUpdate.value !== "") {
    player.updatePlayerName(nameUpdate.value);
    nameUpdate.value = "";
    document.getElementById("start-button").removeAttribute("disabled");
    game.playerInput.style.display = "none";
    game.startGameButton.style.marginTop = "40px";
  }
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

$("#play-button").on("click", () => {
  game.gameState();
});

$("#pause-button").on("click", () => {
  game.gameState();
});

$("#start-button").on("click", () => {
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
