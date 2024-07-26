import React from "react";
import { useState, useEffect } from "react";
import "./GuessedLabel.css";

const GuessedLabel = ({ letters, corrWord }) => {
  const [isMatch, setIsMatch] = useState([]);

  useEffect(() => {
    let tArr = new Array(letters.length);
    for (let i = 0; i < letters.length; i++) {
      if (letters[i] == corrWord.split("")[i]) {
        tArr[i] = true;
      } else {
        tArr[i] = false;
      }
    }
    setIsMatch(tArr);
  }, []);

  return (
    <div>
      {letters.map(
        (letter, i) =>
          (isMatch[i] && <no-space-green key={i}>{letter}</no-space-green>) ||
          (!isMatch[i] && <no-space-red key={i}>{letter}</no-space-red>)
      )}
    </div>
  );
};

export default GuessedLabel;
