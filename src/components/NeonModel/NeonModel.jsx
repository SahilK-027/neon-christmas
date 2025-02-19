import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useEffect, useState } from "react";
import * as THREE from "three";

const NeonModel = ({ modelPath, curveConfigs }) => {
  // State to track model to ensure only one model is loaded at a time
  const [model, setModel] = useState(null);

  // Create static shader configurations based on curve configs
  const shaderConfigs = useMemo(() => {
    const configs = {};
    Object.entries(curveConfigs).forEach(([key, config]) => {
      configs[key] = {
        colorA: config.defaultColorA || "#308bff",
        colorB: config.defaultColorB || "#4d35c4",
        intensity: config.defaultIntensity || 2,
      };
    });
    return configs;
  }, [curveConfigs]);

  // Vertex Shader
  const vertexShader = `
        uniform vec3 uMouseWorld;
        uniform float uTime;
        
        varying vec3 vPosition;
        varying float vDistanceToMouse;
    
        void main() {
            vec3 worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
            float distanceToMouse = distance(worldPosition, uMouseWorld);
          
            float falloff = 1.0 - smoothstep(0.0, 0.7, distanceToMouse);
            falloff = pow(falloff, 2.0);
          
            vec3 deformDirection = normalize(worldPosition - uMouseWorld);
            vec3 newPosition = position + deformDirection * sin(distanceToMouse * 10.0 - uTime * 3.0) *  0.1 * falloff * 0.5;
    
            vPosition = newPosition;
            vDistanceToMouse = distanceToMouse;
          
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
    `;

  // Fragment Shader
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
          
            float distanceFactor = 1.0 - smoothstep(0.0, 0.5, vDistanceToMouse);
          
            vec3 color = mix(uColor1, uColor2, wave) * pulse * uIntensity * (1.0 + distanceFactor * 0.3);
            gl_FragColor = vec4(color, 1.0);
        }
    `;

  // Create shader material dynamically
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

  // Create shaders using static configurations
  const shaders = useMemo(() => {
    const generatedShaders = {};
    Object.entries(shaderConfigs).forEach(([key, config]) => {
      generatedShaders[key] = createShaderMaterial(
        config.colorA,
        config.colorB,
        config.intensity
      );
    });
    return generatedShaders;
  }, [shaderConfigs]);

  // Load the model
  const { scene } = useGLTF(modelPath, true);
  const { camera, gl } = useThree();
  const mouse = useRef(new THREE.Vector3(0, 0, 0));
  const smoothMouse = useRef(new THREE.Vector3(0, 0, 0));
  const rayCaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  // Dispose old model when model changes
  useEffect(() => {
    if (model) {
      // Dispose old model resources before loading a new one
      model.traverse((child) => {
        if (child.isMesh) {
          child.geometry.dispose();
          if (child.material.isMaterial) {
            child.material.dispose();
          } else {
            // If it's a multi-material mesh
            child.material.forEach((material) => material.dispose());
          }
        }
      });
    }

    setModel(scene); // Update model to new scene

    return () => {
      // Ensure the old model is cleaned up when the component unmounts
      if (model) {
        model.traverse((child) => {
          if (child.isMesh) {
            child.geometry.dispose();
            if (child.material.isMaterial) {
              child.material.dispose();
            } else {
              child.material.forEach((material) => material.dispose());
            }
          }
        });
      }
    };
  }, [modelPath]);

  // Mouse move effect
  useEffect(() => {
    const handleMouseMove = (event) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -1 * (event.clientY / window.innerHeight) * 2 + 1;

      rayCaster.setFromCamera(pointer, camera);
      const intersect = rayCaster.intersectObject(scene, true);

      if (intersect.length > 0) {
        mouse.current.copy(intersect[0].point);
      }
    };

    gl.domElement.addEventListener("mousemove", handleMouseMove);
    return () => {
      gl.domElement.removeEventListener("mousemove", handleMouseMove);
    };
  }, [scene, camera, gl]);

  useFrame((_, delta) => {
    smoothMouse.current.lerp(mouse.current, 0.1);

    Object.values(shaders).forEach((shader) => {
      shader.uniforms.uTime.value += delta;
      shader.uniforms.uMouseWorld.value = smoothMouse.current;
    });
  });

  // Assign shaders to meshes
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          const matchingShader = Object.entries(shaders).find(([key]) =>
            child.name.toLowerCase().includes(key.toLowerCase())
          );

          if (matchingShader) {
            child.material = matchingShader[1];
            child.material.needsUpdate = true;
          }
        }
      });
    }
  }, [scene, shaders]);

  return <primitive object={scene} scale={1} position={[0, 0, 0]} />;
};

export default NeonModel;
