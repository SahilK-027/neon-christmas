import React, { useEffect, useState } from "react";
import "./Story.scss";
import { useTrail, animated } from "@react-spring/web";
import stories from "../../utils/storyData.js"

const Story = ({ start }) => {
  const birthStory = stories.birthStory;

  const lineDuration = [2000, 5000, 4000, 6000, 4250, 4750, 6500];
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const words = birthStory[currentLineIndex]?.split(" ") || [];

  // Animate each word
  const trail = useTrail(words.length, {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "translateY(0px)" : "translateY(20px)",
    config: { tension: 170, friction: 26 },
    delay: 200,
  });

  useEffect(() => {
    if (start) {


      if (currentLineIndex >= birthStory.length) {
        setCurrentLineIndex(0);
        return;
      }

      const showTimer = setTimeout(() => {
        setIsVisible(true);
      }, 500);

      const hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, lineDuration[currentLineIndex]);

      const nextlineTimer = setTimeout(() => {
        setCurrentLineIndex((prev) => prev + 1);
      }, lineDuration[currentLineIndex] + 2000);

      // Unsubscribe
      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
        clearTimeout(nextlineTimer);
      };
    }
  }, [currentLineIndex, birthStory.length, start]);

  return (
    <>
      {
        start
          ?
          (
            <div className="story-overlay-text">
              <div className="line-wrapper">
                {trail.map((style, idx) => (
                  <animated.span key={idx} style={style}>
                    {words[idx] + " "}
                  </animated.span>
                ))}
              </div>
            </div>
          )
          :
          <></>
      }
    </>

  );
};

export default Story;
