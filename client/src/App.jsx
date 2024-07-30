import { useState, useEffect, useCallback } from "react";
import "./App.css";
import HeaderText from "./HeaderText";
import WordBox from "./WordBox";

function App() {
  const [title, setTitle] = useState("");
  const [titleLink, setTitleLink] = useState("");
  const [words, setWords] = useState([]);
  const [guessedList, setGuessedList] = useState([]);
  const [numSubmits, setNumSubmits] = useState(0);
  const [completed, setCompleted] = useState([]);
  const [image, setImage] = useState("");

  // on load, fetch info from api and initialize guessedLisst array
  useEffect(() => {
    fetchTitle();
    fetchWords();
    fetchImage();
    setGuessedList(new Array(words.length));
  }, []);

  // fetch title from api
  const fetchTitle = async () => {
    const response = await fetch("/api/title");
    // const response = await fetch("http://10.0.0.12:5000/api/title");
    const data = await response.json();
    setTitle(data.title.title);
    setTitleLink(data.title.link);
  };

  // fetch words from api
  const fetchWords = async () => {
    const response = await fetch("/api/words");
    // const response = await fetch("http://10.0.0.12:5000/api/words");
    const data = await response.json();
    setWords(data.words);
  };

  // fetch image from api
  const fetchImage = async () => {
    const response = await fetch("/api/image");
    // const response = await fetch("http://10.0.0.12:5000/api/image");
    const data = await response.json();
    setImage(data.image.imageb64);
  };

  // register submits
  const onSubmit = async (e) => {
    e.preventDefault();
    setNumSubmits(numSubmits + 1);
  };

  // updates the completed array
  const insertCompleted = (wordId, numGuesses, isDone) => {
    let newArr = completed;
    newArr[wordId] = [isDone, numGuesses];
    setCompleted(newArr);
  };

  // checks if the puzzle is fully solved
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

  // render the app if an image was loaded
  if (image != "") {
    return (
      <div className="container">
        <HeaderText />
        <img
          className="center"
          src={"data:image/jpeg;base64," + image}
          alt=""
        />
        {isFullCleared(completed) && (
          <>
            <h3 className="box-overlay-high">
              Congrats! You only messed up {isFullCleared(completed)} times!
            </h3>
            <a className="box-overlay-low" href={titleLink} target="_blank" rel="noopener noreferrer">
              Check out the full story here
            </a>
          </>
        )}
        <form className="center-form" onSubmit={onSubmit} autoComplete="off">
          <div>
            {!isFullCleared(completed) && (
              <input type="submit" value="Submit"></input>
            )}
          </div>
          <div className="break"></div>
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
        </form>
      </div>
    );
  }
}

export default App;
