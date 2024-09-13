import LammaWalkingLeft from "@/assets/lamma_inf_walking_left.gif";
import LammaWalkingRight from "@/assets/lamma_inf_walking_right.gif";
import LammaStandLeft from "@/assets/lamma_stand_left.png";
import LammaStandRight from "@/assets/lamma_stand_right.png";
import InteractiveMap from "@/components/InteractiveMap";
import ImgButton from "@/components/ui/imgButton";
import { useGameStore } from "@/store/useGameStore";
import { useEffect, useState } from "react";

const GameMap = () => {
  const { goToTown, currentIslandLevel, setCurrentIslandLevel, lammaPosition, setLammaPosition } = useGameStore();

  // TODO: Need the coordinates (in percentage of the map width and height) for all the black dots
  const interactivePoints = [
    { x: 79, y: 78, level: 1 },
    { x: 74.2, y: 79.6, level: 2 },
    { x: 69.4, y: 79.6, level: 3 },
    { x: 64.6, y: 77.9, level: 4 },
    { x: 60.6, y: 72.8, level: 5 },
  ];

  console.log("currentIslandLevel", currentIslandLevel);
  const [path, setPath] = useState<{ x: number; y: number }[]>([]);
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  const [stepDistance, setStepDistance] = useState("0.5");
  const [stepTime, setStepTime] = useState("50");

  const [tempLammaPosition, setTempLammaPosition] = useState(lammaPosition);

  const lammaWidth = 6;
  const lammaHeight = 8.5;

  console.log("tempLammaPosition", tempLammaPosition);
  console.log("lammaPosition", lammaPosition);

  useEffect(() => {
    if (path.length > 0 && currentPathIndex < path.length) {
      const interval = setInterval(() => {
        setTempLammaPosition((prev) => {
          const targetPoint = path[currentPathIndex];
          const lammaBottomCenterX = prev.x + lammaWidth / 2;
          const lammaBottomCenterY = prev.y + lammaHeight;

          const dx = targetPoint.x - lammaBottomCenterX;
          const dy = targetPoint.y - lammaBottomCenterY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 0.5) {
            if (currentPathIndex === path.length - 1) {
              clearInterval(interval);
            } else {
              setCurrentPathIndex(currentPathIndex + 1);
            }
            setLammaPosition({
              x: targetPoint.x - lammaWidth / 2,
              y: targetPoint.y - lammaHeight,
              src: dx >= 0 ? LammaStandRight : LammaStandLeft,
            });
            return {
              x: targetPoint.x - lammaWidth / 2,
              y: targetPoint.y - lammaHeight,
              src: dx >= 0 ? LammaStandRight : LammaStandLeft,
            };
          }

          const step = parseFloat(stepDistance);
          const ratio = Math.min(step / distance, 1);
          const newX = prev.x + dx * ratio;
          const newY = prev.y + dy * ratio;

          return {
            x: newX,
            y: newY,
            src: dx >= 0 ? LammaWalkingRight : LammaWalkingLeft,
          };
        });
      }, parseInt(stepTime));

      return () => {
        clearInterval(interval);
      };
    }
  }, [path, currentPathIndex]);

  const handleLevelSelect = (level: number) => {
    console.log(`Level ${level} selected`);
    const currentIndex =
      interactivePoints.findIndex((point) => point.level === currentIslandLevel) == -1 ? 0 : interactivePoints.findIndex((point) => point.level === currentIslandLevel);
    const targetIndex = interactivePoints.findIndex((point) => point.level === level);

    // if (currentIndex !== -1 && targetIndex !== -1) {
    let newPath;
    if (currentIndex < targetIndex) {
      // Moving forward
      newPath = interactivePoints.slice(currentIndex, targetIndex + 1);
    } else {
      // Moving backward
      newPath = interactivePoints.slice(targetIndex, currentIndex + 1).reverse();
    }

    setPath(newPath.map((point) => ({ x: point.x, y: point.y })));
    setCurrentPathIndex(0);
    setCurrentIslandLevel(level);
  };

  return (
    <div className="h-screen w-screen bg-cover bg-center" style={{ backgroundImage: "url('https://arweave.net/V3z2O7IKsS8zBqaHFCkl0xdFssQtI-B9cS-bGybudiQ')" }}>
      <audio autoPlay loop>
        <source src="https://arweave.net/yW2M75jkljOj3I-Wv2Cs0A3Dqkn4MVdyCRfqkQL8pMs" type="audio/mpeg" />
      </audio>
      <div className="z-10 absolute top-4 right-4">
        <ImgButton src={"https://arweave.net/HyDiIRRNS5SdV3Q52RUNp-5YwKZjNwDIuOPLSUdvK7A"} onClick={() => goToTown()} alt={"Return to Town"} />
      </div>
      {/* <p className="text-sm text-red-500">Finetune the step distance and time to control the Lamma's movement.</p>
      <label>Step Distance (% of map width between 0-1)</label>
      <Input value={stepDistance} onChange={(e) => setStepDistance(e.target.value)} />
      <label>Step Time (in ms)</label>
      <Input value={stepTime} onChange={(e) => setStepTime(e.target.value)} /> */}
      <InteractiveMap lammaPosition={tempLammaPosition} interactivePoints={interactivePoints} onLevelSelect={handleLevelSelect} />
    </div>
  );
};

export default GameMap;
