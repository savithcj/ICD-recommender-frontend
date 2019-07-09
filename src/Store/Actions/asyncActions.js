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
import * as HelperFunctions from "../../Util/utility.js";

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

          results = HelperFunctions.cleanResults(results, rhsExclusions, rollResults);
          const cleanedResults = results[0];
          const rolledRules = results[1];

          dispatch(setRolledRules(rolledRules));
          dispatch(setRulesInSession(HelperFunctions.createRulesToSendBack(cleanedResults, rulesToSendBack)));
          dispatch(setRecommendedCodes(cleanedResults));
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
