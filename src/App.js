import React, { Component } from "react";
import { WidthProvider, Responsive } from "react-grid-layout";
import "./App.css";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import CodeInputField from "./Components/CodeInputField/CodeInputField";
import ListViewer from "./Components/ListViewer/ListViewer";
import TreeViewer from "./Components/TreeViewer/TreeViewer";
import TreeViewer2 from "./Components/TreeViewer2/TreeViewer2";
import TreeViewer3 from "./Components/TreeViewer3/TreeViewer3";
import MenuBar from "./Components/MenuBar/MenuBar";

const defaultLayoutLg = [
  { w: 7, h: 16, x: 0, y: 2, i: "0" },
  { w: 5, h: 9, x: 7, y: 0, i: "1" },
  { w: 5, h: 9, x: 7, y: 11, i: "2" },
  { w: 7, h: 2, x: 0, y: 0, i: "3" }
];
const defaultLayoutMd = [
  { w: 6, h: 17, x: 0, y: 2, i: "0" },
  { w: 4, h: 10, x: 6, y: 0, i: "1" },
  { w: 4, h: 9, x: 6, y: 10, i: "2" },
  { w: 6, h: 2, x: 0, y: 0, i: "3" }
];
const defaultLayoutSm = [
  { w: 6, h: 14, x: 0, y: 20, i: "0" },
  { w: 6, h: 9, x: 0, y: 2, i: "1" },
  { w: 6, h: 9, x: 0, y: 11, i: "2" },
  { w: 6, h: 2, x: 0, y: 0, i: "3" }
];
const defaultLayoutXs = [
  { w: 4, h: 14, x: 0, y: 19, i: "0" },
  { w: 4, h: 9, x: 0, y: 2, i: "1" },
  { w: 4, h: 8, x: 0, y: 11, i: "2" },
  { w: 4, h: 2, x: 0, y: 0, i: "3" }
];
const defaultLayoutXxs = [
  { w: 2, h: 12, x: 0, y: 19, i: "0" },
  { w: 2, h: 9, x: 0, y: 2, i: "1" },
  { w: 2, h: 8, x: 0, y: 11, i: "2" },
  { w: 2, h: 2, x: 0, y: 0, i: "3" }
];

const defaultLayouts = {
  lg: defaultLayoutLg,
  md: defaultLayoutMd,
  sm: defaultLayoutSm,
  xs: defaultLayoutXs,
  xxs: defaultLayoutXxs
};

const ResponsiveReactGridLayout = WidthProvider(Responsive);
const originalLayouts = getFromLS("layouts") || defaultLayouts;
// const originalLayouts = defaultLayouts;

const ageOptions = [...Array(120).keys()].map(x => "" + x);

const genderOptions = ["MALE", "FEMALE", "OTHER"];

class App extends Component {
  constructor(props) {
    super(props);
    this.treeViewDiv = React.createRef();
  }

  state = {
    ////// React Grid Layout
    layouts: JSON.parse(JSON.stringify(originalLayouts)),
    isLayoutModifiable: false,

    ////// Search Box Auto-Complete Feature
    codeAutoCompleteDisplayed: [], // autocomplete suggestions to be displayed
    ageAutoCompleteDisplayed: [],
    genderAutoCompleteDisplayed: [],
    searchedCodeList: {}, // list of code searched via API
    cachedCodeWithDescription: [], // caches the autocomplete codes in json format with descriptions

    ////// Code Selection Feature
    selectedCodes: [],
    recommendedCodes: null //list of recommended codes based on the selected codes
  };

  ageInputBoxChangeListener = (id, newValue) => {
    if (newValue !== "") {
      const regex = new RegExp("^" + newValue, "i");
      const results = ageOptions.filter(item => regex.test(item));
      console.log(results);
      this.setState({ ageAutoCompleteDisplayed: results });
    }
  };

  genderInputBoxChangeListener = (id, newValue) => {
    if (newValue !== "") {
      newValue = newValue.trim().toUpperCase();
      console.log(newValue);
      const regex = new RegExp("^" + newValue, "i");
      const results = genderOptions.filter(item => regex.test(item));
      this.setState({ genderAutoCompleteDisplayed: results });
    }
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

    //get list of codes thats been searched for previously
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
      const codeAndDescription = Array.from(this.state.cachedCodeWithDescription);
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
      const url = "http://localhost:8000/api/children/" + code + "/?format=json";

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
    let codesWithDescript = Array.from(this.state.cachedCodeWithDescription);

    for (let i = 0, l = results.length; i < l; i++) {
      let thisCode = results[i];
      let codeFound = codesWithDescript.find(codeObj => codeObj.code === thisCode.code);
      if (codeFound === undefined) {
        codesWithDescript.push(thisCode);
      }
    }

    this.setState(
      {
        cachedCodeWithDescription: codesWithDescript
      },
      oFunc === undefined ? () => {} : oFunc(oArg)
    );
  }

