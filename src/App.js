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
  { w: 18, h: 33, x: 0, y: 4, i: "tree" },
  { w: 16, h: 19, x: 18, y: 0, i: "selectedCodes" },
  { w: 14, h: 37, x: 34, y: 0, i: "recommendedCodes" },
  { w: 16, h: 18, x: 18, y: 16, i: "daggerCodes" },
  { w: 18, h: 4, x: 0, y: 0, i: "inputBoxes" }
];
const defaultLayoutMd = [
  { w: 21, h: 21, x: 0, y: 20, i: "tree" },
  { w: 21, h: 16, x: 0, y: 4, i: "selectedCodes" },
  { w: 19, h: 26, x: 21, y: 15, i: "recommendedCodes" },
  { w: 19, h: 15, x: 21, y: 0, i: "daggerCodes" },
  { w: 21, h: 4, x: 0, y: 0, i: "inputBoxes" }
];
const defaultLayoutSm = [
  { w: 24, h: 32, x: 0, y: 32, i: "tree" },
  { w: 14, h: 14, x: 0, y: 4, i: "selectedCodes" },
  { w: 10, h: 32, x: 14, y: 0, i: "recommendedCodes" },
  { w: 14, h: 14, x: 0, y: 18, i: "daggerCodes" },
  { w: 14, h: 4, x: 0, y: 0, i: "inputBoxes" }
];
const defaultLayoutXs = [
  { w: 16, h: 31, x: 0, y: 63, i: "tree" },
  { w: 16, h: 15, x: 0, y: 4, i: "selectedCodes" },
  { w: 16, h: 27, x: 0, y: 36, i: "recommendedCodes" },
  { w: 16, h: 17, x: 0, y: 39, i: "daggerCodes" },
  { w: 16, h: 4, x: 0, y: 0, i: "inputBoxes" }
];
const defaultLayoutXxs = [
  { w: 8, h: 31, x: 0, y: 55, i: "tree" },
  { w: 8, h: 15, x: 0, y: 4, i: "selectedCodes" },
  { w: 8, h: 19, x: 0, y: 36, i: "recommendedCodes" },
  { w: 8, h: 17, x: 0, y: 19, i: "daggerCodes" },
  { w: 2, h: 4, x: 0, y: 0, i: "inputBoxes" }
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
    suggestedDaggerAsterisks: null,

    ////// Session Log
    recommendedCodesDuringSession: [], //array of all codes recommended during a single session. Used to stop showing
    //the same recommendation more than once
    rulesUsedDuringSession: [] //array of rules an user has interacted with during a session
  };

  /**
   * Helper method used to reset the three different arrays tracked during a session
   */
  resetSession() {
    this.setState({ recommendedCodesDuringSession: [], rulesUsedDuringSession: [] });
  }

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

    if (codes.length === 0) {
      this.resetSession();
    }

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
    //resetting the session log without sending the session info to the API
    this.resetSession();
  };

  /**
   * Used to accept all the selected codes. Everytime a user "accepts", the
   * database gets updataded with the code usage
   */
  acceptSelectedCodes = () => {
    const stringOfCodes = this.getStringFromListOfCodes(this.state.selectedCodes);
    // this is where we call the api

    // const url = APIClass.getAPIURL("CODE_USED") + stringOfCodes + "/";

    // fetch(url, { method: "PUT" });

    //TODO: call the new session log API

    this.setState({
      selectedCodes: [],
      recommendedCodes: null
    });
    //resetting the session log after sending the session info to the API
    this.resetSession();
  };

  /**
   * Returns a list of recommendations based on the codes within the passed
   * array of codes.
   * @param {*} listOfCodeObjects List of the code objects to get recommendations from
   */
  getRecommendedCodes(listOfCodeObjects, age) {
    const stringOfCodes = this.getStringFromListOfCodes(listOfCodeObjects);

    //creating a shallow copied instance of the recommendedCodesDuringSession to
    //prevent direct modification of the array in the state
    const recommendedCodesSession = Array.from(this.state.recommendedCodesDuringSession);
    const rulesUsedSession = Array.from(this.state.rulesUsedDuringSession);

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
          results.forEach(ruleObj => {
            ruleObj.description = ruleObj.description + " ~ Score: " + (ruleObj.score * 100).toFixed(1);
            ruleObj.rule = ruleObj.lhs + " -> " + ruleObj.rhs;
            //dislike button should be disabled if an admin has reviewed and accepted a rule
            ruleObj.shouldDisableDislikeButton = ruleObj["review_status"] === 2;
          });

          ////// Cleaning up results received from API call.

          let cleanedResults = [];

          //TODO: check the logic of this for loop
          for (let i = 0; i < results.length; i++) {
            if (rulesUsedSession.find(ruleObjInSessionRules => ruleObjInSessionRules.id === results[i].id)) {
              continue;
            }
            if (rulesUsedSession.find(ruleObjInSessionRules => ruleObjInSessionRules.rhs === results[i].rhs)) {
              continue;
            }
            const shouldShowRule = Math.random() < results[i].score;

            if (shouldShowRule) {
              cleanedResults.push(results[i]);
              const newRuleObj = { id: results[i].id, rhs: results[i].rhs, action: "I" };
              rulesUsedSession.push(newRuleObj);
            }
          }

          cleanedResults = cleanedResults.concat(recommendedCodesSession);

          console.log(cleanedResults);

          this.addRecommendedCodesToCachedCodes(cleanedResults);

          ////// Dealing with duplicate recommendations during a single session

          //this list is used to stop showing any recommendations that have already been
          //"ACCEPTED" or "REJECTED" in any given session
          const listOfIndicesToRemove = [];

          //TODO: recheck logic of this for loop
          cleanedResults.forEach((ruleObj, index) => {
            if (recommendedCodesSession.find(recommendation => recommendation.code === ruleObj.rhs) === undefined) {
              //if the code was not recommended previously, add to the list of recommended codes shown during the session
              //TODO: clean up creation of new recommendation object
              let newRecommendation = { ...ruleObj };
              newRecommendation.code = newRecommendation.rhs;
              newRecommendation.action = "I"; //initialize the action to "IGNORED" by default.
              //this initialization was made because all recommended codes(even duplicates) need to be shown as long as
              //they were not "ACCEPTED" or "REJECTED" previously within the same session.

              recommendedCodesSession.push(newRecommendation);
            } else {
              //if the code was recommended before, remove it from the list of results as long as the action associated
              //with the recomendation is "ACCEPTED" or "REJECTED"; i.e, we still want to show any recommendation that the
              //user had previously "IGNORED" during the same session even though the recommendation was already shown before.
              if (
                recommendedCodesSession.find(recommendationObj => ruleObj.rhs === recommendationObj.code).action !== "I"
              ) {
                //add the RHS of the rule that resulted in a recommendation that was already either "ACCEPTED" or "REJECTED"
                //to the listOfResultsRHSToRemove, so that they can be removed from the results list
                listOfIndicesToRemove.push(index);
              }
            }
          });

          //remove all "duplicate recommendations" from the results list
          cleanedResults = cleanedResults.filter((result, index) => {
            return !listOfIndicesToRemove.includes(index);
          });

          //sort the remaining results in descending order of score
          cleanedResults.sort((a, b) => (a.score < b.score ? 1 : b.score < a.score ? -1 : 0));

          this.setState({
            recommendedCodes: cleanedResults,
            recommendedCodesDuringSession: recommendedCodesSession,
            rulesUsedDuringSession: rulesUsedSession
          });
        });
    } else {
      this.setState({ recommendedCodes: null, recommendedCodesDuringSession: [] });
    }
  }

  /**
   * Calls the DaggerAsterisk API and returns any dagger/asterisk for the selected codes
   * @param {*} listOfCodeObjects List of the code objects to get recommendations from
   */
  getDaggerAsterisks(listOfCodeObjects) {
    const stringOfCodes = this.getStringFromListOfCodes(listOfCodeObjects);
    if (stringOfCodes !== "") {
      const url = APIClass.getAPIURL("DAGGER_ASTERISK") + stringOfCodes + "/?format=json";
      //ListViewer will display a loading indicator while the API promise is being fullfilled
      this.setState({
        suggestedDaggerAsterisks: "LOADING"
      });

      fetch(url)
        .then(response => response.json())
        .then(results => {
          let promiseList = [];
          results.forEach(result => {
            result.combo = result.dagger + "\u271D " + result.asterisk + "*";
            let url2 = APIClass.getAPIURL("CODE_DESCRIPTION");
            if (listOfCodeObjects.find(codeObject => codeObject.code === result.dagger) === undefined) {
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

    const recommendedCodesSession = Array.from(this.state.recommendedCodesDuringSession);
    const rulesUsedSession = Array.from(this.state.rulesUsedDuringSession);

    const acceptedCodeObject = this.state.recommendedCodes[acceptedCodeIndex];

    recommendedCodesSession.find(recommenationObj => recommenationObj.code === acceptedCodeObject.rhs).action = "A";

    rulesUsedSession.find(recommenationObj => recommenationObj.id === acceptedCodeObject.id).action = "A";

    const newCode = acceptedCodeObject.rhs;

    this.setState({ recommendedCodesDuringSession: recommendedCodesSession, rulesUsedDuringSession: rulesUsedSession });

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

    const recommendedCodesSession = Array.from(this.state.recommendedCodesDuringSession);
    const rulesUsedSession = Array.from(this.state.rulesUsedDuringSession);

    const removedCodeObject = this.state.recommendedCodes[removedCodeIndex];

    recommendedCodesSession.find(recommenationObj => recommenationObj.code === removedCodeObject.rhs).action = "R";
    rulesUsedSession.find(recommenationObj => recommenationObj.id === removedCodeObject.id).action = "R";

    this.setState({ recommendedCodesDuringSession: recommendedCodesSession, rulesUsedDuringSession: rulesUsedSession });

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
    saveToLS("layouts", defaultLayouts);
  };

  /**
   * Called upon when layout is being modified
   */
  onLayoutChange(layouts) {
    this.setState({ layouts: layouts });
    this.treeViewDiv.current.handleResize();
    saveToLS("layouts", layouts);
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
        width_code="72%"
        width_age="10%"
        width_gender="15%"
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
        <div>
          <ResponsiveReactGridLayout
            className="layout"
            rowHeight={10}
            cols={{ lg: 48, md: 40, sm: 24, xs: 16, xxs: 8 }}
            layouts={this.state.layouts}
            draggableCancel="input,textarea"
            isDraggable={this.state.isLayoutModifiable} //used to dynamically allow editing
            isResizable={this.state.isLayoutModifiable} //if a button is pressed
            onLayoutChange={(layout, layouts) => this.onLayoutChange(layouts)}
          >
            <div className={highlightEditDiv} key="tree">
              {/* FIXME: fix the display bug in the SwipabalePanel  */}
              {/* <SwipablePanel
                tree={<TreeViewer ref={this.treeViewDiv} id="1337" addCodeFromTree={this.addCodeFromTree} />}
                chord={<ChordDiagram id="123" />}
              /> */}
              <TreeViewer ref={this.treeViewDiv} id="1337" addCodeFromTree={this.addCodeFromTree} />
            </div>

            <div key="selectedCodes" className={highlightEditDiv}>
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

            <div key="recommendedCodes" className={highlightEditDiv}>
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

            <div key="daggerCodes" className={highlightEditDiv}>
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

            <div key="inputBoxes" className={highlightEditDiv}>
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
