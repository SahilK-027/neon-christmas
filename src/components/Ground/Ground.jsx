import { Reflector, useTexture } from "@react-three/drei";
import { useMemo } from "react";
import { useCallback } from "react";
import * as THREE from "three";
import React from "react";

const Ground = ({ args = [9, 15], resolution = 512, ...props }) => {
  // Memoize texture loading to prevent unnecessary reloads
  const [floor, normal] = useTexture(
    ["/textures/color.jpg", "/textures/normal.jpg"],
    // Callback for texture loading optimization
    (textures) => {
      textures.forEach((texture) => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;
      });
    }
  );

  // Memoize material configuration
  const materialConfig = useMemo(
    () => ({
      color: "#a0a0a0",
      metalness: 0.4,
      roughness: 5.0,
      roughnessMap: floor,
      normalMap: normal,
      normalScale: [2, 2],
    }),
    [floor, normal]
  );

  // Memoize the Material render function to prevent recreations
  const renderMaterial = useCallback(
    (Material, reflectorProps) => (
      <Material {...materialConfig} {...reflectorProps} />
    ),
    [materialConfig]
  );

  // Cleanup function for textures
  const cleanup = useCallback(() => {
    floor?.dispose();
    normal?.dispose();
  }, [floor, normal]);

  // Memoize the entire Reflector configuration
  const reflectorConfig = useMemo(
    () => ({
      resolution,
      args,
      mirror: props.mirror ?? 1,
      mixBlur: props.mixBlur ?? 12,
      mixStrength: props.mixStrength ?? 1.5,
      blur: props.blur ?? [400, 100],
      minDepthThreshold: props.minDepthThreshold ?? 0.9,
      maxDepthThreshold: props.maxDepthThreshold ?? 1.1,
      depthScale: props.depthScale ?? 1,
    }),
    [
      props.mirror,
      props.mixBlur,
      props.mixStrength,
      props.blur,
      props.minDepthThreshold,
      props.maxDepthThreshold,
      props.depthScale,
      resolution,
      args,
    ]
  );

  return (
    <group onDestroy={cleanup}>
      <Reflector {...reflectorConfig} {...props}>
        {renderMaterial}
      </Reflector>
    </group>
  );
};

// Memoize the entire component
export default Ground;

// HOC wrapper for additional memoization if needed
export const MemoizedGround = React.memo(Ground, (prevProps, nextProps) => {
  // Custom comparison function if needed
  return (
    prevProps.position?.[0] === nextProps.position?.[0] &&
    prevProps.position?.[1] === nextProps.position?.[1] &&
    prevProps.position?.[2] === nextProps.position?.[2] &&
    prevProps.rotation?.[0] === nextProps.rotation?.[0] &&
    prevProps.rotation?.[1] === nextProps.rotation?.[1] &&
    prevProps.rotation?.[2] === nextProps.rotation?.[2]
  );
});
