"use client";

import React, { useState, useEffect, useRef } from 'react';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const SHIP_SIZE = 20;
const ASTEROID_COUNT = 5;
const BULLET_SPEED = 5;

interface Point {
  x: number;
  y: number;
}

interface Asteroid {
  position: Point;
  velocity: Point;
  radius: number;
}

interface Bullet {
  position: Point;
  velocity: Point;
}

const Asteroids: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ship, setShip] = useState<Point>({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 });
  const [shipAngle, setShipAngle] = useState(0);
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const initAsteroids = () => {
      const newAsteroids: Asteroid[] = [];
      for (let i = 0; i < ASTEROID_COUNT; i++) {
        newAsteroids.push({
          position: { x: Math.random() * CANVAS_WIDTH, y: Math.random() * CANVAS_HEIGHT },
          velocity: { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 },
          radius: Math.random() * 20 + 10
        });
      }
      setAsteroids(newAsteroids);
    };

    initAsteroids();

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          setShipAngle(angle => angle - 0.1);
          break;
        case 'ArrowRight':
          setShipAngle(angle => angle + 0.1);
          break;
        case 'ArrowUp':
          setShip(prevShip => ({
            x: prevShip.x + Math.cos(shipAngle) * 5,
            y: prevShip.y + Math.sin(shipAngle) * 5
          }));
          break;
        case ' ':
          setBullets(prevBullets => [
            ...prevBullets,
            {
              position: { ...ship },
              velocity: { x: Math.cos(shipAngle) * BULLET_SPEED, y: Math.sin(shipAngle) * BULLET_SPEED }
            }
          ]);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const gameLoop = setInterval(() => {
      if (gameOver) return;

      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw ship
      ctx.save();
      ctx.translate(ship.x, ship.y);
      ctx.rotate(shipAngle);
      ctx.beginPath();
      ctx.moveTo(SHIP_SIZE, 0);
      ctx.lineTo(-SHIP_SIZE / 2, -SHIP_SIZE / 2);
      ctx.lineTo(-SHIP_SIZE / 2, SHIP_SIZE / 2);
      ctx.closePath();
      ctx.strokeStyle = 'white';
      ctx.stroke();
      ctx.restore();

      // Update and draw asteroids
      setAsteroids(prevAsteroids => prevAsteroids.map(asteroid => {
        asteroid.position.x += asteroid.velocity.x;
        asteroid.position.y += asteroid.velocity.y;

        if (asteroid.position.x < 0) asteroid.position.x = CANVAS_WIDTH;
        if (asteroid.position.x > CANVAS_WIDTH) asteroid.position.x = 0;
        if (asteroid.position.y < 0) asteroid.position.y = CANVAS_HEIGHT;
        if (asteroid.position.y > CANVAS_HEIGHT) asteroid.position.y = 0;

        ctx.beginPath();
        ctx.arc(asteroid.position.x, asteroid.position.y, asteroid.radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'white';
        ctx.stroke();

        return asteroid;
      }));

      // Update and draw bullets
      setBullets(prevBullets => prevBullets.filter(bullet => {
        bullet.position.x += bullet.velocity.x;
        bullet.position.y += bullet.velocity.y;

        ctx.beginPath();
        ctx.arc(bullet.position.x, bullet.position.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();

        // Check collision with asteroids
        asteroids.forEach((asteroid, index) => {
          const dx = bullet.position.x - asteroid.position.x;
          const dy = bullet.position.y - asteroid.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < asteroid.radius) {
            setScore(prevScore => prevScore + 1);
            setAsteroids(prevAsteroids => [
              ...prevAsteroids.slice(0, index),
              ...prevAsteroids.slice(index + 1)
            ]);
            return false;
          }
        });

        return bullet.position.x > 0 && bullet.position.x < CANVAS_WIDTH &&
               bullet.position.y > 0 && bullet.position.y < CANVAS_HEIGHT;
      }));

      // Check collision between ship and asteroids
      asteroids.forEach(asteroid => {
        const dx = ship.x - asteroid.position.x;
        const dy = ship.y - asteroid.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < asteroid.radius + SHIP_SIZE / 2) {
          setGameOver(true);
        }
      });

      // Draw score
      ctx.font = '20px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText(`Score: ${score}`, 10, 30);

    }, 1000 / 60);

    return () => {
      clearInterval(gameLoop);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [ship, shipAngle, asteroids, bullets, score, gameOver]);

  const resetGame = () => {
    setShip({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 });
    setShipAngle(0);
    setAsteroids([]);
    setBullets([]);
    setScore(0);
    setGameOver(false);
  };

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="border border-gray-300 bg-black" />
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
        Используйте стрелки для управления кораблем, пробел для стрельбы
      </div>
    </div>
  );
};

export default Asteroids;
