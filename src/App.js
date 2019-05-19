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
    selectedCodes: [{ id: 1, code: "P07", description: "sample" }, //list to keep track of selected codes
    { id: 2, code: "P59", description: "sample 2" },
    { id: 3, code: "P28", description: "sample 3" },
    ],
    recommendedCodes: [], //list of recommended codes based on the selected codes
  };

  constructor(props) {
    super(props);
    //set of all rules. Retrived from the API for now...
    fetch("http://localhost:8000/api/rules/")
      .then(response => response.json())
      .then(result => this.rules = result);
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
      return code.id == event.target.id;
    });

    const codes = [...this.state.selectedCodes]
    codes.splice(removeCodeIndex, 1)
    this.setState({ selectedCodes: codes })

    this.setState({ recommendedCodes: [] })

  }

  /**
   * Updates the recommendedCodes list in the state with the  
   * recommendations from the API. Considers all possible 
   * combinations within the selectedCodes list.
   */
  getRecommendedCodes = () => {
    const arrayOfSelectedCodes = this.state.selectedCodes.map(code => {
      return code.code;
    })

    const allCombinationsOfSelectedCodes = this.getCombinations(arrayOfSelectedCodes)

    let recommendations = []

    if (this.rules !== undefined) {
      allCombinationsOfSelectedCodes.forEach(code => {
        this.rules.forEach(rule => {
          if (rule.lhs === code) {
            recommendations.push(rule.rhs)
          };
        });
      });
    };

    this.setState({ recommendedCodes: [...new Set(recommendations)].sort().filter(x => !arrayOfSelectedCodes.includes(x)) })

  };

  /**
   * Helper method to get all possible combinations of the items within the passed array.
   * @param {*} arrayOfItems The array of items to get the combinations of
   * @returns An array of size 2^n - 1 where n is the length of the passed array (max n limited to 15).
   * Contains all possible combinations of the items in the passed array
   */
  getCombinations(arrayOfItems) {
    //taken from:https://js-algorithms.tutorialhorizon.com/2015/10/23/combinations-of-an-array/

    let i, j, temp
    let result = []
    //only find the combinations of the first 15 codes (32767 max possible combinations). 
    let arrLen = arrayOfItems.length < 15 ? arrayOfItems.length : 15
    let power = Math.pow
    let combinations = power(2, arrLen)

    // Time & Space Complexity O (n * 2^n)

    for (i = 0; i < combinations; i++) {
      temp = ''

      for (j = 0; j < arrLen; j++) {
        // & is bitwise AND
        if ((i & power(2, j))) {
          temp += arrayOfItems[j] + ","
        }
      }
      result.push(temp.slice(0, -1))
    }
    result.shift()
    return result

  };

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
            className="selectedCodes"
            title="Selected Codes"
            items={this.state.selectedCodes}
            keyName="id"
            valueName="code"
            descriptionName="description"
            onItemClick={this.removeSelectedCode}>
          </ListViewer>
          <hr />
          <button
            onClick={this.getRecommendedCodes}>
            Get Reccomendations
          </button>
          <hr />
          <ListViewer
            className="recommendedCodes"
            title="Recommended Codes"
            items={this.state.recommendedCodes}>
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
