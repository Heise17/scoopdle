import React from "react";
import { useState, useEffect } from "react";
import "./GuessedLabel.css";

const GuessedLabel = ({ letters, corrWord }) => {
  const [isMatch, setIsMatch] = useState([]);
  const [isContained, setIsContained] = useState([]);

  // when label is created, determine which letters match and store the states
  useEffect(() => {
    let tMatch = new Array(letters.length);
    let tContained = new Array(letters.length);
    for (let i = 0; i < letters.length; i++) {
      // check for exact match
      if (letters[i].toLowerCase() == corrWord.split("")[i].toLowerCase()) {
        tMatch[i] = true;
      } else {
        tMatch[i] = false;
        // check if word contains letter
        if (corrWord.toLowerCase().split("").includes(letters[i].toLowerCase())) {
            tContained[i] = true;
        } else {
            tContained[i] = false;
        }
      }
    }
    setIsMatch(tMatch);
    setIsContained(tContained);
  }, []);

  // display each letter's color based on its state
  return (
    <div className="guessed-box">
      {letters.map(
        (letter, i) =>
          (isContained[i] && !isMatch[i] && <no-space-orange key={i}>{letter}</no-space-orange>) ||
          (isMatch[i] && !isContained[i] && <no-space-green key={i}>{letter}</no-space-green>) ||
          (!isMatch[i] && !isContained[i] && <no-space-red key={i}>{letter}</no-space-red>)
      )}
    </div>
  );
};

export default GuessedLabel;
