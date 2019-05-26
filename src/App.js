import React, { Component } from "react";
import { WidthProvider, Responsive } from "react-grid-layout";
// import logo from "./logo.svg";
import "./App.css";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import CodeInputField from "./Components/CodeInputField/CodeInputField";
import ListViewer from "./Components/ListViewer/ListViewer";

const ResponsiveReactGridLayout = WidthProvider(Responsive);
// const originalLayouts = getFromLS("layouts") || {};
const originalLayouts = {};

class App extends Component {
  state = {
    ////// React Grid Layout
    layouts: JSON.parse(JSON.stringify(originalLayouts)),

    ////// Search Box Auto-Complete Feature
    codeAutoCompleteDisplayed: [], // autocomplete suggestions to be displayed
    searchedCodeList: {}, // list of code searched via API
    cachedCodeList: {}, // caches autocomplete codes in a list (code only, no description) used to keep unique codes
    cachedCodeWithDescription: [], // caches the autocomplete codes in json format with descriptions

    ////// Code Selection Feature
    selectedCodes: [],
    recommendedCodes: null //list of recommended codes based on the selected codes
  };

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
  addSelectedCode = newValue => {
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

      this.getRecommendedCodes(selectedCodes);
      // this.setState({
      //   selectedCodes: selectedCodes,
      //   recommendedCodes: recommendations
      // });
    } else {
      console.log("Duplicate code entered");
    }
  };

  /**
   * Called when an event is fired from a element containing an
   * item from the selectedCode list. Removes the code with a
   * matching ID from the list
   */
  removeSelectedCode = event => {
    const removeCodeIndex = this.state.selectedCodes.findIndex(
      code => code.code === event.target.id
    );

    const codes = [...this.state.selectedCodes];
    codes.splice(removeCodeIndex, 1);

    this.setState({
      selectedCodes: codes
    });

    this.getRecommendedCodes(codes);
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
  getRecommendedCodes = listOfCodeObjects => {
    const stringOfCodes = this.getStringFromListOfCodes(listOfCodeObjects);

    if (stringOfCodes !== "") {
      const url =
        "http://localhost:8000/api/requestRules/" +
        stringOfCodes +
        "/?format=json";

      this.setState({
        selectedCodes: listOfCodeObjects,
        recommendedCodes: 1
      });

      const response = fetch(url)
        .then(response => response.json())
        .then(results => {
          results.forEach(codeObj => {
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

          this.setState({
            selectedCodes: listOfCodeObjects,
            recommendedCodes: results
          });
        });
    } else {
      this.setState({ recommendedCodes: null });
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

  static get defaultProps() {
    return {
      className: "layout",
      cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
      rowHeight: 30
    };
  }

  resetLayout() {
    this.setState({ layouts: {} });
  }

  onLayoutChange(layout, layouts) {
    saveToLS("layouts", layouts);
    this.setState({ layouts });
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
          <div>
            <ResponsiveReactGridLayout
              className="layout"
              onLayoutChange={this.onLayoutChange}
              rowHeight={30}
              layouts={this.state.layouts}
              draggableCancel="input,textarea"
              isDraggable={true}
              isResizable={true}
              onLayoutChange={(layout, layouts) =>
                this.onLayoutChange(layout, layouts)
              }
            >
              <div
                key="1"
                data-grid={{
                  x: 0,
                  y: 0,
                  w: 4,
                  h: 7,
                  minW: 3,
                  maxW: 6,
                  minH: 7
                }}
              >
                {codeSearchBox}
              </div>
              <div key="2" data-grid={{ x: 0, y: 8, w: 2, h: 8 }}>
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
              </div>
              <div key="3" data-grid={{ x: 0, y: 10, w: 6, h: 5 }}>
                <ListViewer
                  className="recommendedCodes"
                  title="Recommended Codes"
                  items={this.state.recommendedCodes}
                  noItemsMessage="No recommendations for the selected codes"
                  nullItemsMessage="Select codes to get recommendations"
                  customMessage="loading..."
                  valueName="rhs"
                  descriptionName="description"
                  tooltipValueName="reason"
                />
              </div>
            </ResponsiveReactGridLayout>
          </div>

          {/* <p>ICD-10 Code Usage Insight and Suggestion</p>
          <a
            className="App-link"
            href="https://cumming.ucalgary.ca/centres/centre-health-informatics"
            target="_blank"
            rel="noopener noreferrer"
          >
            Centre for Health Informatics
          </a> */}
        </header>
      </div>
    );
  }
}

function getFromLS(key) {
  let ls = {};
  if (global.localStorage) {
    try {
      ls = JSON.parse(global.localStorage.getItem("rgl-8")) || {};
    } catch (e) {
      /*Ignore*/
    }
  }
  return ls[key];
}

function saveToLS(key, value) {
  if (global.localStorage) {
    global.localStorage.setItem(
      "rgl-8",
      JSON.stringify({
        [key]: value
      })
    );
  }
}

export default App;
