import React, { Component } from "react";
import { WidthProvider, Responsive } from "react-grid-layout";
// import logo from "./logo.svg";
import "./App.css";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import CodeInputField from "./Components/CodeInputField/CodeInputField";
import ListViewer from "./Components/ListViewer/ListViewer";
import TreeViewer from "./Components/TreeViewer/TreeViewer";
import TreeViewer2 from "./Components/TreeViewer2/TreeViewer2";

const ResponsiveReactGridLayout = WidthProvider(Responsive);
const originalLayouts = getFromLS("layouts") || {};
// const originalLayouts = {};

class App extends Component {
  constructor(props) {
    super(props);
    this.treeViewDiv = React.createRef();
  }

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
    recommendedCodes: null, //list of recommended codes based on the selected codes

    isLayoutModifiable: false
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
          this.setState(
            {
              searchedCodeList: searchedCodes
            },
            this.appendCodeToCache(results),
            this.searchCodeInCache(code)
          );
        });
    }
  }

  /**
   *  Required for code searchbox Auto-Complete
   * Cache code suggestion results from API call to state for repeated quiries
   * Updates the cachedCodeList and cachedCodeWithDescription in App.state
   * @param {*} results
   * @param {*} oFunc optional function to be called at end of the method
   * @param {*} oArg optinal argument for the optional function
   */
  appendCodeToCache(results, oFunc, oArg) {
    let codes = Array.from(this.state.cachedCodeList);
    let codesWithDescript = Array.from(this.state.cachedCodeWithDescription);

    for (let i = 0, l = results.length; i < l; i++) {
      if (codes.indexOf(results[i].code) < 0) {
        codes.push(results[i].code);
        codesWithDescript.push(results[i]);
      }
    }
    this.setState(
      {
        cachedCodeList: codes,
        cachedCodeWithDescription: codesWithDescript
      },
      oFunc == undefined ? () => {} : oFunc(oArg)
    );
  }

  /**
   * Called upon by CodeInputField when an item is selected.
   * Append code to the App state.
   */
  addSelectedCode = newValue => {
    console.log("2. Adding code to selected: " + newValue);
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
   * item from the listViewers. Removes the code with a
   * matching ID from the list
   */
  handleRemoveSelectedCode = event => {
    const removeCodeIndex = this.state.selectedCodes.findIndex(
      codeObj => codeObj.code === event.target.id
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

      fetch(url)
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

          this.addRecommendedCodesToCachedCodes(results);

          this.setState({
            selectedCodes: listOfCodeObjects,
            recommendedCodes: results
          });
        });
    } else {
      this.setState({ recommendedCodes: null });
    }
  };

  addRecommendedCodesToCachedCodes(arrayOfRecommendedCodes) {
    let searchedCodes = Array.from(this.state.searchedCodeList);

    arrayOfRecommendedCodes.forEach(codeObj => {
      const newCodes = this.findAllPrefixesOfString(codeObj.rhs);

      newCodes.forEach(newCode => {
        if (searchedCodes.indexOf(newCode) < 0) {
          // not in cache, make API call
          console.log("Searched code not found: " + newCode);

          if (newCode !== "") {
            const url =
              "http://localhost:8000/api/children/" + newCode + "/?format=json";

            console.log("get code from API call: " + url);

            searchedCodes.push(newCode);

            fetch(url)
              .then(response => response.json())
              .then(results => {
                this.setState(
                  {
                    searchedCodeList: searchedCodes
                  },
                  () => {
                    if (results.length !== 0) {
                      this.appendCodeToCache(results);
                    }
                  }
                );
              });
          }
        }
      });
    });
  }

  findAllPrefixesOfString(str) {
    let prefixes = [];
    for (let i = 1; i <= str.length; i++) {
      prefixes.push(str.substring(0, i));
    }
    return prefixes;
  }

  /**
   *
   */
  handleAcceptRecommendedCode = event => {
    //TODO: Call API function to increase code accepted number

    const acceptedCodeIndex = this.state.recommendedCodes.findIndex(
      codeObj => codeObj.id == event.currentTarget.id
    );

    const acceptedCodeObject = this.state.recommendedCodes[acceptedCodeIndex];
    const newCode = acceptedCodeObject.rhs;

    this.addSelectedCode(newCode);

    this.removeRecommendedCode(acceptedCodeIndex);
  };

  handleRemoveRecommendedCode = event => {
    //TODO: Call API function to increase code rejected number
    const rejectedCodeIndex = this.state.recommendedCodes.findIndex(
      codeObj => codeObj.id == event.currentTarget.id
    );
    this.removeRecommendedCode(rejectedCodeIndex);
  };

  removeRecommendedCode = codeIndex => {
    const codes = [...this.state.recommendedCodes];
    codes.splice(codeIndex, 1);

    this.setState({
      recommendedCodes: codes
    });
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

  onLayoutChange(layouts) {
    saveToLS("layouts", layouts);
    this.setState({ layouts });
    this.treeViewDiv.current.handleResize();
  }

  handleLayoutModifierButton = () => {
    const layoutModifiable = this.state.isLayoutModifiable;
    this.setState({ isLayoutModifiable: !layoutModifiable });
  };

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
              // onLayoutChange={this.onLayoutChange}
              rowHeight={30}
              layouts={this.state.layouts}
              draggableCancel="input,textarea"
              isDraggable={this.state.isLayoutModifiable} //used to dynamically allow editing
              isResizable={this.state.isLayoutModifiable} //if a button is pressed
              onLayoutChange={(layout, layouts) => this.onLayoutChange(layouts)}
            >
              <div
                className="grid-border"
                key="0"
                data-grid={{
                  x: 0,
                  y: 19,
                  w: 4,
                  h: 14
                }}
              >
                <TreeViewer ref={this.treeViewDiv} id="1337" />
              </div>

              <div key="1" data-grid={{ x: 0, y: 2, w: 4, h: 9 }}>
                <div className="grid-border">
                  <ListViewer
                    className="selectedCodes"
                    title="Selected Codes"
                    items={this.state.selectedCodes}
                    noItemsMessage="No codes selected"
                    keyName="code"
                    valueName="code"
                    descriptionName="description"
                    removeItemButton={this.handleRemoveSelectedCode}
                    removeAllItemsButton={
                      this.state.selectedCodes.length === 0
                        ? null
                        : this.resetSelectedCodes
                    }
                  />
                </div>
              </div>

              <div key="2" data-grid={{ x: 0, y: 11, w: 4, h: 8 }}>
                <div className="grid-border">
                  <ListViewer
                    className="recommendedCodes"
                    title="Recommended Codes"
                    items={this.state.recommendedCodes}
                    noItemsMessage="No recommendations for the selected codes"
                    nullItemsMessage="Select codes to get recommendations"
                    customMessage="loading..."
                    keyName="id"
                    valueName="rhs"
                    descriptionName="description"
                    acceptItemButton={this.handleAcceptRecommendedCode}
                    removeItemButton={this.handleRemoveRecommendedCode}
                    tooltipValueName="reason"
                  />
                </div>
              </div>

              <div
                key="3"
                data-grid={{
                  x: 0,
                  y: 0,
                  w: 4,
                  h: 2,
                  minW: 4,
                  minH: 2
                }}
              >
                <div className="grid-border">{codeSearchBox}</div>
              </div>
            </ResponsiveReactGridLayout>
          </div>

          <p>ICD-10 Code Usage Insight and Suggestion</p>
          <a
            className="App-link"
            href="https://cumming.ucalgary.ca/centres/centre-health-informatics"
            target="_blank"
            rel="noopener noreferrer"
          >
            Centre for Health Informatics
          </a>
          <button onClick={this.handleLayoutModifierButton}>
            {this.state.isLayoutModifiable === true ? "Lock" : "Modify"}
          </button>
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
