import React from "react";
import { useState, useEffect } from "react";
import "./WordBox.css";
import GuessedLabel from "./GuessedLabel";

const WordBox = ({
  word,
  guessedList,
  setGuessed,
  numSubmits,
  setCompleted,
}) => {
  const [isGuessed, setIsGuessed] = useState(false);
  const [wordsGuessed, setWordsGuessed] = useState([]);
  const [lettersGuessed, setLettersGuessed] = useState([]);
  const [field, setField] = useState("");

  const updateGuessed = (inputWord) => {
    let newArr = [...guessedList];
    newArr[word.id] = inputWord;
    setGuessed(newArr);
    setField(inputWord);
  };

  useEffect(() => {
    if (typeof word.id !== "undefined" && word.autoRevealed) {
      setCompleted(word.id, wordsGuessed.length, true);
      setGuessed(true);
    } else if (guessedList[word.id]) {
      setWordsGuessed([...wordsGuessed, guessedList[word.id]]);
      let tempArr = lettersGuessed;
      tempArr.push(guessedList[word.id].split(""));
      setLettersGuessed(tempArr);
      if (guessedList[word.id].toLowerCase() == word.word.toLowerCase()) {
        setCompleted(word.id, wordsGuessed.length, true);
        setIsGuessed(true);
      }
    } else if (!isGuessed) {
      setCompleted(word.id, 0, false);
    }
    setGuessed([]);
    setField("");
  }, [numSubmits]);

  if (!word) {
    return;
  }
  if (isGuessed || word.autoRevealed) {
    return (
      <div className="center">
        <div className="center-grid">
          <high-label>
            <br></br>
          </high-label>
          <low-label>
            <br></br>
          </low-label>
          <b>{word.word}</b>
        </div>
        {lettersGuessed
          .slice(0, -1)
          .toReversed()
          .map((guessedWord) => (
            <GuessedLabel
              key={guessedWord}
              letters={guessedWord}
              corrWord={word.word}
            />
          ))}
      </div>
    );
  } else {
    return (
      <div key={word.id} className="center">
        <div className="center-grid">
          <high-label>{word.numLetters}</high-label>
          <low-label>{word.pos}</low-label>
          {/* <input-overlay>{blankOverlayText()}</input-overlay> */}
          <input
            id={word.id}
            name={word.id}
            maxLength={word.numLetters}
            size={word.numLetters - 1}
            value={field}
            onChange={(e) => updateGuessed(e.target.value)}
          />
        </div>
        {lettersGuessed.toReversed().map((guessedWord) => (
          <GuessedLabel
            key={guessedWord}
            letters={guessedWord}
            corrWord={word.word}
          />
        ))}
      </div>
    );
  }
};

export default WordBox;
