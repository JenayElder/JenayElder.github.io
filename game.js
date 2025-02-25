console.log("game.js is loaded");
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let score = 0;
let lives = 5;
let gameState = 'waiting'; // Start with waiting state to show start screen
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

// Attempt to play background music immediately (handle autoplay restrictions)
backgroundMusic.play().catch(error => {
    console.log("Background music autoplay blocked:", error);
    // Fallback: Add a click event to the document to allow music playback
    document.addEventListener('click', () => {
        if (backgroundMusic.paused) {
            backgroundMusic.play().catch(error => console.log("Background music play error after click:", error));
        }
    }, { once: true }); // Only trigger once
});

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

// Spawn falling objects with increasing speed and difficulty
function spawnFallingObject() {
    const types = [
        { type: 'espresso', value: 1, speed: 2 },
        { type: 'bean', value: 2, speed: 3 },
        { type: 'star', value: 5, speed: 4 }
    ];
    let availableTypes = [types[0]]; // Start with only espresso beans

    if (score >= 50) availableTypes.push(types[1]); // Add beans after 50 points
    if (score >= 75) availableTypes.push(types[2]); // Lowered threshold for stars to 75 points (quicker appearance)

    const chosen = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    const x = Math.random() * (canvas.width - 50);

    // Increase speed based on score, with additional boost at 250+ points
    const baseSpeed = chosen.speed;
    let speedIncrease = Math.min(Math.floor(score / 50) * 0.1, 1.0); // Base increase per 50 points, capped at 1.0
    if (score >= 250) {
        speedIncrease += baseSpeed * 0.20; // 20% faster at 250+ points
    }
    const finalSpeed = baseSpeed + speedIncrease;

    fallingObjects.push(new FallingObject(chosen.type, x, -50, chosen.value, finalSpeed));
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

// Draw score and lives (using Montserrat-Bold, positioned to avoid cutoff with more padding)
function drawUI() {
    ctx.font = '20px "Montserrat-Bold", Arial, sans-serif'; // Updated to Montserrat-Bold
    ctx.fillStyle = 'black';
    ctx.fillText(`Beans: ${score}`, 70, 30); // Moved right by 20px for more padding (from 50 to 70)
    ctx.fillText(`Lives: ${lives}`, 70, 60); // Moved right by 20px for more padding (from 50 to 70)
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

        // Spawn new objects with increased difficulty at 250+ points
        let spawnRate = 0.02; // Base spawn rate
        if (score >= 250) {
            spawnRate *= 1.30; // 30% more objects (e.g., 0.026 instead of 0.02)
        }
        if (Math.random() < spawnRate) { // Adjust spawn rate as needed
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
            showMessage('Game Over', 'Press R to Restart');
        }
    } else if (gameState === 'waiting' || gameState === 'lose' || gameState === 'win') {
        showMessage(
            gameState === 'waiting' ? 'Bean Bounce' : 
            gameState === 'win' ? 'You Win!' : 'Game Over',
            gameState === 'waiting' ? 'Click Start to Begin' : 
            gameState === 'win' ? 'Press R to restart' : 'Press R to Restart'
        );
    }

    requestAnimationFrame(gameLoop);
}

// Show game over/win message or start screen (using Montserrat-Bold, adjusted for spacing)
function showMessage(title, subtitle) {
    ctx.font = '30px "Montserrat-Bold", Arial, sans-serif'; // Updated to Montserrat-Bold
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.fillText(title, canvas.width / 2, canvas.height / 2 - 40); // Moved title up by 20px for spacing
    ctx.font = '20px "Montserrat-Bold", Arial, sans-serif'; // Updated to Montserrat-Bold
    ctx.fillText(subtitle, canvas.width / 2, canvas.height / 2 + 20); // Moved subtitle down for spacing
}

// Reset game
function resetGame() {
    score = 0;
    lives = 5;
    fallingObjects = [];
    gameState = 'waiting'; // Return to waiting state to show start screen again
}

// Start the game when button is clicked
function startGame() {
    gameState = 'playing';
    document.getElementById('startButton').style.display = 'none'; // Hide the button
    // Initialize falling objects and ensure game elements start
    fallingObjects = []; // Clear any existing objects to ensure a fresh start
    // Sounds and game elements start here
    Promise.all([cursorImg, espressoImg, beanImg, starImg].map(img => new Promise(resolve => img.onload = resolve)))
        .then(() => {
            gameLoop();
            // Ensure initial objects spawn after starting
            setTimeout(spawnFallingObject, 100); // Spawn first object after a slight delay
        });
}

// Initialize the game loop to show the start screen
gameLoop();