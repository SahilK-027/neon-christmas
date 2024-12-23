import React, { useEffect, useState } from "react";
import "./StoryProgressBar.scss";

const StoryProgressBar = ({ progressPercentage }) => {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [previousProgress, setPreviousProgress] = useState(0);

  const chapters = ["Birth", "Baptism", "Crucifixion", "Ascension", "The End"];

  useEffect(() => {
    // Check if progressPercentage is valid
    const validProgress = !isNaN(progressPercentage)
      ? progressPercentage
      : previousProgress;

    // Update previousProgress to the valid progress
    setPreviousProgress(validProgress);

    // Calculate and update currentChapter based on the valid progress
    setTimeout(() => {
      setCurrentChapter(Math.floor(validProgress / 25));
    }, 4000);
  }, [progressPercentage, previousProgress]);

  return (
    <div className="progress-bar">
      <div className="progress-line-container">
        <div
          className="progress-indicator"
          style={{ width: `${previousProgress}%` }}
        ></div>
        <div className="progress-line"></div>
      </div>
      {chapters.map((chapter, index) => (
        <div key={index} className="chapter-container">
          <div
            className={`circle ${index <= currentChapter ? "active" : ""}`}
          ></div>
          <span
            className={`chapter-label ${
              index <= currentChapter ? "active" : ""
            }`}
          >
            {chapter}
          </span>
        </div>
      ))}
    </div>
  );
};

export default StoryProgressBar;
