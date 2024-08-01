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
  const [image1, setImage1] = useState([]);
  const [image2, setImage2] = useState([]);
  const [image3, setImage3] = useState([]);
  const [clickedImage, setClickedImage] = useState("");

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
    setClickedImage(data.image.image1);
    setImage1([data.image.image1, "active-button"]);
    setImage2([data.image.image2, "inactive-button"]);
    setImage3([data.image.image3, "inactive-button"]);
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

  const numGuesses = (completedArr) => {
    let totalGuesses = 0;
    for (const wordState of completedArr) {
      if (typeof wordState !== "undefined") { //problem here
        totalGuesses += wordState[1];
      }
    }
    return totalGuesses;
  };

  const switchImage = async (e) => {
    let clickedId = e.target.id;
    switch (clickedId) {
      case "1":
        setImage1([image1[0], "active-button"]);
        setImage2([image2[0], "inactive-button"]);
        setImage3([image3[0], "inactive-button"]);
        setClickedImage(image1[0]);
        break;
      case "2":
        setImage1([image1[0], "inactive-button"]);
        setImage2([image2[0], "active-button"]);
        setImage3([image3[0], "inactive-button"]);
        setClickedImage(image2[0]);
        break;
      case "3":
        setImage1([image1[0], "inactive-button"]);
        setImage2([image2[0], "inactive-button"]);
        setImage3([image3[0], "active-button"]);
        setClickedImage(image3[0]);
        break;
    }
  };

  return (
    <div className="container">
      <HeaderText />
      <img
        className="center"
        src={"data:image/jpeg;base64," + clickedImage}
        alt=""
      />
      <div className="center-form">
        <button
          id="1"
          type="button"
          className={image1[1]}
          onClick={switchImage}
        >
          1
        </button>
        <button
          id="2"
          type="button"
          className={image2[1]}
          onClick={switchImage}
        >
          2
        </button>
        {numGuesses(completed) < 3 && !isFullCleared(completed) && (
          <button className="button-overlay">
            Locked until {3 - numGuesses(completed)} more misses
          </button>
        )}
        <button
          id="3"
          type="button"
          className={image3[1]}
          onClick={switchImage}
        >
          3
        </button>
        {numGuesses(completed) < 6 && !isFullCleared(completed) && (
          <button className="button-overlay">
            Locked until {6 - numGuesses(completed)} more misses
          </button>
        )}
      </div>
      {isFullCleared(completed) && (
        <>
          <h3 className="box-overlay-high">
            Congrats! You only messed up {isFullCleared(completed)} times!
          </h3>
          <a
            className="box-overlay-low"
            href={titleLink}
            target="_blank"
            rel="noopener noreferrer"
          >
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

export default App;
