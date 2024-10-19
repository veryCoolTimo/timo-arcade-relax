"use client";

import React, { useState, useEffect, useCallback } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 30;

type Direction = 'up' | 'down' | 'left' | 'right';
type Position = { x: number; y: number };

const Pacman: React.FC = () => {
  const [pacman, setPacman] = useState<Position>({ x: 1, y: 1 });
  const [ghosts, setGhosts] = useState<Position[]>([
    { x: 18, y: 1 },
    { x: 18, y: 18 },
    { x: 1, y: 18 },
  ]);
  const [dots, setDots] = useState<Position[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [direction, setDirection] = useState<Direction>('right');

  const initializeDots = useCallback(() => {
    const newDots: Position[] = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (x % 2 === 1 && y % 2 === 1) {
          newDots.push({ x, y });
        }
      }
    }
    setDots(newDots);
  }, []);

  useEffect(() => {
    initializeDots();
  }, [initializeDots]);

  const moveGhosts = useCallback(() => {
    setGhosts(prevGhosts => prevGhosts.map(ghost => {
      const directions: Direction[] = ['up', 'down', 'left', 'right'];
      const randomDirection = directions[Math.floor(Math.random() * directions.length)];
      let newX = ghost.x;
      let newY = ghost.y;

      switch (randomDirection) {
        case 'up':
          newY = Math.max(0, ghost.y - 1);
          break;
        case 'down':
          newY = Math.min(GRID_SIZE - 1, ghost.y + 1);
          break;
        case 'left':
          newX = Math.max(0, ghost.x - 1);
          break;
        case 'right':
          newX = Math.min(GRID_SIZE - 1, ghost.x + 1);
          break;
      }

      return { x: newX, y: newY };
    }));
  }, []);

  const movePacman = useCallback(() => {
    setPacman(prev => {
      let newX = prev.x;
      let newY = prev.y;

      switch (direction) {
        case 'up':
          newY = Math.max(0, prev.y - 1);
          break;
        case 'down':
          newY = Math.min(GRID_SIZE - 1, prev.y + 1);
          break;
        case 'left':
          newX = Math.max(0, prev.x - 1);
          break;
        case 'right':
          newX = Math.min(GRID_SIZE - 1, prev.x + 1);
          break;
      }

      return { x: newX, y: newY };
    });
  }, [direction]);

  const checkCollisions = useCallback(() => {
    // Check for dot collection
    const dotIndex = dots.findIndex(dot => dot.x === pacman.x && dot.y === pacman.y);
    if (dotIndex !== -1) {
      setDots(prev => prev.filter((_, index) => index !== dotIndex));
      setScore(prev => prev + 10);
    }

    // Check for ghost collision
    if (ghosts.some(ghost => ghost.x === pacman.x && ghost.y === pacman.y)) {
      setGameOver(true);
    }
  }, [pacman, dots, ghosts]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Предотвращаем стандартное поведение браузера для клавиш стрелок
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case 'ArrowUp':
          setDirection('up');
          break;
        case 'ArrowDown':
          setDirection('down');
          break;
        case 'ArrowLeft':
          setDirection('left');
          break;
        case 'ArrowRight':
          setDirection('right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    const gameLoop = setInterval(() => {
      if (!gameOver) {
        movePacman();
        moveGhosts();
        checkCollisions();
      }
    }, 200);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      clearInterval(gameLoop);
    };
  }, [movePacman, moveGhosts, checkCollisions, gameOver]);

  const resetGame = () => {
    setPacman({ x: 1, y: 1 });
    setGhosts([
      { x: 18, y: 1 },
      { x: 18, y: 18 },
      { x: 1, y: 18 },
    ]);
    setScore(0);
    setGameOver(false);
    setDirection('right');
    initializeDots();
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4">
        <span className="text-lg font-semibold">Счет: {score}</span>
      </div>
      <div style={{
        width: GRID_SIZE * CELL_SIZE,
        height: GRID_SIZE * CELL_SIZE,
        backgroundColor: 'black',
        position: 'relative',
      }}>
        {dots.map((dot, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: dot.x * CELL_SIZE + CELL_SIZE / 2,
              top: dot.y * CELL_SIZE + CELL_SIZE / 2,
              width: 6,
              height: 6,
              backgroundColor: 'white',
              borderRadius: '50%',
            }}
          />
        ))}
        <div
          style={{
            position: 'absolute',
            left: pacman.x * CELL_SIZE,
            top: pacman.y * CELL_SIZE,
            width: CELL_SIZE,
            height: CELL_SIZE,
            backgroundColor: 'yellow',
            borderRadius: '50%',
          }}
        />
        {ghosts.map((ghost, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: ghost.x * CELL_SIZE,
              top: ghost.y * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE,
              backgroundColor: ['red', 'pink', 'cyan', 'orange'][index % 4],
              borderRadius: '50% 50% 0 0',
            }}
          />
        ))}
      </div>
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
        Используйте стрелки для управления Пакманом
      </div>
    </div>
  );
};

export default Pacman;
