const primitivesData = {
  circleModel: {
    path: "/models/circles.glb",
    shaders: {
      curve1: {
        defaultColorA: "#308bff",
        defaultColorB: "#4d35c4",
        defaultIntensity: 2
      },
      curve2: {
        defaultColorA: "orange",
        defaultColorB: "red",
        defaultIntensity: 2
      },
      curve3: {
        defaultColorA: "green",
        defaultColorB: "cyan",
        defaultIntensity: 2
      },
    }
  },
  monkeyModel: {
    path: "/models/monkey.glb",
    shaders: {
      curve1: {
        defaultColorA: "red",
        defaultColorB: "orange",
        defaultIntensity: 2
      },
    }
  },
  sphereModel: {
    path: "/models/sphere.glb",
    shaders: {
      curve1: {
        defaultColorA: "blue",
        defaultColorB: "teal",
        defaultIntensity: 2
      },
    }
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
    }
  }
};

export default primitivesData;