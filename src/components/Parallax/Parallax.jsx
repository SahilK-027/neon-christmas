import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const Parallax = ({ startParallax, children }) => {
  const ref = useRef();
  const vec3 = new THREE.Vector3();
  const { camera, mouse } = useThree();
  const [width, setWidth] = useState(window.innerWidth);
  const [cameraZ, setCameraZ] = useState(3.0);

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }

  useEffect(() => {
    const isMobile = width <= 768;
    if (isMobile) {
      setCameraZ(4.3);
    }

    window.addEventListener("resize", handleWindowSizeChange);
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);

  useFrame(() => {
    if (startParallax) {
      // Camera position should get smoothly set according to mouse position
      camera.position.lerp(vec3.set(mouse.x * 0.05, 0, cameraZ), 0.05);

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
