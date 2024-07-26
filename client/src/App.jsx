import { useState, useEffect, useCallback } from "react";
import "./App.css";
import HeaderText from "./HeaderText";
import WordBox from "./WordBox";

function App() {
  const [title, setTitle] = useState("default");
  const [words, setWords] = useState([]);
  const [guessedList, setGuessedList] = useState([]);
  const [numSubmits, setNumSubmits] = useState(0);
  const [completed, setCompleted] = useState([]);
  const [image, setImage] = useState("");

  useEffect(() => {
    fetchTitle();
    fetchWords();
    fetchImage();
    initStates();
  }, []);

  const initStates = () => {
    setGuessedList(new Array(words.length));
  };

  const fetchTitle = async () => {
    const response = await fetch("/api/title");
    const data = await response.json();
    setTitle(data.title.title);
  };

  const fetchWords = async () => {
    const response = await fetch("/api/words");
    const data = await response.json();
    setWords(data.words);
  };

  const fetchImage = async () => {
    const response = await fetch("/api/image");
    const data = await response.json();
    setImage(data.image);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setNumSubmits(numSubmits + 1);
  };

  const insertCompleted = (wordId, numGuesses, isDone) => {
    let newArr = completed;
    newArr[wordId] = [isDone, numGuesses];
    setCompleted(newArr);
  };

  const isFullCleared = (completedArr) => {
    let totalGuesses = 0;
    for (const wordState of completedArr) {
      if (!wordState[0]) {
        return false;
      }
      totalGuesses += wordState[1];
    }
    if (totalGuesses == 0) {
      return "0";
    }
    return totalGuesses;
  };

  if (image != "") {
    //   if (true) {
    return (
      <div className="container">
        <HeaderText />
        <img className="center" src={"data:image/jpeg;base64," + image} alt="" />
        {isFullCleared(completed) && (
          <h3>
            {" "}
            Congrats! You only messed up {isFullCleared(completed)} times!
          </h3>
        )}
        <form className="center-form" onSubmit={onSubmit} autoComplete="off">
          {words.map((word) => (
            <WordBox
              key={word.id}
              word={word}
              guessedList={guessedList}
              setGuessed={setGuessedList}
              numSubmits={numSubmits}
              setCompleted={insertCompleted}
            />
          ))}
          <div className="center">
            <div className="center-grid">
              {!isFullCleared(completed) && (
                <input type="submit" value="Submit"></input>
              )}
            </div>
          </div>
        </form>
      </div>
    );
  }
}

export default App;
