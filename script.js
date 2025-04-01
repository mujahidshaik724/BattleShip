// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {

  // Prompt the player to enter their name, default to "Player" if empty
  let playerName = prompt("Enter your name:") || "Player";
  document.getElementById("player-name").textContent = `Player: ${playerName}`;

  // Select DOM elements for player and computer grids, and the restart button
  const playerGrid = document.getElementById("player-grid");
  const computerGrid = document.getElementById("computer-grid");
  const restartButton = document.getElementById("restart-button");

  // Constants and variables for game settings and state
  const gridSize = 10; // Grid size for both player and computer
  let playerShips = new Set(); // Set to store player ship positions
  let computerShips = new Set(); // Set to store computer ship positions
  let availableMoves = new Set([...Array(gridSize * gridSize).keys()]); // All possible moves for computer
  
  // Variables for computer's targeting logic
  let hitStack = []; // Stack to keep track of hit positions
  let lastHitDirection = null; // Direction of the last hit
  const directions = [-1, 1, -gridSize, gridSize]; // Possible directions for attacks
  
  // Predefined ship shapes
  const shipShapes = [[0], [0, 1], [0, gridSize], [0, 1, 2]];

  // Function to initialize a grid with empty cells
  function initializeGrid(grid) {
    grid.innerHTML = ""; // Clear the grid
    for (let i = 0; i < gridSize * gridSize; i++) {
      const cell = document.createElement("div"); // Create a new cell
      cell.dataset.index = i; // Assign cell index
      grid.appendChild(cell); // Add cell to the grid
    }
  }

  // Function to check if a ship placement is valid
  function isValidPlacement(newShip, ships) {
    return newShip.every(
      (pos) => pos >= 0 && pos < gridSize * gridSize && !ships.has(pos) // Ensure position is within bounds and not occupied
    );
  }

  // Function to randomly place ships on the grid
  function placeShipsRandomly(ships, grid, isPlayer = false) {
    ships.clear(); // Clear existing ship positions
    shipShapes.forEach((shape) => {
      let placed = false;
      while (!placed) {
        const startPosition = Math.floor(Math.random() * gridSize * gridSize); // Random starting position
        const isVertical = Math.random() < 0.5; // Randomize orientation
        const newShip = shape.map((offset) =>
          isVertical ? startPosition + offset * gridSize : startPosition + offset
        );

        if (isValidPlacement(newShip, ships)) {
          newShip.forEach((pos) => ships.add(pos)); // Add ship positions to the set
          placed = true;
          if (isPlayer) { // If placing player's ships, display them visually
            newShip.forEach((pos) => grid.children[pos].classList.add("ship"));
          }
        }
      }
    });
  }

  // Function to handle player attacking a cell on the computer's grid
  function handlePlayerAttack(cell) {
    const index = Number(cell.dataset.index); // Get cell index
    if (cell.classList.contains("hit") || cell.classList.contains("miss")) return; // Ignore if already attacked

    if (computerShips.has(index)) { // If attack hits a ship
      cell.classList.add("hit");
      computerShips.delete(index); // Remove hit ship position
    } else {
      cell.classList.add("miss"); // Mark as missed attack
    }

    checkWinner(); // Check if the game is won
    setTimeout(handleComputerTurn, 800); // Allow computer to take its turn
  }

  // Function to handle computer's turn to attack
  function handleComputerTurn() {
    if (availableMoves.size === 0) return; // Stop if no moves are left
    let index;

    if (hitStack.length > 0) { // If there are previous hits, continue attacking nearby
      const lastHit = hitStack[hitStack.length - 1];
      if (lastHitDirection !== null) {
        index = lastHit + lastHitDirection; // Try continuing in the same direction
        if (!availableMoves.has(index)) {
          lastHitDirection = null; // Reset direction if invalid
        }
      }
      if (!index || !availableMoves.has(index)) { // Try other directions
        for (const dir of directions) {
          index = lastHit + dir;
          if (availableMoves.has(index)) break;
        }
      }
    }

    if (!index || !availableMoves.has(index)) { // Pick a random move if no strategic options are available
      const availableArray = Array.from(availableMoves);
      index = availableArray[Math.floor(Math.random() * availableArray.length)];
    }

    availableMoves.delete(index); // Remove the move from available options
    const cell = playerGrid.children[index];

    if (playerShips.has(index)) { // If the computer hits a player's ship
      cell.classList.add("hit");
      playerShips.delete(index);
      hitStack.push(index); // Add position to hit stack
      if (hitStack.length > 1) {
        lastHitDirection = hitStack[1] - hitStack[0]; // Determine direction of hits
      }
    } else {
      cell.classList.add("miss"); // Mark as missed attack
      hitStack = []; // Reset hit stack
      lastHitDirection = null; // Reset direction
    }

    checkWinner(); // Check if the game is won
  }

  // Function to check if there is a winner
  function checkWinner() {
    if (computerShips.size === 0) { // Player wins
      setTimeout(() => alert(`${playerName} Wins! 🎉`), 100);
      disableGame();
    } else if (playerShips.size === 0) { // Computer wins
      setTimeout(() => alert("Computer Wins! 💀"), 100);
      disableGame();
    }
  }

  // Function to disable the game
  function disableGame() {
    computerGrid.style.pointerEvents = "none"; // Prevent interactions with computer's grid
  }

  // Function to restart the game
  function restartGame() {
    availableMoves = new Set([...Array(gridSize * gridSize).keys()]); // Reset available moves
    hitStack = []; // Reset hit stack
    lastHitDirection = null; // Reset direction

    initializeGrid(playerGrid); // Initialize player's grid
    initializeGrid(computerGrid); // Initialize computer's grid
    playerShips = new Set(); // Reset player's ships
    computerShips = new Set(); // Reset computer's ships

    placeShipsRandomly(playerShips, playerGrid, true); // Place player's ships
    placeShipsRandomly(computerShips, computerGrid, false); // Place computer's ships

    computerGrid.style.pointerEvents = "auto"; // Enable interactions
  }

  // Event listener for player attacks on computer's grid
  computerGrid.addEventListener("click", (e) => {
    const cell = e.target;
    if (cell.tagName === "DIV") {
      handlePlayerAttack(cell);
    }
  });

  // Event listener for restarting the game
  restartButton.addEventListener("click", restartGame);

  // Start a new game
  restartGame();
});