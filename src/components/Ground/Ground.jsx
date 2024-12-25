import { Reflector, useTexture } from "@react-three/drei";

const Ground = (props) => {
  const [floor, normal] = useTexture([
    "/textures/color.jpg",
    "/textures/normal.jpg",
  ]);
  return (
    <Reflector resolution={512} args={[9, 15]} {...props}>
      {(Material, props) => (
        <Material
          color={"#a0a0a0"}
          metalness={0.4}
          roughness={5.0}
          roughnessMap={floor}
          normalMap={normal}
          normalScale={[2, 2]}
          {...props}
        />
      )}
    </Reflector>
  );
};

export default Ground;
