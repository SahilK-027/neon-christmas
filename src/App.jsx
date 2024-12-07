import { Backdrop, OrbitControls, useGLTF } from "@react-three/drei";
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
        child.material.emissiveIntensity = 1.5;
        child.material.needsUpdate = true;
      }
    });
  }, [scene]);
  return <primitive object={scene} scale={1.5} position={[0, 0, 0]} />;
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
      <Backdrop floor={2} position={[0, -0.5, -2]} scale={[30, 10, 5]}>
        <meshStandardMaterial color="#121316" envMapIntensity={0.1} />
      </Backdrop>
    </Canvas>
  );
};

export default App;
