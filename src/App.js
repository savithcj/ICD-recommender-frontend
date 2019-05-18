import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";

import DynamicInputField from "./Components/DynamicInputField/DynamicInputField";

class App extends Component {
  state = {
    rules: null
  };

  constructor() {
    super();
    this.getCodeSuggestionsFromAPI();
  }

  codeSearchBoxListener = (id, newValue) => {
    /** Action listener called upon by child component when input box changes */

    newValue = newValue
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/gi, "");

    this.getCodeSuggestionsFromAPI(newValue);
  };

  // handleAddButton = () => {};

  getCodeSuggestionsFromAPI(codeName) {
    /** Get code suggestions by making an API call */
    if (codeName !== "") {
      const url =
        "http://localhost:8000/api/children/" + codeName + "/?format=json";

      console.log(url);

      fetch(url)
        .then(response => response.json())
        .then(result => {
          this.setState({ rules: result });
        });
    }
  }

  appendCodeSuggestionsToState() {
    /** Append/update code suggestion results from API call to state for repeated quiries */
  }

  getCodeSuggestionsFromState(codeName) {
    /** Get code suggestions by searching codes stored in the state */
  }

  render() {
    /** React calls the render method asynchronously before the data is retrieved
     * from the API call. The following if statement is needed make sure that the
     * input field is rendered only once the data is retrieved */
    let codeSearchBox = null;
    if (this.state.rules != null) {
      codeSearchBox = (
        <DynamicInputField
          id="input1"
          onChange={this.codeSearchBoxListener}
          data={this.state.rules}
        />
      );
    }

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          {codeSearchBox}
          {/* <button onClick={() => this.handleAddButton()}>Submit</button> */}
          <p>ICD-10 Code Usage Insight and Suggestion</p>
          <a
            className="App-link"
            href="https://cumming.ucalgary.ca/centres/centre-health-informatics"
            target="_blank"
            rel="noopener noreferrer"
          >
            Centre for Health Informatics
          </a>
        </header>
      </div>
    );
  }
}

export default App;
