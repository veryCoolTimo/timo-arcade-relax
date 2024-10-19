"use client";

import React, { useState, useEffect, useCallback } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 1, y: 0 };

const Snake: React.FC = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const moveSnake = useCallback(() => {
    if (gameOver) return;

    const newSnake = [...snake];
    const head = { ...newSnake[0] };
    head.x += direction.x;
    head.y += direction.y;

    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      setGameOver(true);
      return;
    }

    if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
      setGameOver(true);
      return;
    }

    newSnake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      setScore(prevScore => prevScore + 1);
      setFood({
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      });
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  }, [snake, direction, food, gameOver]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Предотвращаем стандартное поведение браузера для клавиш стрелок
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case 'ArrowUp':
          setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    const gameLoop = setInterval(moveSnake, 200);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      clearInterval(gameLoop);
    };
  }, [moveSnake]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood({ x: 15, y: 15 });
    setGameOver(false);
    setScore(0);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4">
        <span className="text-lg font-semibold">Счет: {score}</span>
      </div>
      <div 
        style={{ 
          width: GRID_SIZE * CELL_SIZE, 
          height: GRID_SIZE * CELL_SIZE, 
          position: 'relative',
          border: '2px solid #2c3e50',
          borderRadius: '4px',
          backgroundColor: '#ecf0f1'
        }}
      >
        {snake.map((segment, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE,
              backgroundColor: index === 0 ? '#e74c3c' : '#3498db',
              border: '1px solid #2980b9',
              borderRadius: '2px',
            }}
          />
        ))}
        <div
          style={{
            position: 'absolute',
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE,
            width: CELL_SIZE,
            height: CELL_SIZE,
            backgroundColor: '#2ecc71',
            borderRadius: '50%',
          }}
        />
        {gameOver && (
          <div 
            style={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              padding: '20px',
              borderRadius: '10px',
              textAlign: 'center'
            }}
          >
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
      </div>
      <div className="mt-4 text-sm text-gray-600">
        Используйте стрелки на клавиатуре для управления змейкой
      </div>
    </div>
  );
};

export default Snake;
