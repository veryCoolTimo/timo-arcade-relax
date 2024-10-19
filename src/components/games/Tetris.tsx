"use client";

import React, { useState, useEffect, useCallback } from 'react';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 30;

type TetriminoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

const TETRIMINOS: { [key in TetriminoType]: { shape: number[][], color: string } } = {
  'I': { shape: [[1, 1, 1, 1]], color: '#00f0f0' },
  'O': { shape: [[1, 1], [1, 1]], color: '#f0f000' },
  'T': { shape: [[0, 1, 0], [1, 1, 1]], color: '#a000f0' },
  'S': { shape: [[0, 1, 1], [1, 1, 0]], color: '#00f000' },
  'Z': { shape: [[1, 1, 0], [0, 1, 1]], color: '#f00000' },
  'J': { shape: [[1, 0, 0], [1, 1, 1]], color: '#0000f0' },
  'L': { shape: [[0, 0, 1], [1, 1, 1]], color: '#f0a000' }
};

const Tetris: React.FC = () => {
  const [board, setBoard] = useState<string[][]>(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill('')));
  const [currentPiece, setCurrentPiece] = useState<{ type: TetriminoType, shape: number[][], color: string }>({ type: 'I', shape: TETRIMINOS['I'].shape, color: TETRIMINOS['I'].color });
  const [currentPosition, setCurrentPosition] = useState({ x: 3, y: 0 });
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [nextPiece, setNextPiece] = useState<TetriminoType>('I');

  const generateNewPiece = useCallback(() => {
    const pieces = Object.keys(TETRIMINOS) as TetriminoType[];
    const newPieceType = pieces[Math.floor(Math.random() * pieces.length)];
    return { type: newPieceType, shape: TETRIMINOS[newPieceType].shape, color: TETRIMINOS[newPieceType].color };
  }, []);

  const moveDown = useCallback(() => {
    if (!isColliding(currentPiece.shape, currentPosition.x, currentPosition.y + 1)) {
      setCurrentPosition(prev => ({ ...prev, y: prev.y + 1 }));
    } else {
      placePiece();
      const newPiece = generateNewPiece();
      setCurrentPiece(newPiece);
      setCurrentPosition({ x: 3, y: 0 });
      setNextPiece(generateNewPiece().type);
    }
  }, [currentPiece, currentPosition]);

  const moveLeft = useCallback(() => {
    if (!isColliding(currentPiece.shape, currentPosition.x - 1, currentPosition.y)) {
      setCurrentPosition(prev => ({ ...prev, x: prev.x - 1 }));
    }
  }, [currentPiece, currentPosition]);

  const moveRight = useCallback(() => {
    if (!isColliding(currentPiece.shape, currentPosition.x + 1, currentPosition.y)) {
      setCurrentPosition(prev => ({ ...prev, x: prev.x + 1 }));
    }
  }, [currentPiece, currentPosition]);

  const rotate = useCallback(() => {
    const rotated = currentPiece.shape[0].map((_, index) =>
      currentPiece.shape.map(row => row[index]).reverse()
    );
    if (!isColliding(rotated, currentPosition.x, currentPosition.y)) {
      setCurrentPiece(prev => ({ ...prev, shape: rotated }));
    }
  }, [currentPiece, currentPosition]);

  const isColliding = (piece: number[][], x: number, y: number) => {
    for (let row = 0; row < piece.length; row++) {
      for (let col = 0; col < piece[row].length; col++) {
        if (piece[row][col] && (
          y + row >= BOARD_HEIGHT ||
          x + col < 0 ||
          x + col >= BOARD_WIDTH ||
          (board[y + row] && board[y + row][x + col])
        )) {
          return true;
        }
      }
    }
    return false;
  };

  const placePiece = () => {
    const newBoard = [...board];
    for (let row = 0; row < currentPiece.shape.length; row++) {
      for (let col = 0; col < currentPiece.shape[row].length; col++) {
        if (currentPiece.shape[row][col]) {
          if (currentPosition.y + row < 0) {
            setGameOver(true);
            return;
          }
          newBoard[currentPosition.y + row][currentPosition.x + col] = currentPiece.color;
        }
      }
    }
    setBoard(newBoard);
    clearLines(newBoard);
  };

  const clearLines = (board: string[][]) => {
    let linesCleared = 0;
    const newBoard = board.filter(row => {
      if (row.every(cell => cell !== '')) {
        linesCleared++;
        return false;
      }
      return true;
    });

    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(''));
    }

    setBoard(newBoard);
    setScore(prev => prev + linesCleared * 100 * level);
    setLevel(prev => Math.floor(prev + linesCleared / 10));
  };

  useEffect(() => {
    if (gameOver || isPaused) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' '].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case 'ArrowLeft':
          moveLeft();
          break;
        case 'ArrowRight':
          moveRight();
          break;
        case 'ArrowDown':
          moveDown();
          break;
        case 'ArrowUp':
          rotate();
          break;
        case ' ':
          // Hard drop
          while (!isColliding(currentPiece.shape, currentPosition.x, currentPosition.y + 1)) {
            setCurrentPosition(prev => ({ ...prev, y: prev.y + 1 }));
          }
          placePiece();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    const gameLoop = setInterval(moveDown, 1000 / level);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      clearInterval(gameLoop);
    };
  }, [moveDown, moveLeft, moveRight, rotate, level, gameOver, isPaused]);

  useEffect(() => {
    setNextPiece(generateNewPiece().type);
  }, []);

  const resetGame = () => {
    setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill('')));
    setCurrentPiece(generateNewPiece());
    setCurrentPosition({ x: 3, y: 0 });
    setScore(0);
    setLevel(1);
    setGameOver(false);
    setIsPaused(false);
    setNextPiece(generateNewPiece().type);
  };

  const togglePause = () => {
    setIsPaused(prev => !prev);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex justify-between w-full">
        <span className="text-lg font-semibold">Счет: {score}</span>
        <span className="text-lg font-semibold">Уровень: {level}</span>
      </div>
      <div className="flex">
        <div style={{
          width: BOARD_WIDTH * BLOCK_SIZE,
          height: BOARD_HEIGHT * BLOCK_SIZE,
          backgroundColor: '#111',
          border: '2px solid #333',
          position: 'relative'
        }}>
          {board.map((row, y) => row.map((cell, x) => (
            <div key={`${y}-${x}`} style={{
              position: 'absolute',
              top: y * BLOCK_SIZE,
              left: x * BLOCK_SIZE,
              width: BLOCK_SIZE,
              height: BLOCK_SIZE,
              backgroundColor: cell || 'transparent',
              border: cell ? '1px solid rgba(255,255,255,0.1)' : 'none'
            }} />
          )))}
          {currentPiece.shape.map((row, y) => row.map((cell, x) => (
            cell ? (
              <div key={`piece-${y}-${x}`} style={{
                position: 'absolute',
                top: (currentPosition.y + y) * BLOCK_SIZE,
                left: (currentPosition.x + x) * BLOCK_SIZE,
                width: BLOCK_SIZE,
                height: BLOCK_SIZE,
                backgroundColor: currentPiece.color,
                border: '1px solid rgba(255,255,255,0.3)'
              }} />
            ) : null
          )))}
        </div>
        <div className="ml-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Следующая фигура:</h3>
            <div style={{
              width: 4 * BLOCK_SIZE,
              height: 4 * BLOCK_SIZE,
              backgroundColor: '#111',
              border: '2px solid #333',
              position: 'relative'
            }}>
              {TETRIMINOS[nextPiece].shape.map((row, y) => row.map((cell, x) => (
                cell ? (
                  <div key={`next-${y}-${x}`} style={{
                    position: 'absolute',
                    top: (y + 1) * BLOCK_SIZE,
                    left: (x + 1) * BLOCK_SIZE,
                    width: BLOCK_SIZE,
                    height: BLOCK_SIZE,
                    backgroundColor: TETRIMINOS[nextPiece].color,
                    border: '1px solid rgba(255,255,255,0.3)'
                  }} />
                ) : null
              )))}
            </div>
          </div>
          <button
            onClick={togglePause}
            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mb-2 w-full"
          >
            {isPaused ? 'Продолжить' : 'Пауза'}
          </button>
          <button
            onClick={resetGame}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-full"
          >
            Новая игра
          </button>
        </div>
      </div>
      {(gameOver || isPaused) && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg text-center">
            <h3 className="text-2xl mb-4">{gameOver ? 'Игра окончена!' : 'Пауза'}</h3>
            {gameOver && <p className="mb-4">Ваш счет: {score}</p>}
            <button
              onClick={gameOver ? resetGame : togglePause}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              {gameOver ? 'Новая игра' : 'Продолжить'}
            </button>
          </div>
        </div>
      )}
      <div className="mt-4 text-sm text-gray-600">
        Используйте стрелки для управления, ↑ для вращения, пробел для быстрого падения
      </div>
    </div>
  );
};

export default Tetris;
