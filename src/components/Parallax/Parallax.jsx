import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from 'three';

const Parallax = ({ isLoading, children }) => {
    const ref = useRef();
    const vec3 = new THREE.Vector3();
    const { camera, mouse } = useThree();

    useFrame(() => {
        if (!isLoading) {
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
        }
    });

    return <group ref={ref}>{children}</group>;
};

export default Parallax;