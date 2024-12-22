import React, { useEffect, useRef, useState } from "react";
import "./LandingPage.scss";
import { Canvas } from "@react-three/fiber";
import { Backdrop, OrbitControls } from "@react-three/drei";
import LightingAndEffects from "../LightingAndEffects/LightingAndEffects";
import Parallax from "../Parallax/Parallax";
import NeonModel from "../NeonModel/NeonModel";
import Ground from "../Ground/Ground";
import { folder, useControls } from "leva";
import primitivesData from "../../utils/primitivesData";
import * as THREE from "three";
import { useSpring, animated } from "@react-spring/web";

const LandingPage = ({ enterStory, setEnterStory }) => {
  const [currentModel, setCurrentModel] = useState("xMasModel");
  const [shouldDisplay, setShouldDisplay] = useState(true);
  const [IsFullScreen, setIsFullScreen] = useState(false);
  const audioRef = useRef(new Audio("/audio/bg.mp3"));

  useEffect(() => {
    // Configure audio
    audioRef.current.loop = true;
    audioRef.current.volume = 0.05;

    // Cleanup on unmount
    return () => {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    };
  }, []);

  const landingSpring = useSpring({
    opacity: enterStory ? 0 : 1,
    config: { tension: 100, friction: 100, duration: 800 },
    onRest: () => {
      if (enterStory) {
        setShouldDisplay(false);
      }
    },
  });

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

  const enterFullScreen = () => {
    if (!IsFullScreen) {
      const elem = document.documentElement; // Entire page
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen(); // For Safari
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen(); // For IE11
      }
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen(); // For Safari
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen(); // For IE11
      }
      setIsFullScreen(false);
    }
  };

  const playBgMusic = () => {
    const audio = audioRef.current;
    audio.play().catch((error) => {
      console.error("Audio playback failed:", error);
    });
  };

  const enterToStory = () => {
    playBgMusic();
    enterFullScreen();
    setEnterStory(true);
  };

  return (
    <animated.div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
        background: "#000",
        zIndex: 4,
        display: shouldDisplay ? "flex" : "none",
        ...landingSpring,
      }}
    >
      <div id="landing-page">
        <div className="nav-row">
          <div className="dev">
            <p className="developer">
              Creative story experiment built with three.js & R3F by SahilK-027
            </p>
            <p className="headphone-info">
              Use <i className="fa-solid fa-headphones"></i> for immersive
              experience
            </p>
          </div>
        </div>
        <div className="footer-row">
          <div className="experience-name">
            <h1 className="neon">The</h1>
            <h1 className="neon">Neon Christmas</h1>
          </div>
          <div className="enter-button">
            <button onClick={enterToStory}>Enter</button>
            <h2>Explore the life of Jesus</h2>
          </div>
        </div>

        <Canvas dpr={[1, 1.5]}>
          <color attach="background" args={["#121316"]} />
          <OrbitControls />
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
          <group position={[0, -0.7, 0]}>
            <Parallax startParallax={true}>
              <NeonModel
                modelPath={primitivesData[currentModel].path}
                curveConfigs={primitivesData[currentModel].shaders}
              />
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
      </div>
    </animated.div>
  );
};

export default LandingPage;
