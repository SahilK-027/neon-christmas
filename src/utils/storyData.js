const stories = [
  {
    storyName: "Birth of Jesus",
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
    storyName: "Baptism",
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
    lineDuration: [500, 3000, 2000, 2500, 3000, 5000, 7000, 5000],
    modelName: "baptismModel",
    voiceOver: "/audio/baptism.mp3",
  },
];

export default stories;