  /**
   * Called upon by CodeInputField when an item is selected.
   * Pass selected codes to this.getRecommendedCodes.
   */
  addSelectedCode = newValue => {
    let selectedCodes = Array.from(this.state.selectedCodes);

    // check if the code already exist in the selection
    const getDuplicate = selectedCodes.find(codeObj => codeObj.code === newValue);

    if (getDuplicate === undefined) {
      // get code description from auto-suggest cache
      const codeDescriptions = Array.from(this.state.cachedCodeWithDescription);
      const cachedCode = codeDescriptions.find(codeObj => codeObj.code === newValue);

      // construct new code object
      const newCode = {
        code: cachedCode.code,
        description: cachedCode.description
      };

      selectedCodes.push(newCode);

      this.setState(prev => {
        prev.selectedCodes.push(newCode);
      });

      this.getRecommendedCodes(selectedCodes);
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
    const removeCodeIndex = this.state.selectedCodes.findIndex(codeObj => codeObj.code === event.currentTarget.id);

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
   * @param {*} listOfCodeObjects List of the code objects to get recommendations from
   */
  getRecommendedCodes(listOfCodeObjects) {
    const stringOfCodes = this.getStringFromListOfCodes(listOfCodeObjects);

    if (stringOfCodes !== "") {
      const url = "http://localhost:8000/api/requestRules/" + stringOfCodes + "/?format=json";

      this.setState({
        recommendedCodes: 1
      });

      fetch(url)
        .then(response => response.json())
        .then(results => {
          results.forEach(codeObj => {
            codeObj.reason =
              codeObj.lhs +
              " -> " +
              codeObj.rhs +
              " || confidence: " +
              Math.round(codeObj.confidence * 1000) / 1000 +
              " for ages: " +
              codeObj.min_age +
              "-" +
              codeObj.max_age;
            codeObj.rule = codeObj.lhs + " -> " + codeObj.rhs;
          });

          this.addRecommendedCodesToCachedCodes(results);

          this.setState({
            recommendedCodes: results
          });
        });
    } else {
      this.setState({ recommendedCodes: null });
    }
  }

  /**
   * Function used to get the descriptions of the codes within an array
   * and add each code to the cachedCodes list maintained in the state
   * @param {*} arrayOfRecommendedCodes an array codes to get the descriptions
   */
  addRecommendedCodesToCachedCodes(arrayOfRecommendedCodes) {
    arrayOfRecommendedCodes.forEach(codeObj => {
      const url = "http://localhost:8000/api/codeDescription/" + codeObj.rhs + "/?format=json";

      fetch(url)
        .then(response => response.json())
        .then(results => {
          this.appendCodeToCache([results]);
        });
    });
  }

  /**
   * Handler method that gets called when a user accepts a recommended code.
   * Removes the specified code from the recommended codes list and adds it
   * to the selectedCodes list. Additionally, calls an API function to increment
   * the accepted number of the code.
   */
  handleAcceptRecommendedCode = event => {
    //TODO: Call API function to increase code accepted number

    const acceptedCodeIndex = this.state.recommendedCodes.findIndex(codeObj => codeObj.id == event.currentTarget.id);

    const acceptedCodeObject = this.state.recommendedCodes[acceptedCodeIndex];
    const newCode = acceptedCodeObject.rhs;

    this.addSelectedCode(newCode);

    this.removeRecommendedCode(acceptedCodeIndex);
  };

  /**
   * Handler method that gets called when a user rejects a recommended code.
   * Removes the specified code from the recommended codes list. Additionally,
   * calls an API function to decrement the accepted number of the code.
   */
  handleRemoveRecommendedCode = event => {
    //TODO: Call API function to increase code rejected number
    const rejectedCodeIndex = this.state.recommendedCodes.findIndex(codeObj => codeObj.id == event.currentTarget.id);

    this.removeRecommendedCode(rejectedCodeIndex);
  };

  /**
   * Helper method used to remove the specified code from the list of
   * recommendedCodes
   * @param {*} codeIndex Index of the code to be removed
   */
  removeRecommendedCode(codeIndex) {
    const codes = [...this.state.recommendedCodes];

    codes.splice(codeIndex, 1);

    this.setState({
      recommendedCodes: codes
    });
  }

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
    let userInputBoxes = null;
    if (this.state.codeAutoCompleteDisplayed != null) {
      userInputBoxes = (
        <CodeInputField
          id_code="input1"
          id_age="input2"
          id_gender="input3"
          placeholder="Enter code"
          onChange={this.codeSearchBoxChangeListener}
          onAgeChange={this.ageInputBoxChangeListener}
          onGenderChange={this.genderInputBoxChangeListener}
          codes={this.state.codeAutoCompleteDisplayed}
          ages={this.state.ageAutoCompleteDisplayed}
          genders={this.state.genderAutoCompleteDisplayed}
          selectCode={this.addSelectedCode}
        />
      );
    }

    return (
      <div className="App">
        <MenuBar
          handleLayoutConfirm={this.handleLayoutModifierButton}
          codeSearchBox={userInputBoxes}
          inModifyMode={this.state.isLayoutModifiable}
        />
        <div>
          <ResponsiveReactGridLayout
            className="layout"
            rowHeight={30}
            layouts={this.state.layouts}
            draggableCancel="input,textarea"
            isDraggable={this.state.isLayoutModifiable} //used to dynamically allow editing
            isResizable={this.state.isLayoutModifiable} //if a button is pressed
            onLayoutChange={(layout, layouts) => this.onLayoutChange(layouts)}
          >
            <div className="grid-border" key="0" data-grid={{ x: 0, y: 19, w: 4, h: 14 }}>
              <TreeViewer3 ref={this.treeViewDiv} id="1337" />
            </div>

            <div key="1" className="grid-border" data-grid={{ x: 0, y: 2, w: 4, h: 9 }}>
              <ListViewer
                className="selectedCodes"
                title="Selected Codes"
                items={this.state.selectedCodes}
                noItemsMessage="No codes selected"
                keyName="code"
                valueName="code"
                descriptionName="description"
                removeItemButton={this.handleRemoveSelectedCode}
                removeAllItemsButton={this.state.selectedCodes.length === 0 ? null : this.resetSelectedCodes}
              />
            </div>

            <div key="2" div className="grid-border" data-grid={{ x: 0, y: 11, w: 4, h: 8 }}>
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

            <div key="3" className="grid-border" data-grid={{ x: 0, y: 0, w: 4, h: 2, minW: 4, minH: 2 }}>
              {userInputBoxes}
            </div>
          </ResponsiveReactGridLayout>
        </div>
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
