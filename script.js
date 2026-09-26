const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const playerScoreEl = document.getElementById('playerScore');
const computerScoreEl = document.getElementById('computerScore');

const paddleWidth = 12;
const paddleHeight = 100;
const paddleSpeed = 8;
const ballRadius = 8;
const maxComputerSpeed = 7;

const leftPaddle = {
  x: 20,
  y: canvas.height / 2 - paddleHeight / 2,
  width: paddleWidth,
  height: paddleHeight,
  dy: 0,
};

const rightPaddle = {
  x: canvas.width - 20 - paddleWidth,
  y: canvas.height / 2 - paddleHeight / 2,
  width: paddleWidth,
  height: paddleHeight,
};

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: ballRadius,
  speedX: 5,
  speedY: 3,
};

let playerScore = 0;
let computerScore = 0;
let keys = {};

function resetBall(direction) {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.speedX = direction * (Math.random() * 1.2 + 5.2);
  ball.speedY = (Math.random() * 5 - 2.5);
}

function updateScores() {
  playerScoreEl.textContent = playerScore;
  computerScoreEl.textContent = computerScore;
}

function movePlayer() {
  if (keys.ArrowUp) {
    leftPaddle.y -= paddleSpeed;
  }

  if (keys.ArrowDown) {
    leftPaddle.y += paddleSpeed;
  }

  leftPaddle.y = Math.max(0, Math.min(canvas.height - leftPaddle.height, leftPaddle.y));
}

function moveComputer() {
  const paddleCenter = rightPaddle.y + rightPaddle.height / 2;
  const targetY = ball.y - rightPaddle.height / 2;
  const difference = targetY - paddleCenter;

  if (Math.abs(difference) > 2) {
    const direction = difference > 0 ? 1 : -1;
    const step = Math.min(Math.abs(difference), maxComputerSpeed);
    rightPaddle.y += direction * step;
  }

  rightPaddle.y = Math.max(0, Math.min(canvas.height - rightPaddle.height, rightPaddle.y));
}

function collidesWithPaddle(paddle, ballObject) {
  const closestX = Math.max(paddle.x, Math.min(ballObject.x, paddle.x + paddle.width));
  const closestY = Math.max(paddle.y, Math.min(ballObject.y, paddle.y + paddle.height));

  const dx = ballObject.x - closestX;
  const dy = ballObject.y - closestY;
  return dx * dx + dy * dy <= ballObject.radius * ballObject.radius;
}

function updateBall() {
  ball.x += ball.speedX;
  ball.y += ball.speedY;

  if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= canvas.height) {
    ball.speedY *= -1;
    ball.y = Math.max(ball.radius, Math.min(canvas.height - ball.radius, ball.y));
  }

  if (collidesWithPaddle(leftPaddle, ball)) {
    const hitPos = (ball.y - (leftPaddle.y + leftPaddle.height / 2)) / (leftPaddle.height / 2);
    ball.x = leftPaddle.x + leftPaddle.width + ball.radius;
    ball.speedX = Math.abs(ball.speedX) + 0.2;
    ball.speedY = hitPos * 6;
  }

  if (collidesWithPaddle(rightPaddle, ball)) {
    const hitPos = (ball.y - (rightPaddle.y + rightPaddle.height / 2)) / (rightPaddle.height / 2);
    ball.x = rightPaddle.x - ball.radius;
    ball.speedX = -Math.abs(ball.speedX) - 0.2;
    ball.speedY = hitPos * 6;
  }

  if (ball.x - ball.radius <= 0) {
    computerScore += 1;
    updateScores();
    resetBall(1);
  }

  if (ball.x + ball.radius >= canvas.width) {
    playerScore += 1;
    updateScores();
    resetBall(-1);
  }
}

function drawRect(x, y, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
}

function drawBall(x, y, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawCenterLine() {
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.setLineDash([10, 12]);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawCenterLine();
  drawRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height, '#f8fafc');
  drawRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height, '#f8fafc');
  drawBall(ball.x, ball.y, ball.radius, '#facc15');
}

function gameLoop() {
  movePlayer();
  moveComputer();
  updateBall();
  render();
  requestAnimationFrame(gameLoop);
}

canvas.addEventListener('mousemove', (event) => {
  const rect = canvas.getBoundingClientRect();
  const mouseY = event.clientY - rect.top;
  leftPaddle.y = mouseY - leftPaddle.height / 2;
  leftPaddle.y = Math.max(0, Math.min(canvas.height - leftPaddle.height, leftPaddle.y));
});

document.addEventListener('keydown', (event) => {
  keys[event.key] = true;
});

document.addEventListener('keyup', (event) => {
  keys[event.key] = false;
});

updateScores();
resetBall(Math.random() > 0.5 ? 1 : -1);
requestAnimationFrame(gameLoop);