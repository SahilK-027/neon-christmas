import React from "react";
import "./Loader.scss";
import logo from "../../assets/logo.webp";

const Loader = ({ progress = 0 }) => {
  return (
    <div className="loader">
      <div className="progress-container">
        <div
          className="progress-circle"
          style={{
            "--progress": `${progress}%`,
          }}
        >
          <img className="logo" src={logo} alt="logo" />
        </div>
      </div>
      <p className="text">
        © 2024 | Please wait we are loading your web experience.
      </p>
    </div>
  );
};

export default Loader;
