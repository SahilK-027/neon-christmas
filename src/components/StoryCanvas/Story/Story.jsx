import React, { useEffect, useState } from "react";
import "./Story.scss";
import { useTrail, animated, useSpring } from "@react-spring/web";
import stories from "../../../utils/storyData.js";

const Story = ({ start }) => {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [showStoryName, setShowStoryName] = useState(true);
  const [shouldDisplayStoryName, setShouldDisplayStoryName] = useState(true);

  // Extract current story and line duration
  const currentStory = stories[currentStoryIndex]?.storyArray || [];
  const lineDuration = stories[currentStoryIndex]?.lineDuration || [];
  const storyName = stories[currentStoryIndex]?.storyName || "Untitled";

  const words = currentStory[currentLineIndex]?.split(" ") || [];

  // Trail animation for words
  const trail = useTrail(words.length, {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "translateY(0px)" : "translateY(20px)",
    config: { tension: 200, friction: 26 },
    delay: 0,
  });

  // Smooth animation for story name
  const storyNameAnimation = useSpring({
    opacity: showStoryName ? 1 : 0,
    config: { tension: 20, friction: 10, duration: 2000 },
    onRest: () => {
      if (!showStoryName) {
        setShouldDisplayStoryName(false);
      }
    },
  });

  useEffect(() => {
    if (start) {
      if (showStoryName) {
        setShouldDisplayStoryName(true);
        // Hide story name after 3 seconds
        const storyNameTimer = setTimeout(() => {
          setShowStoryName(false);
        }, 4000);

        return () => clearTimeout(storyNameTimer);
      }

      if (currentLineIndex >= currentStory.length) {
        // Move to the next story if available
        if (currentStoryIndex + 1 < stories.length) {
          setShowStoryName(true);
          setShouldDisplayStoryName(true);
          setCurrentStoryIndex((prev) => prev + 1);
          setCurrentLineIndex(0);
        }
        // TODO: Else replay story
        return;
      }

      // Show and hide the current line
      const showTimer = setTimeout(() => {
        setIsVisible(true);
      }, 500);

      const hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, lineDuration[currentLineIndex]);

      // Move to the next line
      const nextLineTimer = setTimeout(() => {
        setCurrentLineIndex((prev) => prev + 1);
      }, lineDuration[currentLineIndex] + 2000);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
        clearTimeout(nextLineTimer);
      };
    }
  }, [
    start,
    currentLineIndex,
    currentStory,
    lineDuration,
    currentStoryIndex,
    showStoryName,
  ]);

  return (
    <>
      {start ? (
        <div className="story-container">
          {shouldDisplayStoryName ? (
            <animated.div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                ...storyNameAnimation,
              }}
              className="story-name-overlay"
            >
              <h1>{storyName}</h1>
            </animated.div>
          ) : (
            <div className="story-overlay-text">
              <div className="line-wrapper">
                {trail.map((style, idx) => (
                  <animated.span key={idx} style={style}>
                    {words[idx] + " "}
                  </animated.span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </>
  );
};

export default Story;
