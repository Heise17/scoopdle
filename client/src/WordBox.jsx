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
  const [isInputError, setIsInputError] = useState(false);
  const [isPunct, setIsPunct] = useState(false);

  // modifies guessedList state to include current state for this wordbox
  const updateGuessed = (inputWord) => {
    let newArr = [...guessedList];
    if (inputWord.length > word.word.length){
        newArr[word.id] = inputWord.slice(0, -1);
        setGuessed(newArr);
        setField(inputWord.slice(0, -1));
    } else {
        newArr[word.id] = inputWord;
        setGuessed(newArr);
        setField(inputWord)
    }
  };

  // each time guesses are submitted the guessed/completed states are updated and necessary words revealed
  useEffect(() => {
    if (typeof word.id !== "undefined" && word.autoRevealed) {
      setCompleted(word.id, wordsGuessed.length, true);
      setGuessed(true);
    } else if (guessedList[word.id]) {
      if (guessedList[word.id].length >= word.word.length) {
        setWordsGuessed([...wordsGuessed, guessedList[word.id]]);
        let tempArr = lettersGuessed;
        tempArr.push(guessedList[word.id].split(""));
        setLettersGuessed(tempArr);
        if (guessedList[word.id].toLowerCase() == word.word.toLowerCase()) {
          setCompleted(word.id, wordsGuessed.length, true);
          setIsGuessed(true);
        }
        setField("");
        setIsInputError(false);
      } else {
        setIsInputError(true);
      }
    } else if (!isGuessed){
        setCompleted(word.id, 0, false)
    }
    setGuessed([]);
  }, [numSubmits]);

  // checks to ensure the word has been populated
  if (!word) {
    return;
  } else if (word.pos == "PUNCT" && !isPunct) {
    setIsPunct(true);
  }

  if (isGuessed || word.autoRevealed) {
    // displays box with word revealed
    return (
      <div className="center">
        <div className="center-grid">
          {word.autoRevealed && word.word == "-" && <b className="dash">{word.word}</b>}
          {!word.autoRevealed && word.word == "-" && <g-b className="dash">{word.word}</g-b>}          
          {word.autoRevealed && isPunct && word.word != "-" && <b className="punct">{word.word}</b>}
          {!word.autoRevealed && isPunct && word.word != "-" && <g-b className="punct">{word.word}</g-b>}          
          {word.autoRevealed && !isPunct && <b>{word.word}</b>}
          {!word.autoRevealed && !isPunct && <g-b>{word.word}</g-b>}
        </div>
        <div className="break"></div>
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
    let blankStr = "-";
    // displays box with word unrevealed
    return (
      <div key={word.id} className="center">
        <div className="center-grid">
          <high-label>{word.numLetters}</high-label>
          <low-label>{word.pos}</low-label>
          <input-overlay>{blankStr.repeat(word.numLetters)}</input-overlay>
          {!isInputError && <input
            className="no-outline"
            id={word.id}
            name={word.id}
            maxLength={word.numLetters}
            size={word.numLetters - 1}
            value={field}
            onChange={(e) => updateGuessed(e.target.value)}
          />}
          {isInputError && <input
            className="red-outline"
            id={word.id}
            name={word.id}
            maxLength={word.numLetters}
            size={word.numLetters - 1}
            value={field}
            onChange={(e) => updateGuessed(e.target.value)}
          />}
        </div>
        <div className="break"></div>
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
