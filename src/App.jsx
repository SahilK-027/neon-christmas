import { useEffect, useState } from "react";
import { useSpring, animated } from "@react-spring/web";
import * as THREE from "three";
import Loader from "./components/Loader/Loader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import StoryCanvas from "./components/StoryCanvas/StoryCanvas";
import LandingPage from "./components/LandingPage/LandingPage";

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [enterStory, setEnterStory] = useState(false);

  const loaderSpring = useSpring({
    transform: isLoading ? "translateY(0%)" : "translateY(-100%)",
    opacity: isLoading ? 1 : 0,
    config: { tension: 100, friction: 100, duration: 1000 },
  });

  useEffect(() => {
    const loadingManager = new THREE.LoadingManager(
      // Loaded
      () => {
        setLoadingProgress(100);
        setTimeout(() => {
          setIsLoading(false);
        }, 800);
      },

      // Progress
      (itemUrl, itemsLoaded, totalItems) => {
        const progressRatio = (itemsLoaded / totalItems) * 100;
        setLoadingProgress(progressRatio);
      }
    );

    // Preload all images
    const textureLoader = new THREE.TextureLoader(loadingManager);
    textureLoader.load("/textures/color.jpg", () => {});
    textureLoader.load("/textures/normal.jpg", () => {});

    // Preload all models
    const dracoLoader = new DRACOLoader(loadingManager);
    dracoLoader.setDecoderPath("/draco/");
    const gltfLoader = new GLTFLoader(loadingManager);
    gltfLoader.setDRACOLoader(dracoLoader);
    gltfLoader.load("/models/xMas.glb", () => {});
    gltfLoader.load("/models/birth.glb", () => {});
    gltfLoader.load("/models/baptism.glb", () => {});
    gltfLoader.load("/models/crucifixion.glb", () => {});
    gltfLoader.load("/models/ascension.glb", () => {});

    // Preload all audio
    const audioLoader = new THREE.AudioLoader(loadingManager);
    audioLoader.load("/audio/bg.mp3", () => {});
    audioLoader.load("/audio/ascension.mp3", () => {});
    audioLoader.load("/audio/baptism.mp3", () => {});
    audioLoader.load("/audio/birth.mp3", () => {});
    audioLoader.load("/audio/crucifixion.mp3", () => {});
  }, []);

  return (
    <>
      <animated.div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000",
          zIndex: 5,
          ...loaderSpring,
        }}
      >
        <Loader progress={loadingProgress} />
      </animated.div>
      <LandingPage enterStory={enterStory} setEnterStory={setEnterStory} />
      <StoryCanvas startStory={enterStory} startParallax={enterStory} />
    </>
  );
};

export default App;
