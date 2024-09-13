import { useCombatStore } from "@/store/useCombatStore";
import { GameStatePages, useGameStore } from "@/store/useGameStore";
import React from "react";

interface InteractivePoint {
  x: number;
  y: number;
  level: number;
}

const imageWidth = 1089; // original map width
const imageHeight = 611; // original map height

interface InteractiveMapProps {
  interactivePoints: InteractivePoint[];
  lammaPosition: LammaPosition;
  onLevelSelect: (level: number) => void;
  tempCurrentIslandLevel: number;
}

interface LammaPosition {
  x: number;
  y: number;
  src: string;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ tempCurrentIslandLevel, interactivePoints, lammaPosition, onLevelSelect }) => {
  const { currentIslandLevel } = useGameStore();

  const handleClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (event.target instanceof SVGElement && event.target.classList.contains("interactive-point")) {
      const level = event.target.getAttribute("data-level");
      // const buttonType = event.target.getAttribute("button-type");
      if (level) {
        console.log("level", level);
        onLevelSelect(parseInt(level));
      }
      // else if (buttonType) {
      //   if (buttonType === "combat") {
      //     enterNewBattle(currentIslandLevel);
      //     setGameStatePage(GameStatePages.COMBAT);
      //   }
      // }
    }
  };

  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0">
        {/* <img src={MapImage} alt="Game Map" className="w-full h-full object-contain" /> */}
        <img src={"https://arweave.net/nI5UoE2K_wRFpSsaYy3n286QSxBAdrglZ6va4D66pNA"} alt="Game Map" className="w-full h-full object-contain" />
        <svg width="100%" height="100%" viewBox={`0 0 ${imageWidth} ${imageHeight}`} preserveAspectRatio="xMidYMid meet" className="absolute top-0 left-0" onClick={handleClick}>
          {interactivePoints.map((point, index) => {
            // if current level is the same as the point level, then add the image to the point
            // let lammaImage = "" as any;
            // if (currentIslandLevel === point.level) {
            //   lammaImage = (
            //     <image href={lammaPosition.src} x={`${lammaPosition.x}%`} y={`${lammaPosition.y}%`} width="10%" height="10%" preserveAspectRatio="xMidYMid meet">
            //       <title>Lamma</title>
            //     </image>
            //   );
            // }
            return (
              <>
                <circle
                  key={index}
                  cx={`${point.x}%`}
                  cy={`${point.y}%`}
                  r="10.5"
                  className={`${Math.abs(currentIslandLevel - point.level) <= 1 && "interactive-point fill-red-500 hover:fill-green-500 transition-colors duration-200"}`}
                  data-level={point.level}
                />
              </>
            );
          })}
          <image href={lammaPosition.src} x={`${lammaPosition.x}%`} y={`${lammaPosition.y}%`} width="6%" height="10%" preserveAspectRatio="xMidYMid meet">
            <title>Lamma</title>
          </image>
          {/* <LoadUserDetails /> */}
          {/* {currentIslandLevel != 0 && (
            <image
              href={"https://arweave.net/bHrruH7w5-XmymuvXL9ZuxITu1aRxw2rtddi2v0FUxE"}
              x={"50%"}
              y={"90%"}
              button-type="combat"
              className={`interactive-point  ${currentIslandLevel != 0 ? "grow-image" : ""}`}
              preserveAspectRatio="xMidYMid meet"
              width={(277 / imageWidth) * 100 * 0.8 + "%"}
              height={(65 / imageHeight) * 100 * 0.8 + "%"}
            />
          )} */}
        </svg>
      </div>
    </div>
  );
};

export default InteractiveMap;
