import { useEffect, useState } from "react";
import { useSpring, animated } from "@react-spring/web";
import Experience from "./components/3DExperience/Experience";
import * as THREE from "three";
import Loader from "./components/Loader/Loader";

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
        setTimeout(() => {
          setIsLoading(false);
        }, 1000)
      },

      // Progress
      (itemUrl, itemsLoaded, totalItems) => {
        const progressRatio = (itemsLoaded / totalItems) * 100;
        setLoadingProgress(progressRatio);
      }
    );

    // Example Loaders
    const textureLoader = new THREE.TextureLoader(loadingManager);
    textureLoader.load("/textures/color.jpg", () => { });

    const audioLoader = new THREE.AudioLoader(loadingManager);
    audioLoader.load("/static/audio/bg.mp3", () => { });
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
          zIndex: 10,
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