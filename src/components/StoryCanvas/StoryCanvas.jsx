import { Backdrop } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useRef, useState, useMemo, useCallback } from "react";
import { useEffect } from "react";
import Story from "./Story/Story";
import { MemoizedGround as Ground } from "../Ground/Ground";
import Parallax from "../Parallax/Parallax";
import LightingAndEffects from "../LightingAndEffects/LightingAndEffects";
import NeonModel from "../NeonModel/NeonModel";
import primitivesData from "../../utils/primitivesData";
import StoryProgressBar from "./StoryProgressBar/StoryProgressBar";
import "./StoryCanvas.scss";
import { Perf } from "r3f-perf";

// Separate scene configuration to prevent re-renders
const defaultSceneConfig = {
  fogNear: 7.1,
  fogFar: 20.3,
  ambientLightIntensity: 1,
  luminanceThreshold1: 0.2,
  intensity1: 0.3,
  luminanceThreshold2: 0,
  intensity2: 0.2,
  backDropPosition: [0, -0.5, -4.75],
  backDropScale: [50, 10, 5],
  backdropColor: "#121316",
};

const StoryCanvas = ({ startStory, startParallax }) => {
  const [currentModel, setCurrentModel] = useState("birthModel");
  const [progressPercentage, setProgressPercentage] = useState(0);
  const storyRef = useRef();
  const modelRef = useRef();
  const disposedModels = useRef(new Set());

  // Memoize scene configuration
  const sceneConfig = useMemo(
    () => ({
      ...defaultSceneConfig,
      fogColor: primitivesData[currentModel]?.fogColor,
    }),
    [currentModel]
  );

  // Model management functions
  const disposeUnusedModels = useCallback((modelsToDispose) => {
    modelsToDispose.forEach((modelName) => {
      if (modelRef.current?.[modelName]) {
        modelRef.current[modelName].geometry?.dispose();
        modelRef.current[modelName].material?.dispose();
        if (modelRef.current[modelName].texture) {
          modelRef.current[modelName].texture.dispose();
        }
        disposedModels.current.add(modelName);
      }
    });
  }, []);

  const preloadModel = useCallback((modelName) => {
    if (disposedModels.current.has(modelName)) {
      // Implement model preloading logic here
      // This could involve pre-fetching the model data
      disposedModels.current.delete(modelName);
    }
  }, []);

  // Attach model management functions to window for Story component
  useEffect(() => {
    window.disposeUnusedModels = disposeUnusedModels;
    window.preloadModel = preloadModel;

    return () => {
      delete window.disposeUnusedModels;
      delete window.preloadModel;
    };
  }, [disposeUnusedModels, preloadModel]);

  // Optimize chapter selection
  const handleChapterSelect = useCallback(
    (chapterIndex) => {
      if (chapterIndex < 4) {
        const newModelName = primitivesData[chapterIndex]?.modelName || "";
        preloadModel(newModelName);
        setCurrentModel(newModelName);
        setProgressPercentage(chapterIndex * 25);
      }
      storyRef.current?.jumpToChapter(chapterIndex);
    },
    [preloadModel]
  );

  // Memoize backdrop configuration
  const backdropProps = useMemo(
    () => ({
      floor: 2,
      position: sceneConfig.backDropPosition,
      scale: sceneConfig.backDropScale,
    }),
    [sceneConfig.backDropPosition, sceneConfig.backDropScale]
  );

  // Memoize ground configuration
  const groundProps = useMemo(
    () => ({
      mirror: 1,
      blur: [400, 100],
      mixBlur: 12,
      mixStrength: 1.5,
      rotation: [-Math.PI / 2, 0, Math.PI / 2],
      position: [0, -0.4, 0],
    }),
    []
  );

  return (
    <div id="story-board">
      <Story
        ref={storyRef}
        start={startStory}
        currentModel={currentModel}
        setCurrentModel={setCurrentModel}
        setProgressPercentage={setProgressPercentage}
      />
      <Canvas
        dpr={[1, Math.min(window.devicePixelRatio, 2)]}
        performance={{ min: 0.8 }}
        gl={{
          powerPreference: "high-performance",
          antialias: window.devicePixelRatio <= 1.5,
          alpha: true,
        }}
      >
        {/* <Perf position="top-left" /> */}
        <color attach="background" args={["#121316"]} />
        <Suspense fallback={null}>
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
                ref={modelRef}
                modelPath={primitivesData[currentModel].path}
                curveConfigs={primitivesData[currentModel].shaders}
                dispose={disposeUnusedModels}
              />
              <Backdrop {...backdropProps}>
                <meshStandardMaterial
                  color={sceneConfig.backdropColor}
                  envMapIntensity={0.1}
                />
              </Backdrop>
            </Parallax>
            <Ground {...groundProps} />
          </group>
        </Suspense>
      </Canvas>
      <StoryProgressBar
        progressPercentage={progressPercentage}
        onChapterSelect={handleChapterSelect}
      />
    </div>
  );
};

export default StoryCanvas;
