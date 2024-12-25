import { Backdrop, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useState } from "react";
import Story from "./Story/Story";
import Ground from "../Ground/Ground";
import Parallax from "../Parallax/Parallax";
import LightingAndEffects from "../LightingAndEffects/LightingAndEffects";
import NeonModel from "../NeonModel/NeonModel";
import primitivesData from "../../utils/primitivesData";
import StoryProgressBar from "./StoryProgressBar/StoryProgressBar";
import "./StoryCanvas.scss";

const StoryCanvas = ({ startStory, startParallax }) => {
  const [currentModel, setCurrentModel] = useState("birthModel");
  const [progressPercentage, setProgressPercentage] = useState(0);

  const sceneConfig = {
    // Scene settings
    fogColor: primitivesData[currentModel].fogColor,
    fogNear: 7.1,
    fogFar: 20.3,
    ambientLightIntensity: 1,

    // Bloom settings
    luminanceThreshold1: 0.2,
    intensity1: 0.3,
    luminanceThreshold2: 0,
    intensity2: 0.2,

    // Backdrop settings
    backDropPosition: [0, -0.5, -4.75],
    backDropScale: [50, 10, 5],
    backdropColor: "#121316",
  };

  return (
    <>
      <div id="story-board">
        <Story
          start={startStory}
          currentModel={currentModel}
          setCurrentModel={setCurrentModel}
          setProgressPercentage={setProgressPercentage}
        />
        <Canvas dpr={[1, 1.5]}>
          <color attach="background" args={["#121316"]} />
          <OrbitControls />

          <LightingAndEffects
            ambientLightIntensity={sceneConfig.ambientLightIntensity}
            fogColor={sceneConfig.fogColor}
            fogNear={sceneConfig.fogNear}
            fogFar={sceneConfig.fogFar}
            luminanceThreshold1={sceneConfig.luminanceThreshold1}
            intensity1={sceneConfig.intensity1}
            luminanceThreshold2={sceneConfig.luminanceThreshold2}
            intensity2={sceneConfig.intensity2}
          />

          <group position={[0, -0.6, 0]}>
            <Parallax startParallax={startParallax}>
              <NeonModel
                modelPath={primitivesData[currentModel].path}
                curveConfigs={primitivesData[currentModel].shaders}
              />

              <Backdrop
                floor={2}
                position={sceneConfig.backDropPosition}
                scale={sceneConfig.backDropScale}
              >
                <meshStandardMaterial
                  color={sceneConfig.backdropColor}
                  envMapIntensity={0.1}
                />
              </Backdrop>
            </Parallax>

            <Ground
              mirror={1}
              blur={[400, 100]}
              mixBlur={12}
              mixStrength={1.5}
              rotation={[-Math.PI / 2, 0, Math.PI / 2]}
              position={[0, -0.4, 0]}
            />
          </group>
        </Canvas>

        <StoryProgressBar progressPercentage={progressPercentage} />
      </div>
    </>
  );
};

export default StoryCanvas;
