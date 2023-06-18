import React, { useState, useEffect, useRef } from "react";
import FlashCardList from "./FlashCardList";
import Loader from "./Loader";
import "./app.css";
import axios from "axios";

function App() {
  const [flashcards, setFlashcards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Added isLoading state

  const categoryEl = useRef();
  const amountEl = useRef();

  useEffect(() => {
    axios.get("https://opentdb.com/api_category.php").then((res) => {
      setCategories(res.data.trivia_categories);
    });
  }, []);

  function decodedString(str) {
    const textArea = document.createElement("textArea");
    textArea.innerHTML = str;
    return textArea.value;
  }

  function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true); // Start loading

    axios
      .get("https://opentdb.com/api.php", {
        params: {
          amount: amountEl.current.value,
          category: categoryEl.current.value,
        },
      })
      .then((res) => {
        setFlashcards(
          res.data.results.map((questionItem, index) => {
            const answer = decodedString(questionItem.correct_answer);
            const options = [
              ...questionItem.incorrect_answers.map((a) => decodedString(a)),
              answer,
            ];
            return {
              id: `${index}-${Date.now()}`,
              question: decodedString(questionItem.question),
              answer: questionItem.correct_answer,
              options: options.sort(() => Math.random() - 0.5),
            };
          })
        );
        setIsLoading(false); // Stop loading
      })
      .catch((error) => {
        console.error("Error fetching flashcards:", error);
        setIsLoading(false); // Stop loading
      });
  }

  return (
    <>
      <form className="header" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select id="category" ref={categoryEl}>
            {categories.map((category) => (
              <option value={category.id} key={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="amount">Number Of Questions</label>
          <input
            type="number"
            id="amount"
            min="1"
            step="1"
            defaultValue={10}
            ref={amountEl}
          />
        </div>
        <div className="form-group">
          <button className="btn">Generate</button>
        </div>
      </form>
      <div className="container">
        {isLoading ? <Loader /> : <FlashCardList flashcards={flashcards} />}
      </div>
    </>
  );
}

export default App;
