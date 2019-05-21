import React, { Component } from "react";
// import logo from "./logo.svg";
import "./App.css";

import CodeInputField from "./Components/CodeInputField/CodeInputField";
import ListViewer from "./Components/ListViewer/ListViewer";

class App extends Component {
  state = {
    ////// Search Box Auto-Complete Feature
    codeAutoCompleteDisplayed: [], // autocomplete suggestions to be displayed
    searchedCodeList: {}, // list of code searched via API
    cachedCodeList: {}, // caches autocomplete codes in a list (code only, no description) used to keep unique codes
    cachedCodeWithDescription: [], // caches the autocomplete codes in json format with descriptions

    ////// Code Selection Feature
    selectedCodes: [],
    recommendedCodes: null //list of recommended codes based on the selected codes
  };

  constructor(props) {
    super(props);
    //set of all rules. Retrived from the API for now...
    //TODO: Change the fetch perform a synchronous API call
    fetch("http://localhost:8000/api/rules/")
      .then(response => response.json())
      .then(result => (this.rules = result));
  }

  /**
   * Required for code searchbox Auto-Complete
   * Action listener called upon by child component when input box changes
   */
  codeSearchBoxChangeListener = (id, newValue) => {
    newValue = newValue
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/gi, "");

    // let autoCompleteResults = [];
    let searchedCodes = Array.from(this.state.searchedCodeList);

    if (searchedCodes.indexOf(newValue) < 0) {
      this.searchCodeViaAPI(newValue);
    } else {
      this.searchCodeInCache(newValue);
    }
  };

  /**
   * Required for code searchbox Auto-Complete
   * Get code suggestions by searching codes stored in the state and return results
   */
  searchCodeInCache(code) {
    if (code !== "") {
      const codeAndDescription = this.state.cachedCodeWithDescription;
      console.log("look up code in cache");
      const regex = new RegExp("^" + code, "i");
      const results = codeAndDescription.filter(item => regex.test(item.code));
      this.setState({ codeAutoCompleteDisplayed: results });
    }
  }

  /**
   * Required for code searchbox Auto-Complete
   * Get code suggestions by making an API call and set results to state
   */
  searchCodeViaAPI(code) {
    if (code !== "") {
      const url =
        "http://localhost:8000/api/children/" + code + "/?format=json";

      console.log("look up code from API call: " + url);
      let searchedCodes = Array.from(this.state.searchedCodeList);
      searchedCodes.push(code);
      fetch(url)
        .then(response => response.json())
        .then(results => {
          this.setState({
            searchedCodeList: searchedCodes
          });
          this.appendCodeToCache(results);
          this.searchCodeInCache(code);
        });
    }
  }

  /**
   * Makes a synchronous API call to get information about the specified code
   * @param {*} code The code to get information about
   * @returns JS object with details about the code
   */
  async getCodeInfoFromAPI(code) {
    if (code !== "") {
      const url = "http://localhost:8000/api/codes/" + code + "/?format=json";

      const response = await fetch(url);
      return await response.json();
    }
  }

  /**
   * Required for code searchbox Auto-Complete
   * Cache code suggestion results from API call to state for repeated quiries
   * Updates the cachedCodeList and cachedCodeWithDescription in App.state
   */
  appendCodeToCache(results) {
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

  /**
   * Called upon by CodeInputField when an item is selected.
   * Append code to the App state.
   */
  addSelectedCode = async newValue => {
    console.log("Code entered: " + newValue);

    let selectedCodes = [...this.state.selectedCodes];

    // check if the code already exist in the selection
    const getDuplicate = selectedCodes.find(
      codeObj => codeObj.code === newValue
    );

    if (getDuplicate === undefined) {
      // get code description from auto-suggest cache
      const codeDescriptions = this.state.cachedCodeWithDescription;
      const cachedCode = codeDescriptions.find(
        codeObj => codeObj.code === newValue
      );
      // construct new code object
      const newCode = {
        code: cachedCode.code,
        description: cachedCode.description
      };
      selectedCodes.push(newCode);

      const recommendations = await this.getRecommendedCodes(selectedCodes);
      this.setState({
        selectedCodes: selectedCodes,
        recommendedCodes: recommendations
      });
    } else {
      console.log("Duplicate code entered");
    }
  };

  /**
   * Called when an event is fired from a element containing an
   * item from the selectedCode list. Removes the code with a
   * matching ID from the list
   */
  removeSelectedCode = async event => {
    const removeCodeIndex = this.state.selectedCodes.findIndex(
      code => code.code === event.target.id
    );

    const codes = [...this.state.selectedCodes];
    codes.splice(removeCodeIndex, 1);

    const recommendations = await this.getRecommendedCodes(codes);

    this.setState({
      selectedCodes: codes,
      recommendedCodes: recommendations
    });
  };

  /**
   * Used to reset the selected code list to an empty list.
   */
  resetSelectedCodes = () => {
    this.setState({
      selectedCodes: [],
      recommendedCodes: null
    });
  };

  /**
   * Returns a list of recommendations based on the codes within the passed
   * array of codes.
   */
  getRecommendedCodes = async listOfCodeObjects => {
    const stringOfCodes = this.getStringFromListOfCodes(listOfCodeObjects);

    if (stringOfCodes !== "") {
      const url =
        "http://localhost:8000/api/requestRules/" +
        stringOfCodes +
        "/?format=json";

      const response = await fetch(url);
      const json = await response.json();

      json.forEach(codeObj => {
        codeObj.reason =
          "Recommended since " +
          codeObj.lhs +
          " selected." +
          " Confidence: " +
          Math.round(codeObj.confidence * 1000) / 1000 +
          " for ages: " +
          codeObj.min_age +
          "-" +
          codeObj.max_age;
      });
      return json;
    }
  };

  /**
   * Helper method to convert the code objects within the passed array
   * to one string with comma separated codes.
   * @param {*} listOfCodeObjects Array of code objects
   * @returns A comma separated string version of the array of codes
   */
  getStringFromListOfCodes(listOfCodeObjects) {
    let stringOfCodes = "";
    listOfCodeObjects.forEach(codeObj => {
      stringOfCodes += codeObj.code + ",";
    });

    //slice method used to remove the last comma
    return stringOfCodes.slice(0, -1);
  }

  /**
   * React calls the render method asynchronously before the data is retrieved
   * from the API call. The following if statement is needed make sure that the
   * input field is rendered only once the data is retrieved
   */
  render() {
    let codeSearchBox = null;
    if (this.state.codeAutoCompleteDisplayed != null) {
      codeSearchBox = (
        <CodeInputField
          id="input1"
          placeholder="Enter code"
          onChange={this.codeSearchBoxChangeListener}
          data={this.state.codeAutoCompleteDisplayed}
          selectCode={this.addSelectedCode}
        />
      );
    }

    return (
      <div className="App">
        <header className="App-header">
          {codeSearchBox}

          <span className="Recommendations">
            <ListViewer
              className="selectedCodes"
              title="Selected Codes"
              items={this.state.selectedCodes}
              noItemsMessage="No codes selected"
              keyName="code"
              valueName="code"
              descriptionName="description"
              removeItemButton={this.removeSelectedCode}
              removeAllItemsButton={
                this.state.selectedCodes.length === 0
                  ? null
                  : this.resetSelectedCodes
              }
            />

            <ListViewer
              className="recommendedCodes"
              title="Recommended Codes"
              items={this.state.recommendedCodes}
              noItemsMessage="No recommendations for the selected codes"
              nullItemsMessage="Select codes to get recommendations"
              valueName="rhs"
              descriptionName="description"
              tooltipValueName="reason"
            />
          </span>

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
