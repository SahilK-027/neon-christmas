import { Reflector, useTexture } from "@react-three/drei";
import { useControls, folder } from "leva";

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
        "/textures/color.jpg",
        "/textures/normal.jpg",
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

export default Ground