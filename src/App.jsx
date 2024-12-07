import {
  Backdrop,
  OrbitControls,
  Reflector,
  useGLTF,
  useTexture,
} from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { folder, useControls } from "leva";
import { KernelSize } from "postprocessing";
import { Perf } from "r3f-perf";
import { useEffect, useRef } from "react";
import * as THREE from "three";

const CurveModel = () => {
  const { scene } = useGLTF("/models/curve.glb");
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        if (!(child.material instanceof THREE.MeshStandardMaterial)) {
          child.material = new THREE.MeshStandardMaterial({
            color: child.material.color,
            map: child.material.map,
          });
        }

        child.material.emissive = new THREE.Color("orange");
        child.material.emissiveIntensity = 2;
        child.material.needsUpdate = true;
      }
    });
  }, [scene]);
  return <primitive object={scene} scale={1} position={[0, 0, 0]} />;
};

const Ground = (props) => {
  const { resolution, scaleX, scaleY, metalness, normalScaleX, normalScaleY } =
    useControls({
      reflector: folder({
        resolution: { value: 512, min: 256, max: 1024, step: 100 },
        scaleX: { value: 9, min: 1, max: 20, step: 0.01 },
        scaleY: { value: 15, min: 1, max: 20, step: 0.01 },
        metalness: { value: 0.1, min: 0, max: 1, step: 0.01 },
        normalScaleX: { value: 2, min: 1, max: 5, step: 0.01 },
        normalScaleY: { value: 2, min: 1, max: 5, step: 0.01 },
      }),
    });

  const [floor, normal] = useTexture([
    "/textures/color.jpg",
    "/textures/normal.jpg",
  ]);
  return (
    <Reflector resolution={resolution} args={[scaleX, scaleY]} {...props}>
      {(Material, props) => (
        <Material
          color={"#fff"}
          metalness={metalness}
          roughnessMap={floor}
          normalMap={normal}
          normalScale={[normalScaleX, normalScaleY]}
          {...props}
        />
      )}
    </Reflector>
  );
};

const Parallax = ({ children }) => {
  const ref = useRef();
  const vec3 = new THREE.Vector3();
  const { camera, mouse } = useThree();

  useFrame(() => {
    // Camera position should get smoothly set according to mouse position
    camera.position.lerp(vec3.set(mouse.x * 0.05, 0, 3.0), 0.05);

    // Objects within parallax
    ref.current.position.lerp(
      vec3.set(-1 * mouse.x * 0.75, -1 * mouse.y * 0.1, 0),
      0.05
    );

    // Rotate objects within parallax
    ref.current.rotation.y = THREE.MathUtils.lerp(
      ref.current.rotation.y,
      (-1 * mouse.x * Math.PI) / 20,
      0
    );
  });

  return <group ref={ref}>{children}</group>;
};

const App = () => {
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
      fogColor: { value: "#522d17" },
      fogNear: { value: 6, min: 1, max: 10, step: 0.01 },
      fogFar: { value: 20, min: 1, max: 50, step: 0.01 },
      ambientLightIntensity: { value: 1, min: 0, max: 5, step: 0.01 },
    }),
    bloom: folder({
      luminanceThreshold1: { value: 0.2, min: 0, max: 1, step: 0.001 },
      intensity1: { value: 0.5, min: 0, max: 1, step: 0.001 },
      luminanceThreshold2: { value: 0, min: 0, max: 1, step: 0.001 },
      intensity2: { value: 0.5, min: 0, max: 1, step: 0.001 },
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
    <Canvas dpr={[1, 1.5]}>
      {/* Setup */}
      <Perf position="top-left" />
      <color attach="background" args={["#121316"]} />
      <OrbitControls />

      {/* Light */}
      <ambientLight ambientLightIntensity={ambientLightIntensity} />
      <fog attach="fog" args={[fogColor, fogNear, fogFar]} />
      <EffectComposer multisampling={2}>
        <Bloom
          kernelSize={KernelSize.SMALL}
          luminanceThreshold={luminanceThreshold1}
          intensity={intensity1}
        />
        <Bloom
          kernelSize={KernelSize.HUGE}
          luminanceThreshold={luminanceThreshold2}
          intensity={intensity2}
        />
      </EffectComposer>

      {/* Parallax effect */}
      <Parallax>
        {/* Model */}
        <CurveModel />

        {/* Backdrop */}
        <Backdrop
          floor={2}
          position={[backDropPositionX, backDropPositionY, backDropPositionZ]}
          scale={[backDropScaleX, backDropScaleY, backDropScaleZ]}
        >
          <meshStandardMaterial color={backdropColor} envMapIntensity={0.1} />
        </Backdrop>
      </Parallax>

      {/* Ground */}
      <Ground
        mirror={1}
        blur={[100, 50]}
        mixBlur={12}
        mixStrength={1.5}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        position={[0, -0.4, 0]}
      />
    </Canvas>
  );
};

export default App;
