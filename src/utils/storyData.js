const stories = [
  {
    storyName: "The Birth of Jesus Christ",
    storyArray: [
      "",
      "Jesus Christ was born in Bethlehem to Mary and Joseph, fulfilling a prophecy.",
      "Mary, a virgin, conceived through the Holy Spirit.",
      "They traveled to Bethlehem, where there was no room in the inn, so Jesus was born in a stable.",
      "Angels announced His birth to shepherds, who visited Him.",
      "Wise men, guided by a star, brought gifts of gold, frankincense, and myrrh.",
      "His birth marked the beginning of the Christian faith, which was believed to bring salvation to the world.",
    ],
    lineDuration: [500, 4500, 2500, 5000, 3000, 4800, 5500],
    modelName: "birthModel",
    voiceOver: "/audio/birth.mp3",
  },
  {
    storyName: "The Baptism of Jesus",
    storyArray: [
      ``,
      `From the moment Jesus was born in a humble stable in Bethlehem,`,
      `His life was filled with divine purpose.`,
      `As He grew, His heart was set on fulfilling God's will.`,
      `At age 30, He sought John the Baptist at the Jordan River.`,
      `Though sinless, He humbly stepped into the waters, showing His solidarity with humanity.`,
      `As He rose, the heavens parted, and the Holy Spirit descended like a dove, while God's voice echoed, "This is my Son, whom I love."`,
      `It was a moment of divine affirmation, marking the beginning of His ministry."`,
    ],
    lineDuration: [500, 3000, 2000, 2500, 3000, 5000, 7500, 6000],
    modelName: "baptismModel",
    voiceOver: "/audio/baptism.mp3",
  },
  {
    storyName: "The Crucifixion of Jesus",
    storyArray: [
      ``,
      `The crucifixion was the darkest yet most significant moment in Jesus’ life.`,
      `After being betrayed by Judas, arrested, and condemned, Jesus was sentenced to death by crucifixion.`,
      `He carried His cross through the streets of Jerusalem, burdened by the weight of humanity’s sins.`,
      `Nailed to the cross, He endured excruciating pain, yet forgave those who wronged Him.`,
      `As He breathed His last, the sky darkened, and the temple veil tore.`,
      ` His death marked the ultimate sacrifice for mankind’s redemption, fulfilling God's promise of salvation.`,
    ],
    lineDuration: [500, 4800, 6000, 5500, 4500, 3500, 7000],
    modelName: "crucifixionModel",
    voiceOver: "/audio/crucifixion.mp3",
  },
  {
    storyName: "The Ascension of Jesus to Heaven",
    storyArray: [
      ``,
      `After His resurrection, Jesus appeared to His disciples over 40 days, teaching them and strengthening their faith.`,
      `One day, He led them to the Mount of Olives near Jerusalem.`,
      `There, He gave them final instructions, telling them to spread His message to all nations.`,
      `As they watched in awe, Jesus was lifted up into the sky, a cloud taking Him from their sight.`,
      `Two angels appeared, reassuring them that He would return in the same way.`,
      `With that, His earthly presence ended, and He ascended to reign in Heaven.`,
    ],
    lineDuration: [500, 7000, 3500, 5000, 5500, 4500, 4500],
    modelName: "ascensionModel",
    voiceOver: "/audio/ascension.mp3",
  },
];

export default stories;
