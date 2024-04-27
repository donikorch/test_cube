import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useEffect, useState } from 'react';
import * as THREE from 'three';

export function CubeContainer() {
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=59.9386&longitude=30.3141&daily=temperature_2m_max&timezone=Europe%2FMoscow'
    )
      .then((response) => response.json())
      .then((data) => {
        setWeatherData(data.daily);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching weather data:', error);
        setIsLoading(false);
      });
  }, []);

  const createWeatherTextures = (temp, date) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const width = 256;
    const height = 256;

    canvas.width = width;
    canvas.height = height;

    context.fillStyle = 'white';
    context.font = '20px Arial';
    context.fillText(`Date: ${date}`, 10, 30);
    context.fillText(`Max Temp: ${temp}°C`, 10, 60);

    // Создать текстуру из canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    return texture;
  };

  function getPosition(side) {
    const size = 3;

    const positions = {
      front: [0, 0, size / 2],
      back: [0, 0, -size / 2],
      left: [-size / 2, 0, 0],
      right: [size / 2, 0, 0],
      top: [0, size / 2, 0],
      bottom: [0, -size / 2, 0],
    };

    return positions[side];
  }

  function getRotation(side) {
    const rotations = {
      front: [0, 0, 0],
      back: [0, Math.PI, 0],
      left: [0, -Math.PI / 2, 0],
      right: [0, Math.PI / 2, 0],
      top: [-Math.PI / 2, 0, 0],
      bottom: [Math.PI / 2, 0, 0],
    };

    return rotations[side];
  }

  return (
    <Canvas>
      <OrbitControls />
      <ambientLight />
      <directionalLight position={[2, 1, 1]} />

      {isLoading ? (
        <mesh>
          <boxGeometry args={[3, 3, 3]} />
          <meshStandardMaterial color='gray' />
        </mesh>
      ) : (
        ['front', 'back', 'left', 'right', 'top', 'bottom'].map(
          (side, index) => (
            <mesh
              key={index}
              position={getPosition(side)}
              rotation={getRotation(side)}
            >
              <planeGeometry args={[3, 3]} />
              <meshStandardMaterial
                map={createWeatherTextures(
                  weatherData.temperature_2m_max[index],
                  weatherData.time[index]
                )}
              />
            </mesh>
          )
        )
      )}
    </Canvas>
  );
}
