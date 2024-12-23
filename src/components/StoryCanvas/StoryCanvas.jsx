import { Backdrop, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { folder, Leva, useControls } from "leva";
import { Perf } from "r3f-perf";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
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

  const {
    fogColor,
    fogNear,
    fogFar,
    ambientLightIntensity,
    luminanceThreshold1,
    intensity1,
    luminanceThreshold2,
    intensity2,
    backDropPositionX,
    backDropPositionY,
    backDropPositionZ,
    backDropScaleX,
    backDropScaleY,
    backDropScaleZ,
    backdropColor,
  } = useControls({
    scene: folder({
      fogColor: { value: primitivesData[currentModel].fogColor },
      fogNear: { value: 7.1, min: 1, max: 10, step: 0.01 },
      fogFar: { value: 20.3, min: 1, max: 50, step: 0.01 },
      ambientLightIntensity: { value: 1, min: 0, max: 5, step: 0.01 },
    }),
    bloom: folder({
      luminanceThreshold1: { value: 0.2, min: 0, max: 1, step: 0.001 },
      intensity1: { value: 0.3, min: 0, max: 1, step: 0.001 },
      luminanceThreshold2: { value: 0, min: 0, max: 1, step: 0.001 },
      intensity2: { value: 0.2, min: 0, max: 1, step: 0.001 },
    }),
    backDrop: folder({
      backDropPositionX: { value: 0, min: 0, max: 10, step: 0.001 },
      backDropPositionY: { value: -0.5, min: -2, max: 2, step: 0.001 },
      backDropPositionZ: { value: -4.75, min: -5, max: 5, step: 0.001 },
      backDropScaleX: { value: 50, min: 0, max: 100, step: 0.001 },
      backDropScaleY: { value: 10, min: 0, max: 50, step: 0.001 },
      backDropScaleZ: { value: 5, min: 0, max: 10, step: 0.001 },
      backdropColor: { value: "#121316" },
    }),
  });

  return (
    <>
      <div id="story-board">
        <Story
          start={startStory}
          currentModel={currentModel}
          setCurrentModel={setCurrentModel}
          setProgressPercentage={setProgressPercentage}
        />
        <Leva collapsed />
        <Canvas dpr={[1, 1.5]}>
          {/* Setup */}
          {/* <Perf position="top-left" /> */}
          <color attach="background" args={["#121316"]} />
          <OrbitControls />

          {/* Light & Post Processing */}
          <LightingAndEffects
            ambientLightIntensity={ambientLightIntensity}
            fogColor={fogColor}
            fogNear={fogNear}
            fogFar={fogFar}
            luminanceThreshold1={luminanceThreshold1}
            intensity1={intensity1}
            luminanceThreshold2={luminanceThreshold2}
            intensity2={intensity2}
          />

          {/* Parallax effect */}
          <group position={[0, -0.6, 0]}>
            <Parallax startParallax={startParallax}>
              {/* Model */}
              <NeonModel
                modelPath={primitivesData[currentModel].path}
                curveConfigs={primitivesData[currentModel].shaders}
              />

              {/* Backdrop */}
              <Backdrop
                floor={2}
                position={[
                  backDropPositionX,
                  backDropPositionY,
                  backDropPositionZ,
                ]}
                scale={[backDropScaleX, backDropScaleY, backDropScaleZ]}
              >
                <meshStandardMaterial
                  color={backdropColor}
                  envMapIntensity={0.1}
                />
              </Backdrop>
            </Parallax>

            {/* Ground */}
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
