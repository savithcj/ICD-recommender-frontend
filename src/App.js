import React, { Component } from "react";
import { WidthProvider, Responsive } from "react-grid-layout";
import "./App.css";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import CodeInputField from "./Components/CodeInputField/CodeInputField";
import ListViewer from "./Components/ListViewer/ListViewer";
import TreeViewer from "./Components/TreeViewer/TreeViewer";
import MenuBar from "./Components/MenuBar/MenuBar";

import { __esModule } from "d3-random";

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
    cachedCodeWithDescription: [], // caches the autocomplete codes in json format with descriptions

    ////// Code Selection Feature
    selectedCodes: [], // list of selected code with descriptions
    selectedAge: null,
    selectedGender: null,
    recommendedCodes: null //list of recommended codes based on the selected codes
  };

  /**
   *  Required for code searchbox Auto-Complete
   * Cache code suggestion results from API call to state for repeated quiries
   * Updates the cachedCodeList and cachedCodeWithDescription in App.state
   * @param {*} results
   * @param {*} oFunc optional function to be called at end of the method
   * @param {*} oArg optinal argument for the optional function
   */
  appendCodeToCache = results => {
    let codesWithDescript = Array.from(this.state.cachedCodeWithDescription);

    for (let i = 0, l = results.length; i < l; i++) {
      let thisCode = results[i];
      let codeFound = codesWithDescript.find(codeObj => codeObj.code === thisCode.code);
      if (codeFound === undefined) {
        codesWithDescript.push(thisCode);
      }
    }

    this.setState({
      cachedCodeWithDescription: codesWithDescript
    });
  };

  /**
   * Called upon by CodeInputField when an item is selected.
   * Pass selected codes to this.getRecommendedCodes.
   */
  addSelectedCode = newCodeObj => {
    let selectedCodes = Array.from(this.state.selectedCodes);

    // check if the code already exist in the selection
    const getDuplicate = selectedCodes.find(codeObj => codeObj.code === newCodeObj);

    if (getDuplicate === undefined) {
      // get code description from auto-suggest cache
      const codeDescriptions = Array.from(this.state.cachedCodeWithDescription);
      const cachedCode = codeDescriptions.find(codeObj => codeObj.code === newCodeObj);

      // construct new code object
      const newCode = {
        code: cachedCode.code,
        description: cachedCode.description
      };

      selectedCodes.push(newCode);

      this.setState({ selectedCodes });

      this.getRecommendedCodes(selectedCodes);
    } else {
      console.log("Duplicate code entered");
    }
  };

  //the only reason we are not using addSelectedCode here is because we already have descriptions.
  addCodeFromTree = newValue => {
    //newValue is a code object containing code, and description

    let selectedCodes = Array.from(this.state.selectedCodes);

    // check if the code already exist in the selection
    const getDuplicate = selectedCodes.find(codeObj => codeObj.code === newValue.code);

    if (getDuplicate === undefined) {
      // construct new code object
      const newCode = {
        code: newValue.code,
        description: newValue.description
      };

      selectedCodes.push(newCode);

      this.setState({ selectedCodes });

      this.getRecommendedCodes(selectedCodes);
    } else {
      console.log("Duplicate code entered");
    }
  };

  /**
   * Called upon by AgeInputField when a new age is selected
   */
  handleAgeSelection = newAgeValue => {
    this.setState({ selectedAge: newAgeValue });
    this.getRecommendedCodes(this.state.selectedCodes, newAgeValue);
  };

  handleGenderSelection = newGenderValue => {
    this.setState({ selectedGender: newGenderValue });
  };

  /**
   * Called when an event is fired from a element containing an
   * item from the listViewers. Removes the code with a
   * matching ID from the list
   */
  handleRemoveSelectedCode = event => {
    const removeCodeIndex = parseInt(event.currentTarget.id, 10);

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
  getRecommendedCodes(listOfCodeObjects, age) {
    const stringOfCodes = this.getStringFromListOfCodes(listOfCodeObjects);

    const ageParam = age === undefined || age === "" || age === null ? "" : "&age=" + age;

    if (stringOfCodes !== "") {
      const url = "http://localhost:8000/api/requestRules/" + stringOfCodes + "/?format=json" + ageParam;

      //ListViewer will display a loading indicator while the API promise is being fullfilled
      this.setState({
        recommendedCodes: "LOADING"
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

    const acceptedCodeIndex = parseInt(event.currentTarget.id, 10);
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
    const removedCodeIndex = parseInt(event.currentTarget.id, 10);
    this.removeRecommendedCode(removedCodeIndex);
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
   * to a single string with comma separated codes.
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

  /**
   * Called upon to reset layout to default
   */
  resetLayout = () => {
    this.setState({ layouts: defaultLayouts });
  };

  /**
   * Called upon when layout is being modified
   */
  async onLayoutChange(layouts) {
    saveToLS("layouts", layouts);
    await this.setState({ layouts });
    this.treeViewDiv.current.handleResize();
  }

  /**
   * Called upon to customize layout
   */
  handleLayoutModifierButton = () => {
    const layoutModifiable = this.state.isLayoutModifiable;
    this.setState({ isLayoutModifiable: !layoutModifiable });
  };

  /**
   * Called upon to center the tree on the clicked selected code
   */
  handleExploreSelectedCodeButton = event => {
    const selectedCodeIndex = parseInt(event.currentTarget.id, 10);
    this.treeViewDiv.current.changeTree(this.state.selectedCodes[selectedCodeIndex].code);
  };

  /**
   * Called upon to center the tree on the clicked recommended code
   */
  handleExploreRecommendedCodeButton = event => {
    const exploredRecommendedCodeIndex = parseInt(event.currentTarget.id, 10);
    this.treeViewDiv.current.changeTree(this.state.recommendedCodes[exploredRecommendedCodeIndex].rhs);
  };

  /**
   * React calls the render method asynchronously before the data is retrieved
   * from the API call. The following if statement is needed make sure that the
   * input field is rendered only once the data is retrieved
   */
  render() {
    const userInputBoxes = (
      <CodeInputField
        id_code="input1"
        id_age="input2"
        id_gender="input3"
        placeholder_code="Search for a code"
        placeholder_age="Age"
        placeholder_gender="Gender"
        selectCode={this.addSelectedCode}
        selectAge={this.handleAgeSelection}
        selectGender={this.handleGenderSelection}
        codeCache={this.state.cachedCodeWithDescription}
        appendCodeToCache={this.appendCodeToCache}
        autoClearCode={true}
        width_code="60%"
        width_age="20%"
        width_gender="20%"
      />
    );

    const shakeDiv = this.state.isLayoutModifiable ? "shake" : "";
    const highlightEditDiv = this.state.isLayoutModifiable ? "grid-border edit-border" : "grid-border";

    const selectedCodesComponentMenuItems = [
      {
        menuItemOnClick: this.state.selectedCodes.length > 1 ? this.resetSelectedCodes : null,
        menuItemText: "Remove All Items"
      }
    ];
    const recommendedCodesComponentMenuItems = [];

    return (
      <div className="App">
        <MenuBar
          title="ICD-10 Code Suggestion and Usage Insight"
          firstLinkName="Admin"
          firstLinkRoute="/admin"
          handleLayoutConfirm={this.handleLayoutModifierButton}
          handleResetLayout={this.resetLayout}
          inModifyMode={this.state.isLayoutModifiable}
        />
        <div className={shakeDiv}>
          <ResponsiveReactGridLayout
            className="layout"
            rowHeight={30}
            layouts={this.state.layouts}
            draggableCancel="input,textarea"
            isDraggable={this.state.isLayoutModifiable} //used to dynamically allow editing
            isResizable={this.state.isLayoutModifiable} //if a button is pressed
            onLayoutChange={(layout, layouts) => this.onLayoutChange(layouts)}
          >
            <div className={highlightEditDiv} key="0" data-grid={{ x: 0, y: 19, w: 4, h: 14 }}>
              <TreeViewer ref={this.treeViewDiv} id="1337" addCodeFromTree={this.addCodeFromTree} />
            </div>

            <div key="1" className={highlightEditDiv} data-grid={{ x: 0, y: 2, w: 4, h: 9 }}>
              <ListViewer
                title="Selected Codes"
                items={this.state.selectedCodes}
                noItemsMessage="No codes selected"
                valueName="code"
                descriptionName="description"
                removeItemButton={this.handleRemoveSelectedCode}
                exploreButton={this.handleExploreSelectedCodeButton}
                onSortEndCallback={updatedListOfSelectedCodes => {
                  this.setState({ selectedCodes: updatedListOfSelectedCodes });
                }}
                allowRearrage={this.state.selectedCodes.length > 1}
                menuOptions={selectedCodesComponentMenuItems}
              />
            </div>

            <div key="2" className={highlightEditDiv} data-grid={{ x: 0, y: 11, w: 4, h: 8 }}>
              <ListViewer
                className="recommendedCodes"
                title="Recommended Codes"
                items={this.state.recommendedCodes}
                noItemsMessage="No recommendations for the selected codes and age"
                nullItemsMessage="Select codes to get recommendations"
                valueName="rhs"
                descriptionName="description"
                acceptItemButton={this.handleAcceptRecommendedCode}
                removeItemButton={this.handleRemoveRecommendedCode}
                exploreButton={this.handleExploreRecommendedCodeButton}
                allowRearrage={false}
                menuOptions={recommendedCodesComponentMenuItems}
              />
            </div>

            <div key="3" className={highlightEditDiv} data-grid={{ x: 0, y: 0, w: 4, h: 2, minW: 4, minH: 2 }}>
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
