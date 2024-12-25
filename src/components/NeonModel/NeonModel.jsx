import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useControls, folder } from "leva";
import { useMemo, useRef, useEffect } from "react";
import * as THREE from 'three';

const NeonModel = ({ modelPath, curveConfigs }) => {
    // Dynamic controls based on provided curve configurations
    const dynamicControls = useMemo(() => {
        const controls = {};
        Object.entries(curveConfigs).forEach(([key, config]) => {
            const prefix = `${key}_`;
            controls[prefix + 'colorA'] = { value: config.defaultColorA || "#308bff" };
            controls[prefix + 'colorB'] = { value: config.defaultColorB || "#4d35c4" };
            controls[prefix + 'intensity'] = {
                value: config.defaultIntensity || 2,
                min: 0,
                max: 5,
                step: 0.01
            };
        });
        return controls;
    }, [curveConfigs]);

    // Use dynamic controls
    const controlValues = useControls({
        curveSettings: folder(dynamicControls)
    });

    // Vertex Shader
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
            float falloff = 1.0 - smoothstep(0.0, 0.7, distanceToMouse);
            falloff = pow(falloff, 2.0); // Smooth quadratic falloff
          
            // Deform model based on mouse contact position
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
          
            // Change the color based on vDistanceToMouse
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

    // Create shaders dynamically based on control values
    const shaders = useMemo(() => {
        const generatedShaders = {};
        Object.entries(curveConfigs).forEach(([key, config]) => {
            const prefix = `${key}_`;
            generatedShaders[key] = createShaderMaterial(
                controlValues[prefix + 'colorA'],
                controlValues[prefix + 'colorB'],
                controlValues[prefix + 'intensity']
            );
        });
        return generatedShaders;
    }, [controlValues, curveConfigs]);

    const { scene } = useGLTF(modelPath);
    const { camera, gl } = useThree();
    const mouse = useRef(new THREE.Vector3(0, 0, 0));
    const smoothMouse = useRef(new THREE.Vector3(0, 0, 0));
    const rayCaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    // Mouse move event handler
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
        return () => {
            gl.domElement.removeEventListener("mousemove", handleMouseMove);
        };
    }, [scene, camera, gl]);

    // Animate and update shaders
    useFrame((_, delta) => {
        // Smooth interpolation for mouse
        smoothMouse.current.lerp(mouse.current, 0.1);

        Object.values(shaders).forEach((shader) => {
            shader.uniforms.uTime.value += delta;
            shader.uniforms.uMouseWorld.value = smoothMouse.current;
        });
    });

    // Apply materials to meshes
    useEffect(() => {
        scene.traverse((child) => {
            if (child.isMesh) {
                // Find the corresponding shader based on the mesh name
                const matchingShader = Object.entries(shaders).find(
                    ([key, shader]) => {

                        return child.name.toLowerCase().includes(key.toLowerCase())
                    }
                );

                if (matchingShader) {
                    child.material = matchingShader[1];
                    child.material.needsUpdate = true;
                }
            }
        });
    }, [scene, shaders]);

    return <primitive object={scene} scale={1} position={[0, 0, 0]} />;
};

export default NeonModel;