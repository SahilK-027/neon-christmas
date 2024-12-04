import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

function App() {
  return (
    <Canvas>
      <OrbitControls />
      <mesh>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshNormalMaterial />
      </mesh>
    </Canvas>
  );
}

export default App;
