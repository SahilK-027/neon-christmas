import React from "react";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { KernelSize } from "postprocessing";

const LightingAndEffects = ({
  ambientLightIntensity = 1,
  fogColor = "#ffffff",
  fogNear = 1,
  fogFar = 100,
  luminanceThreshold1 = 0.9,
  intensity1 = 0.5,
  luminanceThreshold2 = 0.7,
  intensity2 = 1,
}) => {
  return (
    <>
      {/* Ambient Light */}
      <ambientLight intensity={ambientLightIntensity} />

      {/* Fog */}
      <fog attach="fog" args={[fogColor, fogNear, fogFar]} />

      {/* Post Processing */}
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
    </>
  );
};

export default LightingAndEffects;
