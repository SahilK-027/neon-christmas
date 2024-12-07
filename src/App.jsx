import {
  Backdrop,
  OrbitControls,
  Reflector,
  useGLTF,
  useTexture,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { KernelSize } from "postprocessing";
import { Perf } from "r3f-perf";
import { useEffect } from "react";
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
  return <primitive object={scene} scale={0.75} position={[0, 0, 0]} />;
};

const Ground = (props) => {
  const [floor, normal] = useTexture([
    "/textures/color.jpg",
    "/textures/normal.jpg",
  ]);
  return (
    <Reflector resolution={512} args={[9, 15]} {...props}>
      {(Material, props) => (
        <Material
          color={"#fff"}
          metalness={0.1}
          roughnessMap={floor}
          normalMap={normal}
          normalScale={[2, 2]}
          {...props}
        />
      )}
    </Reflector>
  );
};

const App = () => {
  return (
    <Canvas dpr={[1, 1.5]}>
      {/* Setup */}
      <Perf position="top-left" />
      <color attach="background" args={["#121316"]} />
      <OrbitControls />

      {/* Light */}
      <ambientLight />
      <fog attach="fog" args={["#522d17", 6, 20]} />
      <EffectComposer multisampling={2}>
        <Bloom
          kernelSize={KernelSize.SMALL}
          luminanceThreshold={0.2}
          intensity={0.5}
        />
        <Bloom
          kernelSize={KernelSize.HUGE}
          luminanceThreshold={0}
          intensity={0.5}
        />
      </EffectComposer>

      {/* Model */}
      <CurveModel />

      {/* Backdrop */}
      <Backdrop floor={2} position={[0, -0.5, -4.75]} scale={[30, 10, 5]}>
        <meshStandardMaterial color="#121316" envMapIntensity={0.1} />
      </Backdrop>

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
