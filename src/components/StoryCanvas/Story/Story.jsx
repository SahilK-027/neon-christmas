import React, {
  useEffect,
  useState,
  useMemo,
  useImperativeHandle,
} from "react";
import "./Story.scss";
import { useTrail, animated, useSpring } from "@react-spring/web";
import stories from "../../../utils/storyData.js";
import { forwardRef } from "react";

const Story = forwardRef(
  ({ start, currentModel, setCurrentModel, setProgressPercentage }, ref) => {
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [currentLineIndex, setCurrentLineIndex] = useState(0);
    let audioTimer;

    useImperativeHandle(ref, () => ({
      jumpToChapter: (chapterIndex) => {
        // Stop any currently playing audio
        setShouldPlayAudio(false);
        clearTimeout(audioTimer);

        if (chapterIndex < 4) {
          setCurrentStoryIndex(chapterIndex);
          setCurrentLineIndex(0);
          setProgressPercentage(chapterIndex * STORY_WEIGHT);
          setCurrentModel(stories[chapterIndex]?.modelName || "");
          setIsVisible(true);
          setShowStoryName(true);
          setShouldDisplayStoryName(true);

          const voiceOver = stories[chapterIndex]?.voiceOver || "";
          if (voiceOver) {
            setCurrentAudio(voiceOver);
            audioTimer = setTimeout(() => {
              setShouldPlayAudio(true);
            }, 8000);
          } else {
            setShouldPlayAudio(false);
          }
          setShowEndScreen(false);
        } else {
          setCurrentStoryIndex(chapterIndex);
          setProgressPercentage(100);
          setIsVisible(false);
          setShouldPlayAudio(false);
          setShowStoryName(false);
          setShouldDisplayStoryName(false);
          setShowEndScreen(true);
        }
      },
    }));

    const [isVisible, setIsVisible] = useState(true);
    const [showStoryName, setShowStoryName] = useState(true);
    const [shouldDisplayStoryName, setShouldDisplayStoryName] = useState(true);
    const [currentAudio, setCurrentAudio] = useState("");
    const [shouldPlayAudio, setShouldPlayAudio] = useState(false);
    const [displayedStoryName, setDisplayedStoryName] = useState(
      stories[0]?.storyName || "Untitled"
    );
    const [showEndScreen, setShowEndScreen] = useState(false);

    const currentStory = stories[currentStoryIndex]?.storyArray || [];
    const lineDuration = stories[currentStoryIndex]?.lineDuration || [];
    const storyName = stories[currentStoryIndex]?.storyName || "Untitled";
    const voiceOver = stories[currentStoryIndex]?.voiceOver || "";

    useEffect(() => {
      setDisplayedStoryName(
        stories[currentStoryIndex]?.storyName || "Untitled"
      );
    }, [currentStoryIndex]);

    const words = currentStory[currentLineIndex]?.split(" ") || [];

    const STORY_WEIGHT = 25; // Each story contributes exactly 25% to total progress

    // Trail animation for words
    const trail = useTrail(words.length, {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? "translateY(0px)" : "translateY(20px)",
      config: { tension: 200, friction: 26 },
      delay: 0,
    });

    const storyNameAnimation = useSpring({
      opacity: showStoryName ? 1 : 0,
      config: { tension: 20, friction: 10, duration: 2000 },
      onRest: () => {
        if (!showStoryName) {
          setShouldDisplayStoryName(false);
        }
      },
    });

    const storyEndScreen = useSpring({
      opacity: showEndScreen ? 1 : 0,
      config: { tension: 20, friction: 10, duration: 2000 },
      onRest: () => {
        if (!storyEndScreen) {
          setShowEndScreen(false);
        }
      },
    });

    useEffect(() => {
      let intervalId;
      if (start && !shouldDisplayStoryName) {
        // Calculate base progress from completed stories
        const storyStartProgress = currentStoryIndex * STORY_WEIGHT;

        // For the last line of the story, ensure we hit exactly the story boundary
        const isLastLine = currentLineIndex === currentStory.length - 1;

        // Calculate progress within current story (0 to STORY_WEIGHT)
        let lineStartProgress, lineEndProgress;

        if (isLastLine) {
          // For the last line, end exactly at the story boundary
          lineStartProgress =
            storyStartProgress +
            (currentLineIndex / currentStory.length) * STORY_WEIGHT;
          lineEndProgress = (currentStoryIndex + 1) * STORY_WEIGHT;
        } else {
          lineStartProgress =
            storyStartProgress +
            (currentLineIndex / currentStory.length) * STORY_WEIGHT;
          lineEndProgress =
            storyStartProgress +
            ((currentLineIndex + 1) / currentStory.length) * STORY_WEIGHT;
        }

        const lineStartTime = Date.now();
        const lineEndTime = lineStartTime + lineDuration[currentLineIndex];
        setProgressPercentage(lineStartProgress);

        intervalId = setInterval(() => {
          const now = Date.now();
          if (now >= lineEndTime) {
            setProgressPercentage(lineEndProgress);
            clearInterval(intervalId);
          } else {
            const elapsedTime = now - lineStartTime;
            const lineProgress =
              lineStartProgress +
              (elapsedTime / lineDuration[currentLineIndex]) *
                (lineEndProgress - lineStartProgress);
            setProgressPercentage(Math.min(lineProgress, 100));
          }
        }, 100);
      }
      return () => clearInterval(intervalId);
    }, [
      currentLineIndex,
      currentStoryIndex,
      lineDuration,
      start,
      setProgressPercentage,
      shouldDisplayStoryName,
      currentStory.length,
    ]);

    useEffect(() => {
      if (voiceOver && start) {
        setCurrentAudio(voiceOver);

        audioTimer = setTimeout(() => {
          setShouldPlayAudio(true);
        }, 8000);

        return () => {
          clearTimeout(audioTimer);
          setShouldPlayAudio(false);
        };
      }
    }, [voiceOver, start]);

    useEffect(() => {
      if (start) {
        if (showStoryName) {
          setShouldDisplayStoryName(true);

          const storyNameTimer = setTimeout(() => {
            setShowStoryName(false);
          }, 4000);

          return () => clearTimeout(storyNameTimer);
        }

        if (currentLineIndex >= currentStory.length) {
          if (currentStoryIndex + 1 < stories.length) {
            setIsVisible(false);

            setTimeout(() => {
              setShowStoryName(true);
              setShouldDisplayStoryName(true);
              const nextStoryIndex = currentStoryIndex + 1;
              setCurrentStoryIndex(nextStoryIndex);
              setTimeout(() => {
                setCurrentModel(stories[nextStoryIndex]?.modelName || "");
              }, 2000);
              setCurrentLineIndex(0);
            }, 2000);
          } else {
            clearTimeout(audioTimer);
            setProgressPercentage(100);
            setIsVisible(false);
            setShouldPlayAudio(false);
            setShowStoryName(false);
            setShouldDisplayStoryName(false);
            setShowEndScreen(true);
          }
          return;
        }

        const showTimer = setTimeout(() => {
          setIsVisible(true);
        }, 500);

        const hideTimer = setTimeout(() => {
          setIsVisible(false);
        }, lineDuration[currentLineIndex]);

        const nextLineTimer = setTimeout(() => {
          setCurrentLineIndex((prev) => prev + 1);
        }, lineDuration[currentLineIndex] + 1800);

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
      currentModel,
      showEndScreen,
    ]);

    const restartStory = () => {
      setCurrentStoryIndex(0);
      setCurrentLineIndex(0);
      setShowStoryName(true);
      setShouldDisplayStoryName(true);
      setShowEndScreen(false);
      setIsVisible(true);
      setProgressPercentage(0);
      setCurrentModel(stories[0]?.modelName || "");
    };

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
                <h1>{displayedStoryName}</h1>
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
            {shouldPlayAudio && (
              <audio src={currentAudio} autoPlay key={currentAudio} />
            )}

            {showEndScreen ? (
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
                  ...storyEndScreen,
                }}
                className="story-name-overlay end-screen"
              >
                <h1>🎄 Merry Christmas! 🎄</h1>
                <p>
                  {" "}
                  Thank you for joining this vibrant journey through the story
                  of Jesus Christ. May your holiday season be filled with peace,
                  joy, and glowing memories! 🌟
                </p>
                <div className="buttons">
                  <button onClick={restartStory}>Restart story</button>
                  <button className="transparent-btn">Watch Devlog</button>
                </div>
              </animated.div>
            ) : (
              <></>
            )}
          </div>
        ) : null}
      </>
    );
  }
);

export default Story;
