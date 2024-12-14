const primitivesData = {
  monkeyModel: {
    path: "/models/monkey.glb",
    shaders: {
      curve1: {
        defaultColorA: "red",
        defaultColorB: "orange",
        defaultIntensity: 2
      },
    },
    fogColor: "#4b041f"
  },
  sphereModel: {
    path: "/models/sphere.glb",
    shaders: {
      curve1: {
        defaultColorA: "#a1ce9e",
        defaultColorB: "teal",
        defaultIntensity: 2
      },
    },
    fogColor: "#154814"
  },
  birthModel: {
    path: "/models/birth.glb",
    shaders: {
      curve1: {
        defaultColorA: "#308bff",
        defaultColorB: "#4d35c4",
        defaultIntensity: 2
      },
      curve2: {
        defaultColorA: "#ff0662",
        defaultColorB: "#ffbd41",
        defaultIntensity: 1.5
      },
      curve3: {
        defaultColorA: "#pink",
        defaultColorB: "#f75eff",
        defaultIntensity: 1
      }
    },
    fogColor: "#3f1752"
  }
};

export default primitivesData;