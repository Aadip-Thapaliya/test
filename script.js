// Canvas and context
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const paddleWidth = 10;
const paddleHeight = 80;
const ballRadius = 7;

let player = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    score: 0
};

let computer = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    score: 0
};

let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: 5,
    dy: 5,
    radius: ballRadius,
    speed: 5
};

// Game state
let gameRunning = false;
let mouseY = canvas.height / 2;
let keys = {};

// Event listeners
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

canvas.addEventListener('click', () => {
    gameRunning = !gameRunning;
});

// Update score display
function updateScoreboard() {
    document.getElementById('playerScore').textContent = player.score;
    document.getElementById('computerScore').textContent = computer.score;
}

// Draw functions
function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawCircle(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawCenterLine() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    drawCenterLine();

    // Draw paddles
    drawRect(player.x, player.y, player.width, player.height, '#00ff41'); // Green for player
    drawRect(computer.x, computer.y, computer.width, computer.height, '#ff006e'); // Pink for computer

    // Draw ball
    drawCircle(ball.x, ball.y, ball.radius, '#ffff00');

    // Draw borders
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
}

// Update player paddle position
function updatePlayer() {
    // Arrow keys control
    if (keys['ArrowUp'] && player.y > 0) {
        player.y -= 6;
    }
    if (keys['ArrowDown'] && player.y < canvas.height - player.height) {
        player.y += 6;
    }

    // Mouse control
    const mouseTarget = mouseY - player.height / 2;
    const maxSpeed = 5;
    const difference = mouseTarget - player.y;

    if (Math.abs(difference) > 2) {
        player.y += Math.max(-maxSpeed, Math.min(maxSpeed, difference * 0.15));
    }

    // Keep paddle in bounds
    player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
}

// Update computer AI paddle
function updateComputer() {
    const computerCenter = computer.y + computer.height / 2;
    const ballCenter = ball.y;
    const maxSpeed = 4.5;
    const difference = ballCenter - computerCenter;

    // Add some error to make it beatable
    const errorMargin = 35;
    
    if (Math.abs(difference) > errorMargin) {
        computer.y += Math.max(-maxSpeed, Math.min(maxSpeed, difference * 0.12));
    }

    // Keep paddle in bounds
    computer.y = Math.max(0, Math.min(canvas.height - computer.height, computer.y));
}

// Update ball position
function updateBall() {
    if (!gameRunning) return;

    ball.x += ball.dx;
    ball.y += ball.dy;

    // Top and bottom collision
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = Math.max(ball.radius, Math.min(canvas.height - ball.radius, ball.y));
    }

    // Left paddle collision
    if (
        ball.x - ball.radius < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height
    ) {
        ball.dx = Math.abs(ball.dx); // Ensure ball moves right
        const collidePoint = ball.y - (player.y + player.height / 2);
        const collideNormalized = collidePoint / (player.height / 2);
        const bounceAngle = collideNormalized * (Math.PI / 4); // Max 45 degrees
        ball.dx = ball.speed * Math.cos(bounceAngle);
        ball.dy = ball.speed * Math.sin(bounceAngle);
        ball.x = player.x + player.width + ball.radius;
    }

    // Right paddle collision
    if (
        ball.x + ball.radius > computer.x &&
        ball.y > computer.y &&
        ball.y < computer.y + computer.height
    ) {
        ball.dx = -Math.abs(ball.dx); // Ensure ball moves left
        const collidePoint = ball.y - (computer.y + computer.height / 2);
        const collideNormalized = collidePoint / (computer.height / 2);
        const bounceAngle = collideNormalized * (Math.PI / 4);
        ball.dx = -ball.speed * Math.cos(bounceAngle);
        ball.dy = ball.speed * Math.sin(bounceAngle);
        ball.x = computer.x - ball.radius;
    }

    // Scoring - left side
    if (ball.x - ball.radius < 0) {
        computer.score++;
        resetBall();
    }

    // Scoring - right side
    if (ball.x + ball.radius > canvas.width) {
        player.score++;
        resetBall();
    }

    updateScoreboard();
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    const angle = (Math.random() - 0.5) * (Math.PI / 3);
    const direction = Math.random() > 0.5 ? 1 : -1;
    ball.dx = direction * ball.speed * Math.cos(angle);
    ball.dy = ball.speed * Math.sin(angle);
    gameRunning = false;
}

// Main game loop
function gameLoop() {
    updatePlayer();
    updateComputer();
    updateBall();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
updateScoreboard();
