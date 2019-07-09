// Contains all async actions dispatched using redux-thunk
import { setSelectedCodes } from "./selected";
import { setRecommendedCodes } from "./recommended";
import { appendToCache } from "./cached";
import { setDaggerAsterisk } from "./daggerAsterisks";
import * as APIUtility from "../../Util/API";
import { getStringFromListOfCodes } from "../../Util/utility";
import { setAge, setGender } from "./ageGender";
import { setRulesInSession, setRolledRules } from "./session";
import { setAlertMessage } from "./alert";

/**
 * Helper function to check recommended codes and rules against the rejected RHS codes in current session.
 * If RHS codes has been rejected prior, remove and do not show again in recommendations.
 * Secondly, using randomly rolling, check rule's recommendation score against a randomly rolled threshold,
 * and only display the rule if the score is above the threshold.
 * Thirdly, if the rhs has been shown after rolling, repeated rules with same RHS would not be rolled again.
 * Finally returns a set of cleaned rules.
 */
const cleanResults = (ruleObjs, rhsExclusions, rollResults) => {
  //TODO: Rules have a gender attribute now, same rule would be shown twice when input has no gender
  const cleanedResults = [];

  for (let i = 0; i < ruleObjs.length; i++) {
    let cursor = ruleObjs[i];

    //////check if the rhs is in the rejected exclusion list
    if (rhsExclusions.includes(cursor.rhs)) {
      continue;
    }

    ////// Check for duplicate RHS
    let duplicateIndex = cleanedResults.findIndex(item => item.rhs === cursor.rhs);
    // console.log(cursor.rhs + ": duplicated RHS index=" + duplicateIndex);
    if (duplicateIndex >= 0) {
      // if duplicate is found
      if (cleanedResults[duplicateIndex].score < ruleObjs[i].score) {
        // keep the duplicate with higher score by overwritting
        cleanedResults[duplicateIndex] = ruleObjs[i];
      }
      continue;
    }

    ////// Check rule score against randomly rolled score threshold
    ////// Check to see if the rule has been previously rolled
    const threshold = Math.random();
    let previousRollIndex = rollResults.findIndex(item => item.id === cursor.id);
    let previousRoll = rollResults[previousRollIndex];
    if (previousRollIndex >= 0 && previousRoll.rollResult != null) {
      // rule has previously been rolled
      continue;
    } else if (previousRollIndex < 0) {
      // rule has not been rolled before

      if (cursor.score < threshold) {
        cursor.rollResult = false;
      } else {
        cursor.rollResult = true;
      }
      rollResults.push(cursor);
    }

    if (cursor.rollResult === true) {
      cleanedResults.push(cursor);
    }
  }

  return [cleanedResults, rollResults];
};

/**
 * Helper method that creates a list of rules with user feedback (action) to be sent back to server.
 * Loops through every rule currently being recommended, append to list of rules to be sent back.
 * Each rule will have "action" attribute set to default "I" (for ignored)
 */
const createRulesToSendBack = (recommendedRules, rulesToSendBack) => {
  for (let i = 0; i < recommendedRules.length; i++) {
    let cursor = recommendedRules[i];
    let duplicatedRule = rulesToSendBack.find(rule => rule.id == cursor.id);
    if (duplicatedRule === undefined) {
      cursor.action = "I"; // default action flag "I" (Ignore)
      cursor.rollResult = null; // flag to keep track of the rule's rolled status
      rulesToSendBack.push(cursor);
    }
  }
  return rulesToSendBack;
};

export const fetchRecommendationsAndUpdateCache = codeObjArray => {
  return (dispatch, getState) => {
    const stringOfCodes = getStringFromListOfCodes(codeObjArray);

    const age = getState().ageGender.selectedAge;
    const gender = getState().ageGender.selectedGender;

    const ageParam = age === undefined || age === "" || age === null ? "" : "&age=" + age;
    const genderParam = gender === undefined || gender === "" || gender === null ? "" : "&gender=" + gender;

    const rhsExclusions = getState().session.rhsExclusions;
    const rulesToSendBack = getState().session.rulesToSendBack;
    const rollResults = getState().session.rulesRolled;

    if (stringOfCodes !== "") {
      const url =
        APIUtility.API.getAPIURL(APIUtility.REQUEST_RULES) + stringOfCodes + "/?format=json" + ageParam + genderParam;

      dispatch(setRecommendedCodes("LOADING"));

      fetch(url)
        .then(response => response.json())
        .then(results => {
          results.forEach(ruleObj => {
            ruleObj.descriptionWithScore = ruleObj.description + " ~ Score: " + (ruleObj.score * 100).toFixed(1);
            ruleObj.rule = ruleObj.lhs + " -> " + ruleObj.rhs;
            //dislike button should be disabled if an admin has reviewed and accepted a rule
            ruleObj.shouldDisableDislikeButton = ruleObj["review_status"] === 2;
          });
          //sort the remaining results in descending order of score
          results.sort((a, b) => (a.score < b.score ? 1 : b.score < a.score ? -1 : 0));
          const resultsToCache = results.map(recommendedObj => {
            return { code: recommendedObj.rhs, description: recommendedObj.description };
          });
          dispatch(appendToCache(resultsToCache));
          results = cleanResults(results, rhsExclusions, rollResults);
          dispatch(setRulesInSession(createRulesToSendBack(results[0], rulesToSendBack)));
          dispatch(setRolledRules(results[1]));
          dispatch(setRecommendedCodes(results[0]));
        });
    } else {
      dispatch(setRecommendedCodes(null));
    }
  };
};

