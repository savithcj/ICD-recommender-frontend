import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";

import CodeInputField from "./Components/CodeInputField/CodeInputField";
import ListViewer from "./Components/ListViewer/ListViewer";

class App extends Component {
  state = {
    codeWithDescription: [], // autocomplete suggestions to be displayed
    cachedCodeList: {}, // caches codes in a list (code only, no description)
    cachedCodeWithDescription: [], // caches the code in json format with description
    selectedCodes: [{id: 1, code: "A1", description: "sample"}, //list to keep track of selected codes
                    {id: 2, code: "B1", description: "sample 2"}], 
  };

  codeSearchBoxListener = (id, newValue) => {
    /** Action listener called upon by child component when input box changes */

    newValue = newValue
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/gi, "");

    this.getCodeSuggestionsFromAPI(newValue);
  };

  // handleAddButton = () => {};

  getCodeSuggestionsFromAPI(code) {
    /** Get code suggestions by making an API call */
    if (code !== "") {
      const url =
        "http://localhost:8000/api/children/" + code + "/?format=json";

      console.log(url);

      fetch(url)
        .then(response => response.json())
        .then(results => {
          this.setState({ codeWithDescription: results });
          this.appendCodeToCache(results);
        });
    }
  }

  appendCodeToCache(results) {
    /** Cache code suggestion results from API call to state for repeated quiries */

    let codes = Array.from(this.state.cachedCodeList);
    let codesWithDescript = Array.from(this.state.cachedCodeWithDescription);

    for (let i = 0, l = results.length; i < l; i++) {
      if (codes.indexOf(results[i].code) < 0) {
        codes.push(results[i].code);
        codesWithDescript.push(results[i]);
      }
    }
    this.setState({
      cachedCodeList: codes,
      cachedCodeWithDescription: codesWithDescript
    });
  }

  getCodeSuggestionsFromState(code) {
    /** Get code suggestions by searching codes stored in the state */
  }

  addSelectedCode = () => {
    //TODO: complete this method and call it from the CodeInputField to add the 
    //specified code to the selectedCodes list
  }

  /**
   * Called when an event is fired from a element containing an
   * item from the selectedCode list. Removes the code with a 
   * matching ID from the list
   */
  removeSelectedCode = (event) => {
    const removeCodeIndex = this.state.selectedCodes.findIndex(code => {
      return code.id === event.target.key;
    });

    const codes = [...this.state.selectedCodes]
    codes.splice(removeCodeIndex, 1)
    this.setState({selectedCodes: codes})

  }

  render() {
    /** React calls the render method asynchronously before the data is retrieved
     * from the API call. The following if statement is needed make sure that the
     * input field is rendered only once the data is retrieved */
    let codeSearchBox = null;
    if (this.state.codeWithDescription != null) {
      codeSearchBox = (
        <CodeInputField
          id="input1"
          onChange={this.codeSearchBoxListener}
          data={this.state.codeWithDescription}
        />
      );
    }

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          {codeSearchBox}
          {/* <button onClick={() => this.handleAddButton()}>Submit</button> */}
          <ListViewer
            className = "selectedCodes"
            title = "Selected Codes"
            items = {this.state.selectedCodes}
            onItemClick = {this.removeSelectedCode}>
          </ListViewer>
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
