import React, { useState } from "react";
import "./StoryProgressBar.scss";

const StoryProgressBar = () => {
  const chapters = ["Birth", "Baptism", "Crucifixion", "Ascension", "The End"];
  const [currentChapter, setCurrentChapter] = useState(0);

  const progressPercentage = 27;

  return (
    <div className="progress-bar">
      <div className="progress-line-container">
        <div
          className="progress-indicator"
          style={{ width: `${progressPercentage}%` }}
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
