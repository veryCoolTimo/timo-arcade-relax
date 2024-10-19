"use client";

import React, { useState, useEffect, useRef } from 'react';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 10;
const BALL_RADIUS = 8;
const BRICK_ROWS = 5;
const BRICK_COLUMNS = 8;
const BRICK_WIDTH = 75;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 10;
const BRICK_OFFSET_TOP = 30;
const BRICK_OFFSET_LEFT = 30;

interface Brick {
  x: number;
  y: number;
  status: number;
}

const Arkanoid: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [paddleX, setPaddleX] = useState((CANVAS_WIDTH - PADDLE_WIDTH) / 2);
  const [ballX, setBallX] = useState(CANVAS_WIDTH / 2);
  const [ballY, setBallY] = useState(CANVAS_HEIGHT - 30);
  const [dx, setDx] = useState(2);
  const [dy, setDy] = useState(-2);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [bricks, setBricks] = useState<Brick[][]>([]);

  useEffect(() => {
    const newBricks: Brick[][] = [];
    for (let c = 0; c < BRICK_COLUMNS; c++) {
      newBricks[c] = [];
      for (let r = 0; r < BRICK_ROWS; r++) {
        newBricks[c][r] = { x: 0, y: 0, status: 1 };
      }
    }
    setBricks(newBricks);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      drawBricks();
      drawBall();
      drawPaddle();
      drawScore();
      collisionDetection();

      if (ballX + dx > CANVAS_WIDTH - BALL_RADIUS || ballX + dx < BALL_RADIUS) {
        setDx(-dx);
      }
      if (ballY + dy < BALL_RADIUS) {
        setDy(-dy);
      } else if (ballY + dy > CANVAS_HEIGHT - BALL_RADIUS) {
        if (ballX > paddleX && ballX < paddleX + PADDLE_WIDTH) {
          setDy(-dy);
        } else {
          setGameOver(true);
        }
      }

      setBallX(prevX => prevX + dx);
      setBallY(prevY => prevY + dy);
    };

    const drawBricks = () => {
      for (let c = 0; c < BRICK_COLUMNS; c++) {
        for (let r = 0; r < BRICK_ROWS; r++) {
          if (bricks[c][r].status === 1) {
            const brickX = c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT;
            const brickY = r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP;
            bricks[c][r].x = brickX;
            bricks[c][r].y = brickY;
            ctx.beginPath();
            ctx.rect(brickX, brickY, BRICK_WIDTH, BRICK_HEIGHT);
            ctx.fillStyle = '#0095DD';
            ctx.fill();
            ctx.closePath();
          }
        }
      }
    };

    const drawBall = () => {
      ctx.beginPath();
      ctx.arc(ballX, ballY, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = '#0095DD';
      ctx.fill();
      ctx.closePath();
    };

    const drawPaddle = () => {
      ctx.beginPath();
      ctx.rect(paddleX, CANVAS_HEIGHT - PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT);
      ctx.fillStyle = '#0095DD';
      ctx.fill();
      ctx.closePath();
    };

    const drawScore = () => {
      ctx.font = '16px Arial';
      ctx.fillStyle = '#0095DD';
      ctx.fillText(`Score: ${score}`, 8, 20);
    };

    const collisionDetection = () => {
      for (let c = 0; c < BRICK_COLUMNS; c++) {
        for (let r = 0; r < BRICK_ROWS; r++) {
          const b = bricks[c][r];
          if (b.status === 1) {
            if (
              ballX > b.x &&
              ballX < b.x + BRICK_WIDTH &&
              ballY > b.y &&
              ballY < b.y + BRICK_HEIGHT
            ) {
              setDy(-dy);
              b.status = 0;
              setScore(prevScore => prevScore + 1);
              if (score === BRICK_ROWS * BRICK_COLUMNS) {
                setGameOver(true);
              }
            }
          }
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const relativeX = e.clientX - canvas.offsetLeft;
      if (relativeX > 0 && relativeX < CANVAS_WIDTH) {
        setPaddleX(relativeX - PADDLE_WIDTH / 2);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    if (!gameOver) {
      const interval = setInterval(draw, 10);
      return () => {
        clearInterval(interval);
        canvas.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, [ballX, ballY, dx, dy, paddleX, bricks, score, gameOver]);

  const resetGame = () => {
    setPaddleX((CANVAS_WIDTH - PADDLE_WIDTH) / 2);
    setBallX(CANVAS_WIDTH / 2);
    setBallY(CANVAS_HEIGHT - 30);
    setDx(2);
    setDy(-2);
    setScore(0);
    setGameOver(false);
    const newBricks: Brick[][] = [];
    for (let c = 0; c < BRICK_COLUMNS; c++) {
      newBricks[c] = [];
      for (let r = 0; r < BRICK_ROWS; r++) {
        newBricks[c][r] = { x: 0, y: 0, status: 1 };
      }
    }
    setBricks(newBricks);
  };

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="border border-gray-300" />
      {gameOver && (
        <div className="mt-4 text-center">
          <h3 className="text-xl mb-2">Игра окончена!</h3>
          <p className="mb-4">Ваш счет: {score}</p>
          <button
            onClick={resetGame}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Начать заново
          </button>
        </div>
      )}
      <div className="mt-4 text-sm text-gray-600">
        Используйте мышь для управления платформой
      </div>
    </div>
  );
};

export default Arkanoid;
