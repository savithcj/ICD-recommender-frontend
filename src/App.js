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
    this.getAndSetRules();
  }

  changed = (id, newValue) => {
    // Used as action listener for when input box changes
    this.getAndSetRules(newValue);
  };

  handleAddButton = () => {};

  getAndSetRules(codeName) {
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

  render() {
    //react calls the render method asynchronously before the data is retrieved
    //from the API call. The following if statement is needed make sure that the
    //input field is rendered only once the data is retrieved
    let inputField = null;
    if (this.state.rules != null) {
      inputField = (
        <DynamicInputField
          id="input1"
          onChange={this.changed}
          data={this.state.rules}
        />
      );
    }

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          {inputField}
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
