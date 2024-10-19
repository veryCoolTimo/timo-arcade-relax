"use client";

import dynamic from 'next/dynamic';
import { useState, useRef, useEffect } from 'react';

const Snake = dynamic(() => import('../components/games/Snake'), { ssr: false });
const Tetris = dynamic(() => import('../components/games/Tetris'), { ssr: false });
const Pacman = dynamic(() => import('../components/games/Pacman'), { ssr: false });
const Arkanoid = dynamic(() => import('../components/games/Arkanoid'), { ssr: false });
const Asteroids = dynamic(() => import('../components/games/Asteroids'), { ssr: false });

export default function Home() {
  const [currentGame, setCurrentGame] = useState<'snake' | 'tetris' | 'pacman' | 'arkanoid' | 'asteroids' | null>(null);
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentGame && gameRef.current) {
      gameRef.current.focus();
    }

    const preventScroll = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', preventScroll);

    return () => {
      window.removeEventListener('keydown', preventScroll);
    };
  }, [currentGame]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-500 to-purple-600 text-white">
      <header className="bg-blue-700 p-4 shadow-md">
        <h1 className="text-3xl font-bold text-center">Timo Arcade Relax</h1>
      </header>

      <main className="flex-grow container mx-auto p-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-blue-800">Выберите игру</h2>
          <div className="flex justify-center space-x-4 mb-4 flex-wrap">
            <button
              onClick={() => setCurrentGame('snake')}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded m-2"
            >
              Змейка
            </button>
            <button
              onClick={() => setCurrentGame('tetris')}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded m-2"
            >
              Тетрис
            </button>
            <button
              onClick={() => setCurrentGame('pacman')}
              className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded m-2"
            >
              Пакман
            </button>
            <button
              onClick={() => setCurrentGame('arkanoid')}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-2"
            >
              Арканоид
            </button>
            <button
              onClick={() => setCurrentGame('asteroids')}
              className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded m-2"
            >
              Астероиды
            </button>
          </div>
          <div 
            ref={gameRef}
            tabIndex={0} 
            className="bg-gray-100 p-4 rounded-md outline-none"
            style={{ overflow: 'hidden' }}
          >
            {currentGame === 'snake' && <Snake />}
            {currentGame === 'tetris' && <Tetris />}
            {currentGame === 'pacman' && <Pacman />}
            {currentGame === 'arkanoid' && <Arkanoid />}
            {currentGame === 'asteroids' && <Asteroids />}
            {!currentGame && <p className="text-center text-gray-600">Выберите игру, чтобы начать</p>}
          </div>
        </div>
        <div className="text-center">
          <p className="text-xl mb-4">Добро пожаловать в мир классических аркадных игр!</p>
          <p>Расслабьтесь и наслаждайтесь игрой в змейку, тетрис, пакмана, арканоид или астероиды.</p>
        </div>
      </main>

      <footer className="bg-blue-800 p-4 text-center">
        <p>&copy; 2023 Timo Arcade Relax. Все права защищены.</p>
      </footer>
    </div>
  );
}
