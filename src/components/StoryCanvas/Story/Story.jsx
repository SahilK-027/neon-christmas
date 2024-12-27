import React, {
  useEffect,
  useState,
  useImperativeHandle,
  useCallback,
  useMemo,
} from "react";
import "./Story.scss";
import { useTrail, animated, useSpring } from "@react-spring/web";
import stories from "../../../utils/storyData.js";
import { forwardRef } from "react";
import Confetti from "react-confetti";

const Story = forwardRef(
  ({ start, currentModel, setCurrentModel, setProgressPercentage }, ref) => {
    // Core state management
    const [storyState, setStoryState] = useState({
      currentStoryIndex: 0,
      currentLineIndex: 0,
      isVisible: true,
      showStoryName: true,
      shouldDisplayStoryName: true,
      showEndScreen: false,
    });

    // Audio state
    const [audioState, setAudioState] = useState({
      currentAudio: "",
      shouldPlayAudio: false,
    });

    // Memoized story data
    const currentStoryData = useMemo(
      () => ({
        story: stories[storyState.currentStoryIndex]?.storyArray || [],
        lineDuration: stories[storyState.currentStoryIndex]?.lineDuration || [],
        storyName:
          stories[storyState.currentStoryIndex]?.storyName || "Untitled",
        voiceOver: stories[storyState.currentStoryIndex]?.voiceOver || "",
        words: (
          stories[storyState.currentStoryIndex]?.storyArray[
            storyState.currentLineIndex
          ] || ""
        ).split(" "),
      }),
      [storyState.currentStoryIndex, storyState.currentLineIndex]
    );

    const STORY_WEIGHT = 25;

    // Memoized animations
    const trail = useTrail(currentStoryData.words.length, {
      opacity: storyState.isVisible ? 1 : 0,
      transform: storyState.isVisible ? "translateY(0px)" : "translateY(20px)",
      config: { tension: 200, friction: 26 },
      delay: 0,
    });

    const storyNameAnimation = useSpring({
      opacity: storyState.showStoryName ? 1 : 0,
      config: { tension: 200, friction: 10, duration: 1000 },
      onRest: () => {
        if (!storyState.showStoryName) {
          setStoryState((prev) => ({ ...prev, shouldDisplayStoryName: false }));
        }
      },
    });

    const storyEndScreen = useSpring({
      opacity: storyState.showEndScreen ? 1 : 0,
      config: { tension: 200, friction: 10, duration: 1000 },
    });

    // Handlers
    const jumpToChapter = useCallback(
      (chapterIndex) => {
        if (chapterIndex >= stories.length) return;

        setAudioState((prev) => ({ ...prev, shouldPlayAudio: false }));

        if (chapterIndex < 4) {
          setStoryState((prev) => ({
            ...prev,
            currentStoryIndex: chapterIndex,
            currentLineIndex: 0,
            isVisible: true,
            showStoryName: true,
            shouldDisplayStoryName: true,
            showEndScreen: false,
          }));

          setProgressPercentage(chapterIndex * STORY_WEIGHT);
          setCurrentModel(stories[chapterIndex]?.modelName || "");

          const voiceOver = stories[chapterIndex]?.voiceOver;
          if (voiceOver) {
            setAudioState({ currentAudio: voiceOver, shouldPlayAudio: false });
            setTimeout(() => {
              setAudioState((prev) => ({ ...prev, shouldPlayAudio: true }));
            }, 5000);
          }
        } else {
          setStoryState((prev) => ({
            ...prev,
            currentStoryIndex: chapterIndex,
            isVisible: false,
            showStoryName: false,
            shouldDisplayStoryName: false,
            showEndScreen: true,
          }));
          setProgressPercentage(100);
          setAudioState({ currentAudio: "", shouldPlayAudio: false });
        }
      },
      [setCurrentModel, setProgressPercentage]
    );

    // Expose methods to parent
    useImperativeHandle(
      ref,
      () => ({
        jumpToChapter,
      }),
      [jumpToChapter]
    );

    // Progress calculation and update
    useEffect(() => {
      if (!start || storyState.shouldDisplayStoryName) return;

      const calculateProgress = () => {
        const storyStartProgress = storyState.currentStoryIndex * STORY_WEIGHT;
        const isLastLine =
          storyState.currentLineIndex === currentStoryData.story.length - 1;

        const lineStartProgress =
          storyStartProgress +
          (storyState.currentLineIndex / currentStoryData.story.length) *
            STORY_WEIGHT;
        const lineEndProgress = isLastLine
          ? (storyState.currentStoryIndex + 1) * STORY_WEIGHT
          : storyStartProgress +
            ((storyState.currentLineIndex + 1) /
              currentStoryData.story.length) *
              STORY_WEIGHT;

        return { lineStartProgress, lineEndProgress };
      };

      const { lineStartProgress, lineEndProgress } = calculateProgress();
      const lineStartTime = Date.now();
      const lineEndTime =
        lineStartTime +
        currentStoryData.lineDuration[storyState.currentLineIndex];
      setProgressPercentage(lineStartProgress);

      const intervalId = setInterval(() => {
        const now = Date.now();
        if (now >= lineEndTime) {
          setProgressPercentage(lineEndProgress);
          clearInterval(intervalId);
        } else {
          const elapsedTime = now - lineStartTime;
          const lineProgress =
            lineStartProgress +
            (elapsedTime /
              currentStoryData.lineDuration[storyState.currentLineIndex]) *
              (lineEndProgress - lineStartProgress);
          setProgressPercentage(Math.min(lineProgress, 100));
        }
      }, 100);

      return () => clearInterval(intervalId);
    }, [
      start,
      storyState.currentLineIndex,
      storyState.currentStoryIndex,
      storyState.shouldDisplayStoryName,
      currentStoryData.lineDuration,
      currentStoryData.story.length,
      setProgressPercentage,
    ]);

    // Story progression logic
    useEffect(() => {
      if (!start) return;

      const timers = [];

      if (storyState.showStoryName) {
        const storyNameTimer = setTimeout(() => {
          setStoryState((prev) => ({ ...prev, showStoryName: false }));
        }, 2000);
        timers.push(storyNameTimer);
        return;
      }

      if (storyState.currentLineIndex >= currentStoryData.story.length) {
        if (storyState.currentStoryIndex + 1 < stories.length) {
          setStoryState((prev) => ({ ...prev, isVisible: false }));

          const nextStoryIndex = storyState.currentStoryIndex + 1;
          setStoryState((prev) => ({
            ...prev,
            currentStoryIndex: nextStoryIndex,
            currentLineIndex: 0,
            showStoryName: true,
            shouldDisplayStoryName: true,
          }));
          const modelTimer = setTimeout(() => {
            setCurrentModel(stories[nextStoryIndex]?.modelName || "");
          }, 1650);
          timers.push(modelTimer);
        } else {
          setStoryState((prev) => ({
            ...prev,
            isVisible: false,
            showStoryName: false,
            shouldDisplayStoryName: false,
            showEndScreen: true,
          }));
          setProgressPercentage(100);
          setAudioState({ currentAudio: "", shouldPlayAudio: false });
        }
        return;
      }

      const showTimer = setTimeout(() => {
        setStoryState((prev) => ({ ...prev, isVisible: true }));
      }, 500);

      const hideTimer = setTimeout(() => {
        setStoryState((prev) => ({ ...prev, isVisible: false }));
      }, currentStoryData.lineDuration[storyState.currentLineIndex]);

      const nextLineTimer = setTimeout(() => {
        setStoryState((prev) => ({
          ...prev,
          currentLineIndex: prev.currentLineIndex + 1,
        }));
      }, currentStoryData.lineDuration[storyState.currentLineIndex] + 1800);

      timers.push(showTimer, hideTimer, nextLineTimer);

      return () => timers.forEach((timer) => clearTimeout(timer));
    }, [
      start,
      storyState.currentLineIndex,
      storyState.currentStoryIndex,
      storyState.showStoryName,
      currentStoryData.lineDuration,
      currentStoryData.story.length,
      setCurrentModel,
      setProgressPercentage,
    ]);

    // Voice-over effect
    useEffect(() => {
      if (!currentStoryData.voiceOver || !start) return;

      setAudioState((prev) => ({
        ...prev,
        currentAudio: currentStoryData.voiceOver,
      }));

      const audioTimer = setTimeout(() => {
        setAudioState((prev) => ({ ...prev, shouldPlayAudio: true }));
      }, 5000);

      return () => {
        clearTimeout(audioTimer);
        setAudioState((prev) => ({ ...prev, shouldPlayAudio: false }));
      };
    }, [currentStoryData.voiceOver, start]);

    const restartStory = useCallback(() => {
      setStoryState({
        currentStoryIndex: 0,
        currentLineIndex: 0,
        isVisible: true,
        showStoryName: true,
        shouldDisplayStoryName: true,
        showEndScreen: false,
      });
      setProgressPercentage(0);
      setCurrentModel(stories[0]?.modelName || "");
    }, [setCurrentModel, setProgressPercentage]);

    if (!start) return null;

    return start ? (
      <div className="story-container">
        {storyState.shouldDisplayStoryName ? (
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
            <h1>{currentStoryData.storyName}</h1>
          </animated.div>
        ) : (
          <div className="story-overlay-text">
            <div className="line-wrapper">
              {trail.map((style, idx) => (
                <animated.span key={idx} style={style}>
                  {currentStoryData.words[idx] + " "}
                </animated.span>
              ))}
            </div>
          </div>
        )}

        {audioState.shouldPlayAudio && (
          <audio
            src={audioState.currentAudio}
            autoPlay
            key={audioState.currentAudio}
          />
        )}

        {storyState.showEndScreen && (
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
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              numberOfPieces={300}
              gravity={0.15}
              recycle={false}
              colors={[
                "#fe7857",
                "#fed757",
                "#c1fe57",
                "#57fe84",
                "#57fcfe",
                "#7157fe",
                "#ff3ee6",
                "#ff0075",
              ]}
            />
            <h1>🎄 Merry Christmas! 🎄</h1>
            <p>
              Thank you for joining this vibrant journey through the story of
              Jesus Christ. May your holiday season be filled with peace, joy,
              and glowing memories! 🌟
            </p>
            <div className="buttons">
              <button onClick={restartStory}>
                <i className="fa-solid fa-repeat" /> Replay story
              </button>
            </div>
          </animated.div>
        )}
      </div>
    ) : (
      <></>
    );
  }
);

export default Story;
