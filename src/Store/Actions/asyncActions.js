// Contains all async actions dispatched using redux-thunk
import { setSelectedCodes } from "./selected";
import { setRecommendedCodes } from "./recommended";
import { appendToCache } from "./cached";
import { setDaggerAsterisk } from "./daggerAsterisks";
import * as APIUtility from "../../Util/API";
import { getStringFromListOfCodes } from "../../Util/utility";

/**
 * Helper function to check recommended codes and rules against the rejected RHS codes in current session.
 * If RHS codes has been rejected prior, remove and do not show again in recommendations.
 * Secondly, using randomly rolling, check rule's recommendation score against a randomly rolled threshold,
 * and only display the rule if the score is above the threshold.
 * Thirdly, if the rhs has been shown after rolling, repeated rules with same RHS would not be rolled again.
 * Finally returns a set of cleaned rules.
 */
const cleanResults = (ruleObjs, rhsExclusions) => {
  const cleanedResults = [];

  for (let i = 0; i < ruleObjs.length; i++) {
    let cursor = ruleObjs[i];
    let duplicateIndex = cleanedResults.findIndex(item => item.rhs === cursor.rhs);
    if (duplicateIndex < 0) {
      // if duplicate is found
      if (cleanedResults[duplicateIndex].score < ruleObjs[i].score) {
        // keep the duplicate with higher score
        cleanedResults[duplicateIndex] = ruleObjs[i];
      }
      continue;
    }
    //TODO: check if the rhs is in the rejected exclusion list
  }

  //TODO: Remove the following
  ruleObjs.forEach(rule => {
    let duplicate = cleanedResults.find(item => item.rhs === rule.rhs);
    if (duplicate !== undefined) {
    }
    if (!rhsExclusions.includes(rule.rhs)) {
      // Check if rhs of the rule should be excluded
      if (Math.random() < rule.score) {
        // Check for random rolling score
        cleanedResults.push(rule);
      }
    }
  });

  return cleanedResults;
};

export const fetchRecommendationsAndUpdateCache = (codeObjArray, age, gender) => {
  return (dispatch, getState) => {
    const stringOfCodes = getStringFromListOfCodes(codeObjArray);

    const ageParam = age === undefined || age === "" || age === null ? "" : "&age=" + age;
    const genderParam = gender === undefined || gender === "" || gender === null ? "" : "&gender=" + gender;

    const rhsExclusions = getState().session.rhsExclusions;

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
          results = cleanResults(results, rhsExclusions);
          console.log("cleaned results", results);
          dispatch(setRecommendedCodes(results));
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
    }
  };
};
