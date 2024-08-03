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
  const [isHelp, setIsHelp] = useState(false);

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
      if (typeof wordState !== "undefined") {
        //problem here
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

  const setHelp = () => {
    setIsHelp(true);
  };

  const setHelpOff = () => {
    setIsHelp(false);
  };

  return (
    <div className="container">
      <div className="round-box">
        <div className="center">
          <div className="flex-h">
            <span className="invis-icon"></span>
            <h1>Scoopdle</h1>
            <button className="material-symbols-outlined" onFocus={setHelp}>
              help
            </button>
          </div>
          <h3> Pat Gay </h3>
          <h3>
            Get the scoop by filling in the blanks for a recent news headline
            based on AI-generated images
          </h3>
        </div>
      </div>
      {isHelp && (
        <div className="round-thin">
          <div className="top-right">
            <button className="material-symbols-outlined" onClick={setHelpOff}>close</button>
          </div>
          <p>
            Each day at 8:00pm EST, a new headline from recent news is selected.
            Your goal is to fill in the blanks based on the images and
            information provided.
          </p>
          <br></br>
          <p>
            As you fill in words, you can submit them at any time. You will only
            be penalized if you type a full word that does not match the
            headline word. More images will unlock if you guess words
            incorrectly.
          </p>
          <br></br>
          <p>
            <span className="green-text">GREEN </span> letters match the
            headline word exactly
          </p>
          <br></br>
          <p>
            <span className="yellow-text">YELLOW </span> letters are found in
            the headline word, but in a different position
          </p>
          <br></br>
          <p>
            <span className="red-text">RED </span> letters are not found in the
            headline word
          </p>
        </div>
      )}
      <img
        className="center"
        src={"data:image/jpeg;base64," + clickedImage}
        alt=""
      />
      <div className="flex-h">
        <button
          id="1"
          type="button"
          className={image1[1]}
          onClick={switchImage}
        >
          1
        </button>
        {(numGuesses(completed) >= 2 || isFullCleared(completed)) && (
          <button
            id="2"
            type="button"
            className={image2[1]}
            onClick={switchImage}
          >
            2
          </button>
        )}
        {numGuesses(completed) < 2 && !isFullCleared(completed) && (
          <button id="2l" type="button" className="button-overlay">
            Locked - {2 - numGuesses(completed)} more misses
          </button>
        )}
        {(numGuesses(completed) >= 4 || isFullCleared(completed)) && (
          <button
            id="3"
            type="button"
            className={image3[1]}
            onClick={switchImage}
          >
            3
          </button>
        )}
        {numGuesses(completed) < 4 && !isFullCleared(completed) && (
          <button id="3l" type="button" className="button-overlay">
            Locked - {4 - numGuesses(completed)} more misses
          </button>
        )}
      </div>
      {isFullCleared(completed) && (
        <div className="round-thin">
          <h3>
            Congrats! You only messed up {isFullCleared(completed)} times!
          </h3>
          <a href={titleLink} target="_blank" rel="noopener noreferrer">
            Check out the full story here
          </a>
        </div>
      )}
      <form className="center-form" onSubmit={onSubmit} autoComplete="off">
        <div>
          {!isFullCleared(completed) && (
            <input
              className="center-button"
              type="submit"
              value="Submit"
            ></input>
          )}
        </div>
        <div className="break"></div>
        <div className="round-box">
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
        </div>
      </form>
      <div className="bottom-tag">
        <span>Created by Brandon Heise</span>
        <br></br>
        <span>Images generated with </span>
        <a
          className="bottom-link"
          href="https://openai.com/index/dall-e-3/"
          target="_blank"
          rel="noopener noreferrer"
        >
          DALL·E 3 by OpenAI
        </a>
        <br></br>
        <span>Contact me at </span>
        <a
          className="bottom-link"
          href="mailto:brandoncodesnow@gmail.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          BrandonCodesNow@gmail.com
        </a>
      </div>
    </div>
  );
}

export default App;
