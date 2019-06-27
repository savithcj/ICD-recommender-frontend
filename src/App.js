import React, { Component } from "react";
import { WidthProvider, Responsive } from "react-grid-layout";
import "./App.css";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import APIClass from "./Assets/Util/API";

import CodeInputField from "./Components/CodeInputField/CodeInputField";
import ListViewer from "./Components/ListViewer/ListViewer";
import TreeViewer from "./Components/TreeViewer/TreeViewer";
import MenuBar from "./Components/MenuBar/MenuBar";
import SwipablePanel from "./Components/SwipablePanel/SwipablePanel";

import { __esModule } from "d3-random";

const defaultLayoutLg = [
  { w: 7, h: 16, x: 0, y: 2, i: "0" },
  { w: 5, h: 9, x: 7, y: 0, i: "1" },
  { w: 5, h: 9, x: 7, y: 11, i: "2" },
  { w: 7, h: 2, x: 0, y: 0, i: "3" },
  { w: 5, h: 9, x: 7, y: 20, i: "4" }
];
const defaultLayoutMd = [
  { w: 6, h: 17, x: 0, y: 2, i: "0" },
  { w: 4, h: 10, x: 6, y: 0, i: "1" },
  { w: 4, h: 9, x: 6, y: 10, i: "2" },
  { w: 6, h: 2, x: 0, y: 0, i: "3" },
  { w: 4, h: 9, x: 6, y: 19, i: "4" }
];
const defaultLayoutSm = [
  { w: 6, h: 14, x: 0, y: 20, i: "0" },
  { w: 6, h: 9, x: 0, y: 2, i: "1" },
  { w: 6, h: 9, x: 0, y: 11, i: "2" },
  { w: 6, h: 2, x: 0, y: 0, i: "3" },
  { w: 6, h: 9, x: 0, y: 34, i: "4" }
];
const defaultLayoutXs = [
  { w: 4, h: 14, x: 0, y: 19, i: "0" },
  { w: 4, h: 9, x: 0, y: 2, i: "1" },
  { w: 4, h: 8, x: 0, y: 11, i: "2" },
  { w: 4, h: 2, x: 0, y: 0, i: "3" },
  { w: 4, h: 8, x: 0, y: 33, i: "4" }
];
const defaultLayoutXxs = [
  { w: 2, h: 12, x: 0, y: 19, i: "0" },
  { w: 2, h: 9, x: 0, y: 2, i: "1" },
  { w: 2, h: 8, x: 0, y: 11, i: "2" },
  { w: 2, h: 2, x: 0, y: 0, i: "3" },
  { w: 2, h: 8, x: 0, y: 31, i: "4" }
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
    recommendedCodes: null, //list of recommended codes based on the selected codes
    suggestedDaggerAsterisks: null
  };

  /**
   *  Required for code searchbox Auto-Complete
   * Cache code suggestion results from API call to state for repeated quiries
   * Updates the cachedCodeList and cachedCodeWithDescription in App.state
   * @param {*} results
   */
  appendCodeToCache = results => {
    let codesWithDescript = Array.from(this.state.cachedCodeWithDescription);

    for (let i = 0; i < results.length; i++) {
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
      this.getDaggerAsterisks(selectedCodes);
    } else {
      console.log("Duplicate code entered");
    }
  };

  /**
   * Called to add selected dagger/asterisk code to selected codes
   */
  addSelectedDaggerAsterisk = newCodeObj => {
    let selectedCodes = Array.from(this.state.selectedCodes);

    selectedCodes.push(newCodeObj);

    this.setState({ selectedCodes }, () => {
      this.getRecommendedCodes(selectedCodes);
      this.getDaggerAsterisks(selectedCodes);
    });
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
      this.getDaggerAsterisks(selectedCodes);
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
    this.getDaggerAsterisks(codes);
  };

  /**
   * Used to reset the selected code list to an empty list.
   */
  resetSelectedCodes = () => {
    this.setState({
      selectedCodes: [],
      recommendedCodes: null,
      suggestedDaggerAsterisks: null
    });
  };

  /**
   * Used to accept all the selected codes. Everytime a user "accepts", the
   * database gets updataded with the code usage
   */
  acceptSelectedCodes = () => {
    const stringOfCodes = this.getStringFromListOfCodes(this.state.selectedCodes);
    const url = APIClass.getAPIURL("CODE_USED") + stringOfCodes + "/";

    fetch(url, { method: "PUT" });

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
      const url = APIClass.getAPIURL("REQUEST_RULES") + stringOfCodes + "/?format=json" + ageParam;

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
            //dislike button should be disabled if an admin has reviewed and accepted a rule
            codeObj.shouldDisableDislikeButton = codeObj["review_status"] === 2;
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
   * Calls the DaggerAsterisk API and returns any dagger/asterisk for the selected codes
   * @param {*} listOfCodeObjects List of the code objects to get recommendations from
   */
  getDaggerAsterisks(listOfCodeObjects) {
    const stringOfCodes = this.getStringFromListOfCodes(listOfCodeObjects);
    if (stringOfCodes !== "") {
      const codes = Array.from(this.state.selectedCodes);
      const url = APIClass.getAPIURL("DAGGER_ASTERISK") + stringOfCodes + "/?format=json";
      //ListViewer will display a loading indicator while the API promise is being fullfilled
      this.setState({
        suggestedDaggerAsterisks: "LOADING"
      });
      let DagAstObjs = [];

      fetch(url)
        .then(response => response.json())
        .then(results => {
          let promiseList = [];
          results.forEach(result => {
            result.combo = result.dagger + "\u271D " + result.asterisk + "*";
            let url2 = APIClass.getAPIURL("CODE_DESCRIPTION");
            if (codes.find(codeObj => codeObj.code === result.dagger) === undefined) {
              url2 += result.dagger + "/?format=json";
            } else {
              url2 += result.asterisk + "/?format=json";
            }
            promiseList.push(
              fetch(url2)
                .then(response => response.json())
                .then(codeObject => {
                  result.description = codeObject.code + ": " + codeObject.description;
                })
            );
          });
          Promise.all(promiseList).then(() => {
            this.setState({ suggestedDaggerAsterisks: results });
          });
        });
      // Promise.all(promiseList).then(promiseList => {
      //   console.log(promiseList);
      //   this.setState({ suggestedDaggerAsterisks: promiseList });
      // });
    } else {
      this.setState({ suggestedDaggerAsterisks: null });
    }
  }

  /**
   * Function used to get the descriptions of the codes within an array
   * and add each code to the cachedCodes list maintained in the state
   * @param {*} arrayOfRecommendedCodes an array codes to get the descriptions
   */
  addRecommendedCodesToCachedCodes(arrayOfRecommendedCodes) {
    arrayOfRecommendedCodes.forEach(codeObj => {
      const url = APIClass.getAPIURL("CODE_DESCRIPTION") + codeObj.rhs + "/?format=json";

      fetch(url)
        .then(response => response.json())
        .then(results => {
          this.appendCodeToCache([results]);
        });
    });
  }

  /**
   * Function used to get the descriptions of the dagger/asterisk
   * and add each code to the cachedCodes list maintained in the state
   * @param {*} dagger/asterisk code to add to cache
   */
  addDaggerAsteriskToCachedCodes(code) {
    const url = APIClass.getAPIURL("CODE_DESCRIPTION") + code + "/?format=json";
    fetch(url)
      .then(response => response.json())
      .then(results => {
        this.appendCodeToCache([results]);
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
   * Handler method that gets called when a user accepts a recommended dagger/asterisk.
   * Removes the specified code from the dagger/asterisk codes list and adds it
   * to the selectedCodes list.
   */
  handleAcceptDaggerAsteriskCode = event => {
    const acceptedCodeIndex = parseInt(event.currentTarget.id, 10);
    const acceptedCodeObject = this.state.suggestedDaggerAsterisks[acceptedCodeIndex];
    const codes = Array.from(this.state.selectedCodes);

    let daggerObject = {};
    daggerObject.code = acceptedCodeObject.dagger;
    let asteriskObject = {};
    asteriskObject.code = acceptedCodeObject.asterisk;
    const urlDagger = APIClass.getAPIURL("CODE_DESCRIPTION") + daggerObject.code + "/?format=json";
    fetch(urlDagger)
      .then(response => response.json())
      .then(result => {
        daggerObject.description = result.description;
        const urlAsterisk = APIClass.getAPIURL("CODE_DESCRIPTION") + asteriskObject.code + "/?format=json";
        fetch(urlAsterisk)
          .then(response => response.json())
          .then(result => {
            asteriskObject.description = result.description;
          })
          .then(() => {
            if (codes.find(codeObj => codeObj.code === daggerObject.code) === undefined) {
              this.addSelectedDaggerAsterisk(daggerObject);
            } else {
              this.addSelectedDaggerAsterisk(asteriskObject);
            }
            this.removeDaggerAsteriskCode(acceptedCodeIndex);
          });
      });
  };

  /**
   * Handler method that gets called when a user rejects a dagger/asterisk code.
   * Removes the specified code from the recommended codes list.
   */
  handleRemoveDaggerAsteriskCode = event => {
    const removedCodeIndex = parseInt(event.currentTarget.id, 10);
    this.removeDaggerAsteriskCode(removedCodeIndex);
  };

  userFlagRuleForReview = event => {
    const recommendedCodeIndex = parseInt(event.currentTarget.id, 10);
    const recommendedCode = this.state.recommendedCodes[recommendedCodeIndex];
    const ruleId = recommendedCode.id;
    console.log("flagging rule id=" + ruleId);

    const url = APIClass.getAPIURL("FLAG_RULE_FOR_REVIEW") + ruleId.toString() + "/?format=json";
    fetch(url, { method: "PUT" })
      .then(response => response.json())
      .then(results => {
        console.log(results);
      });

    this.removeRecommendedCode(recommendedCodeIndex);
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
   * Helper method used to remove the specified code from the list of
   * DaggerAsteriskCodes
   * @param {*} codeIndex Index of the code to be removed
   */
  removeDaggerAsteriskCode(codeIndex) {
    const codes = [...this.state.suggestedDaggerAsterisks];

    codes.splice(codeIndex, 1);

    this.setState({
      suggestedDaggerAsterisks: codes
    });
  }

  /**
   * Helper method to convert the code objects within the passed array
   * to a single string with comma separated codes.
   * @param {*} arrayOfCodeObjects Array of code objects
   * @returns A comma separated string version of the array of codes
   */
  getStringFromListOfCodes(arrayOfCodeObjects) {
    let stringOfCodes = "";
    arrayOfCodeObjects.forEach(codeObj => {
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
    console.log("layouts:", layouts);
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
   * Called upon to center the tree on the clicked dagger/asterisk code
   */
  handleExploreDaggerAsterisk = event => {
    const codeIndex = parseInt(event.currentTarget.id, 10);
    const dagAstObj = this.state.suggestedDaggerAsterisks[codeIndex];
    const codes = Array.from(this.state.selectedCodes);

    const daggerCode = dagAstObj.dagger;
    const asteriskCode = dagAstObj.asterisk;
    if (codes.find(codeObj => codeObj.code === daggerCode) === undefined) {
      this.treeViewDiv.current.changeTree(daggerCode);
    } else {
      this.treeViewDiv.current.changeTree(asteriskCode);
    }
  };

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
        menuItemOnClick: this.state.selectedCodes.length < 2 ? null : this.resetSelectedCodes,
        menuItemText: "Remove All Items"
      }
    ];
    const recommendedCodesComponentMenuItems = [];
    const daggerAsteriskComponentMenuItems = [];

    const acceptSelectedCodesButton = {
      text: "Accept",
      onClick: this.acceptSelectedCodes,
      title: "Accept all selected codes"
    };

    //TODO: possible implementation of rejecting all remaining codes in the recommended codes viewer

    // let rejectRemainingRecommendationsButton = null;

    // if (Array.isArray(this.state.recommendedCodes))
    //   if (this.state.recommendedCodes.length > 0) {
    //     rejectRemainingRecommendationsButton = {
    //       text: "Reject",
    //       onClick: () => {},
    //       title: "Reject remaining recommended codes"
    //     };
    //   }

    return (
      <div className="App">
        <MenuBar
          title="ICD-10 Code Suggestion and Usage Insight"
          firstLinkName="Admin"
          firstLinkRoute="/admin"
          secondLinkName="Visualization"
          secondLinkRoute="/visualization"
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
            <div className={highlightEditDiv} key="0">
              {/* FIXME: fix the display bug in the SwipabalePanel  */}
              {/* <SwipablePanel
                tree={<TreeViewer ref={this.treeViewDiv} id="1337" addCodeFromTree={this.addCodeFromTree} />}
                chord={<ChordDiagram id="123" />}
              /> */}
              <TreeViewer ref={this.treeViewDiv} id="1337" addCodeFromTree={this.addCodeFromTree} />
            </div>

            <div key="1" className={highlightEditDiv}>
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
                button={this.state.selectedCodes.length > 0 ? acceptSelectedCodesButton : null}
              />
            </div>

            <div key="2" className={highlightEditDiv}>
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
                dislikeButton={this.userFlagRuleForReview}
                exploreButton={this.handleExploreRecommendedCodeButton}
                allowRearrage={false}
                menuOptions={recommendedCodesComponentMenuItems}
                disableDislikeButtonField="shouldDisableDislikeButton"
                disableTitleGutters={false}
                // button={rejectRemainingRecommendationsButton}
              />
            </div>

            <div key="3" className={highlightEditDiv}>
              {userInputBoxes}
            </div>

            <div key="4" className={highlightEditDiv}>
              <ListViewer
                title="Dagger/Asterisks"
                items={this.state.suggestedDaggerAsterisks}
                noItemsMessage="No dagger or asterisks suggested"
                nullItemsMessage="Add codes to see dagger/asterisks"
                valueName="combo"
                descriptionName="description"
                acceptItemButton={this.handleAcceptDaggerAsteriskCode}
                removeItemButton={this.handleRemoveDaggerAsteriskCode}
                exploreButton={this.handleExploreDaggerAsterisk}
                allowRearrage={false}
                menuOptions={daggerAsteriskComponentMenuItems}
                //button={this.state.selectedCodes.length > 0 ? acceptSelectedCodesButton : null}
              />
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
