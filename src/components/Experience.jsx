import {
  Backdrop,
  OrbitControls,
  Reflector,
  useGLTF,
  useTexture,
} from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { folder, Leva, useControls } from "leva";
import { KernelSize } from "postprocessing";
import { Perf } from "r3f-perf";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const CurveModel = () => {
  const {
    colorC1_a,
    colorC1_b,
    colorC2_a,
    colorC2_b,
    colorC3_a,
    colorC3_b,
    intensityC1,
    intensityC2,
    intensityC3,
  } = useControls({
    birthModel: folder({
      colorC1_a: { value: "#308bff" },
      colorC1_b: { value: "#4d35c4" },
      colorC2_a: { value: "#ff0662" },
      colorC2_b: { value: "#ffbd41" },
      colorC3_a: { value: "pink" },
      colorC3_b: { value: "#f75eff" },
      intensityC1: { value: 2, min: 0, max: 5, step: 0.01 },
      intensityC2: { value: 1.5, min: 0, max: 5, step: 0.01 },
      intensityC3: { value: 1, min: 0, max: 5, step: 0.01 },
    }),
  });
  // Shaders
  const vertexShader = `
    uniform vec3 uMouseWorld;
    uniform float uTime;
    
    varying vec3 vPosition;
    varying float vDistanceToMouse;

    void main() {
	    // Calculate distance to mouse
	    vec3 worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
	    float distanceToMouse = distance(worldPosition, uMouseWorld);
      
	    // fallOff calculation
	    float falloff = 1.0 - smoothstep(0.0, 0.6, distanceToMouse);
	    falloff = pow(falloff, 2.0); // Smooth quadratic falloff
      
	    // Deform model based on mouse contact position
	    vec3 deformDirection = normalize(worldPosition - uMouseWorld);
	    vec3 newPosition = position + deformDirection * sin(distanceToMouse * 10.0 - uTime * 3.0) *  0.1 * falloff * 0.5;

	    vPosition = newPosition;
	    vDistanceToMouse = distanceToMouse;
      
	    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `;
  const fragmentShader = `
  uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform float uTime;
    uniform float uIntensity;

    varying vec3 vPosition;
    varying float vDistanceToMouse;

    void main() {
	    float wave = sin(vPosition.y * 3.0 + uTime * 2.5) * 0.5 + 0.5;
	    float pulse = pow(abs(sin(uTime * 1.5)), 2.0) * 0.3 + 0.7;
      
	    // Change the color based on vDistanceToMouse
	    float distanceFactor = 1.0 - smoothstep(0.0, 0.5, vDistanceToMouse);
      
	    vec3 color = mix(uColor1, uColor2, wave) * pulse * uIntensity * (1.0 + distanceFactor * 0.3);
	    gl_FragColor = vec4(color, 1.0);
    }
  `;

  const createShaderMaterial = (color1, color2, intensity) => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColor1: { value: new THREE.Color(color1) },
        uColor2: { value: new THREE.Color(color2) },
        uIntensity: { value: intensity },
        uMouseWorld: { value: new THREE.Vector3(0, 0, 0) },
      },
    });
  };

  const shaders = useMemo(() => {
    return {
      c1: createShaderMaterial(colorC1_a, colorC1_b, intensityC1),
      c2: createShaderMaterial(colorC2_a, colorC2_b, intensityC2),
      c3: createShaderMaterial(colorC3_a, colorC3_b, intensityC3),
    };
  }, [
    colorC1_a,
    colorC1_b,
    intensityC1,
    colorC2_a,
    colorC2_b,
    intensityC2,
    colorC3_a,
    colorC3_b,
    intensityC3,
  ]);

  const { scene } = useGLTF("/models/birth2.glb");
  const { camera, gl } = useThree();
  const mouse = useRef(new THREE.Vector3(0, 0, 0));
  const smoothMouse = useRef(new THREE.Vector3(0, 0, 0));
  const rayCaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  useEffect(() => {
    const handleMouseMove = (event) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -1 * (event.clientY / window.innerHeight) * 2 + 1;

      // Cast a ray to find world position
      rayCaster.setFromCamera(pointer, camera);
      const intersect = rayCaster.intersectObject(scene, true);

      if (intersect.length > 0) {
        mouse.current.copy(intersect[0].point);
      }
    };

    gl.domElement.addEventListener("mousemove", handleMouseMove);
    // unsubscribe
    return () => {
      gl.domElement.addEventListener("mousemove", handleMouseMove);
    };
  }, [scene, camera, gl]);

  useFrame((_, delta) => {
    // Smooth interpolation for mouse
    smoothMouse.current.lerp(mouse.current, 0.1);

    Object.values(shaders).forEach((shader) => {
      shader.uniforms.uTime.value += delta;
      shader.uniforms.uMouseWorld.value = smoothMouse.current;
    });
  });

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        let material = null;

        switch (child.name) {
          case "c1":
            material = shaders.c1;
            break;
          case "c2":
            material = shaders.c2;
            break;
          case "c3":
            material = shaders.c3;
            break;
        }

        if (material) {
          child.material = material;
          child.material.needsUpdate = true;
        }
      }
    });
  }, [scene, shaders]);
  return <primitive object={scene} scale={1} position={[0, 0, 0]} />;
};

const Ground = (props) => {
  const {
    resolution,
    scaleX,
    scaleY,
    metalness,
    roughness,
    normalScaleX,
    normalScaleY,
  } = useControls({
    reflector: folder({
      resolution: { value: 512, min: 256, max: 1024, step: 100 },
      scaleX: { value: 9, min: 1, max: 20, step: 0.01 },
      scaleY: { value: 15, min: 1, max: 20, step: 0.01 },
      metalness: { value: 0.4, min: 0, max: 1, step: 0.01 },
      roughness: { value: 5.0, min: 0, max: 20, step: 0.01 },
      normalScaleX: { value: 2, min: 1, max: 5, step: 0.01 },
      normalScaleY: { value: 2, min: 1, max: 5, step: 0.01 },
    }),
  });

  const [floor, normal] = useTexture([
    "/textures/color4.jpg",
    "/textures/normal4.jpg",
  ]);
  return (
    <Reflector resolution={resolution} args={[scaleX, scaleY]} {...props}>
      {(Material, props) => (
        <Material
          color={"#a0a0a0"}
          metalness={metalness}
          roughness={roughness}
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
      vec3.set(-1 * mouse.x * 0.75, -1 * mouse.y * 0.05, 0),
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

const Experience = ({ isLoading }) => {
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
      fogColor: { value: "#3f1752" },
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

  return (
    <>
      {!isLoading ? (
        <>
          <Leva collapsed />
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
            <group position={[0, -0.6, 0]}>
              <Parallax>
                {/* Model */}
                <CurveModel />

                {/* Backdrop */}
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

              {/* Ground */}
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
        </>
      ) : (
        <> </>
      )}
    </>
  );
};

export default Experience;
