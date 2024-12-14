import { useEffect, useState } from "react";
import { useSpring, animated } from "@react-spring/web";
import Experience from "./components/Experience";
import Loader from "./components/Loader/Loader";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

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
        setIsLoading(false);
      },
      // In progress
      (itemURL, itemsLoaded, totalItems) => {
        console.log("itemURL", itemURL);
        const percentProgress = (itemsLoaded / totalItems) * 100;
        setLoadingProgress(percentProgress);
      }
    );

    // Pre-Load all images
    const textureLoader = new THREE.TextureLoader(loadingManager);
    textureLoader.load("/textures/color.jpg", () => {});

    // Pre-load all 3d models
    const dracoLoader = new DRACOLoader(loadingManager);
    dracoLoader.setDecoderPath("/static/draco/");
    const gltfLoader = new GLTFLoader(loadingManager);
    gltfLoader.setDRACOLoader(dracoLoader);
    gltfLoader.load("/models/birth2.glb", () => {});

    // Pre-load all audio
    const audioLoader = new THREE.AudioLoader(loadingManager);
    audioLoader.load("/static/audio/bg.mp3", () => {});
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
          zIndex: 1,
          ...loaderSpring,
        }}
      >
        <Loader progress={loadingProgress} />
      </animated.div>
      <Experience isLoading={isLoading} />
    </>
  );
};

export default App;