export const fetchDaggerAsterisksAndUpdateCache = codeObjArray => {
  return dispatch => {
    const stringOfCodes = getStringFromListOfCodes(codeObjArray);

    if (stringOfCodes !== "") {
      const url = APIUtility.API.getAPIURL(APIUtility.DAGGER_ASTERISK) + stringOfCodes + "/?format=json";

      dispatch(setDaggerAsterisk("LOADING"));

      fetch(url)
        .then(response => response.json())
        .then(results => {
          let promiseList = [];
          results.forEach(result => {
            result.combo = result.dagger + "\u271D " + result.asterisk + "*";
            let url2 = APIUtility.API.getAPIURL(APIUtility.CODE_DESCRIPTION);
            if (codeObjArray.find(codeObject => codeObject.code === result.dagger) === undefined) {
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
            dispatch(setDaggerAsterisk(results));
          });
        });
    } else {
      dispatch(setDaggerAsterisk(null));
    }
  };
};

export const addSelectedCodeAndUpdateRecommendations = enteredCode => {
  return (dispatch, getState) => {
    const selectedCodes = Array.from(getState().selected.selectedCodes);

    // check if the code already exist in the selection
    const getDuplicate = selectedCodes.find(codeObj => codeObj.code === enteredCode);

    if (getDuplicate === undefined) {
      // get code description from auto-suggest cache
      const codeDescriptions = Array.from(getState().cached.cachedCodeWithDescription);
      const cachedCode = codeDescriptions.find(codeObj => codeObj.code === enteredCode);
      // construct new code object
      const newCode = {
        code: cachedCode.code,
        description: cachedCode.description
      };

      selectedCodes.push(newCode);

      dispatch(setSelectedCodes(selectedCodes));
      dispatch(fetchRecommendationsAndUpdateCache(selectedCodes));
      dispatch(fetchDaggerAsterisksAndUpdateCache(selectedCodes));
    } else {
      console.log("[addSelectedCodeAndUpdate action] Error: trying to add duplicate code =>", enteredCode);
      dispatch(setAlertMessage({ message: enteredCode + " already selected", messageType: "error" }));
    }
  };
};

//used to add a code from the tree
export const addSelectedCodeObjectAndUpdateRecommendations = enteredCodeObject => {
  return (dispatch, getState) => {
    const selectedCodes = Array.from(getState().selected.selectedCodes);

    // check if the code already exist in the selection
    const getDuplicate = selectedCodes.find(codeObj => codeObj.code === enteredCodeObject.code);

    if (getDuplicate === undefined) {
      const newCode = {
        code: enteredCodeObject.code,
        description: enteredCodeObject.description
      };

      selectedCodes.push(newCode);

      dispatch(setSelectedCodes(selectedCodes));
      dispatch(fetchRecommendationsAndUpdateCache(selectedCodes));
      dispatch(fetchDaggerAsterisksAndUpdateCache(selectedCodes));
    } else {
      console.log("[addSelectedCodeAndUpdate action] Error: trying to add duplicate code =>", enteredCodeObject.code);
      dispatch(setAlertMessage({ message: enteredCodeObject.code + " already selected", messageType: "error" }));
    }
  };
};

/**
 * Action used to reset the global store. Reverts all store variables except the cached
 * codes back to their initial states
 */
export const resetState = () => {
  return dispatch => {
    dispatch(setAge(null));
    dispatch(setGender(null));
    dispatch(setSelectedCodes([]));
    dispatch(setDaggerAsterisk(null));
    dispatch(setRecommendedCodes(null));
  };
};
