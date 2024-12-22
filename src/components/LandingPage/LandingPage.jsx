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

const LandingPage = ({
  enterStory,
  setEnterStory,
  isMusicOn,
  setIsMusicOn,
}) => {
  const [currentModel, setCurrentModel] = useState("xMasModel");
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const audioRef = useRef(null);
  const listenerRef = useRef(null);

  const landingSpring = useSpring({
    // transform: enterStory ? "translateY(-100%)" : "translateY(0%)",
    opacity: enterStory ? 0 : 1,
    config: { tension: 100, friction: 100, duration: 800 },
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

  const initializeAudio = async () => {
    if (!listenerRef.current) {
      listenerRef.current = new THREE.AudioListener();
    }

    if (!audioRef.current) {
      audioRef.current = new THREE.Audio(listenerRef.current);
    }

    try {
      const audioLoader = new THREE.AudioLoader();
      const buffer = await new Promise((resolve, reject) => {
        audioLoader.load("/audio/landing.mp3", resolve, undefined, reject);
      });

      audioRef.current.setBuffer(buffer);
      audioRef.current.setLoop(true);
      audioRef.current.setVolume(0.2);
      setIsAudioInitialized(true);

      if (isMusicOn) {
        await audioRef.current.play();
      }
    } catch (error) {
      console.error("Error initializing audio:", error);
    }
  };

  const loadBackgroundMusic = async () => {
    try {
      if (!audioRef.current || !isAudioInitialized) return;

      audioRef.current.stop();
      const audioLoader = new THREE.AudioLoader();
      const buffer = await new Promise((resolve, reject) => {
        audioLoader.load("/audio/bg.mp3", resolve, undefined, reject);
      });

      audioRef.current.setBuffer(buffer);
      audioRef.current.setLoop(true);
      audioRef.current.setVolume(0.8);

      // Always play background music when entering story
      await audioRef.current.play();
      if (!isMusicOn) {
        setIsMusicOn(true);
      }
    } catch (error) {
      console.error("Error loading background music:", error);
    }
  };

  useEffect(() => {
    initializeAudio();

    return () => {
      if (audioRef.current) {
        audioRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (enterStory) {
      loadBackgroundMusic();
    }
  }, [enterStory]);

  const toggleMusic = async () => {
    if (!audioRef.current || !isAudioInitialized) {
      await initializeAudio();
    }

    try {
      if (isMusicOn) {
        audioRef.current.pause();
      } else {
        await audioRef.current.play();
      }
      setIsMusicOn(!isMusicOn);
    } catch (error) {
      console.error("Error toggling audio:", error);
    }
  };

  const enterToStory = () => {
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
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#000",
        zIndex: 3,
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
          <div className="music-bars" onClick={toggleMusic}>
            <span className={`stroke ${isMusicOn ? "active" : ""}`}></span>
            <span className={`stroke ${isMusicOn ? "active" : ""}`}></span>
            <span className={`stroke ${isMusicOn ? "active" : ""}`}></span>
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
