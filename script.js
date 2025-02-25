console.log("game.js is loaded");
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let score = 0;
let lives = 5;
let gameState = 'waiting'; // Changed to 'waiting' to start with the start screen
const cursorSpeed = 5;
let cursorX = canvas.width / 2;
const cursorWidth = 96; // Adjusted to maintain aspect ratio (approx. 134.0075 / 208.8286 * 150)
const cursorHeight = 150; // Reasonable height for the canvas (600 px)

// Load images
const cursorImg = new Image();
const espressoImg = new Image();
const beanImg = new Image();
const starImg = new Image();

cursorImg.src = 'Cursor_cup.png';
espressoImg.src = 'espresso_beans.png';
beanImg.src = 'bean.png';
starImg.src = 'star.png';

// Load sound effects and background music
const starSound = new Audio('star.mp3');
const espressoSound = new Audio('espresso_beans.mp3');
const beanSound = new Audio('bean.mp3'); // Sound for bean.png
const backgroundMusic = new Audio('game-music-loop_beanbounce.mp3');

backgroundMusic.loop = true; // Ensure background music loops continuously
backgroundMusic.volume = 0.5; // Set volume (0.0 to 1.0, where 0.5 is 50%)

// Falling objects array
let fallingObjects = [];

// Player (cursor) object
const player = {
    x: cursorX,
    y: canvas.height - cursorHeight,
    width: cursorWidth,
    height: cursorHeight,
    draw: function() {
        ctx.drawImage(cursorImg, this.x, this.y, this.width, this.height);
    }
};

// Falling object class
class FallingObject {
    constructor(type, x, y, value, speed) {
        this.type = type; // 'espresso', 'bean', or 'star'
        this.x = x;
        this.y = y;
        this.value = value;
        this.speed = speed;
        this.width = 50;
        this.height = 50;
    }

    draw() {
        if (this.type === 'espresso') ctx.drawImage(espressoImg, this.x, this.y, this.width, this.height);
        else if (this.type === 'bean') ctx.drawImage(beanImg, this.x, this.y, this.width, this.height);
        else if (this.type === 'star') ctx.drawImage(starImg, this.x, this.y, this.width, this.height);
    }

    update() {
        this.y += this.speed;
    }
}

// Handle keyboard/mouse input
document.addEventListener('mousemove', (e) => {
    if (gameState === 'playing') {
        const rect = canvas.getBoundingClientRect();
        cursorX = e.clientX - rect.left - cursorWidth / 2;
        if (cursorX < 0) cursorX = 0;
        if (cursorX > canvas.width - cursorWidth) cursorX = canvas.width - cursorWidth;
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'r' && (gameState === 'win' || gameState === 'lose')) {
        resetGame();
    }
});

// Add start button listener
document.getElementById('startButton').addEventListener('click', startGame);

// Spawn falling objects
function spawnFallingObject() {
    const types = [
        { type: 'espresso', value: 1, speed: 2 },
        { type: 'bean', value: 2, speed: 3 },
        { type: 'star', value: 5, speed: 4 }
    ];
    let availableTypes = [types[0]]; // Start with only espresso beans

    if (score >= 50) availableTypes.push(types[1]); // Add beans after 50 points
    if (score >= 150) availableTypes.push(types[2]); // Add stars after 150 points

    const chosen = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    const x = Math.random() * (canvas.width - 50);
    fallingObjects.push(new FallingObject(chosen.type, x, -50, chosen.value, chosen.speed));
}

// Check collisions and play sounds
function checkCollisions() {
    fallingObjects = fallingObjects.filter(obj => {
        if (
            player.x < obj.x + obj.width &&
            player.x + player.width > obj.x &&
            player.y < obj.y + obj.height &&
            player.y + player.height > obj.y
        ) {
            score += obj.value;
            if (obj.type === 'star') {
                starSound.play().catch(error => console.log("Star sound play error:", error));
            } else if (obj.type === 'espresso') {
                espressoSound.play().catch(error => console.log("Espresso sound play error:", error));
            } else if (obj.type === 'bean') {
                beanSound.play().catch(error => console.log("Bean sound play error:", error));
            }
            return false; // Remove caught object
        } else if (obj.y > canvas.height) {
            lives--;
            return false; // Remove missed object
        }
        return true;
    });
}

// Draw score and lives (using Montserrat-Bold)
function drawUI() {
    ctx.font = '20px "Montserrat-Bold", Arial, sans-serif'; // Updated to Montserrat-Bold
    ctx.fillStyle = 'black';
    ctx.fillText(`Beans: ${score}`, 10, 30);
    ctx.fillText(`Lives: ${lives}`, 10, 60);
}

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'playing') {
        // Update player position
        player.x = cursorX;
        player.draw();

        // Update and draw falling objects
        fallingObjects.forEach(obj => {
            obj.update();
            obj.draw();
        });

        // Check collisions
        checkCollisions();

        // Spawn new objects
        if (Math.random() < 0.02) { // Adjust spawn rate as needed
            spawnFallingObject();
        }

        // Draw UI
        drawUI();

        // Check win/lose conditions
        if (score >= 400) {
            gameState = 'win';
            showMessage('You Win!', 'Press R to restart');
        } else if (lives <= 0) {
            gameState = 'lose';
            showMessage('Game Over', 'Press R to restart');
        }
    } else if (gameState === 'waiting') {
        showMessage('Bean Bounce', 'Click Start to Begin');
    }

    requestAnimationFrame(gameLoop);
}

// Show game over/win message or start screen (using Montserrat-Bold)
function showMessage(title, subtitle) {
    ctx.font = '30px "Montserrat-Bold", Arial, sans-serif'; // Updated to Montserrat-Bold
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.fillText(title, canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '20px "Montserrat-Bold", Arial, sans-serif'; // Updated to Montserrat-Bold
    ctx.fillText(subtitle, canvas.width / 2, canvas.height / 2 + 20);
}

// Reset game
function resetGame() {
    score = 0;
    lives = 5;
    fallingObjects = [];
    gameState = 'playing';
}

// Start the game when button is clicked
function startGame() {
    gameState = 'playing';
    document.getElementById('startButton').style.display = 'none'; // Hide the button
    backgroundMusic.play().catch(error => console.log("Background music play error:", error)); // Play background music continuously
    Promise.all([cursorImg, espressoImg, beanImg, starImg].map(img => new Promise(resolve => img.onload = resolve)))
        .then(() => gameLoop());
}

// Initialize the game loop to show the start screen
gameLoop();
