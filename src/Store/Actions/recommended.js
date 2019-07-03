import * as actionTypes from "./actionsTypes";
import * as APIUtility from "../../Util/API";
import { getStringFromListOfCodes } from "./utility";
import { appendToCache } from "./cached";

export const removeRecommendedCode = codeIndex => {
  return {
    type: actionTypes.REMOVE_RECOMMENDED_CODE,
    codeIndex
  };
};

export const setRecommendedCodes = recommendedCodesValue => {
  return {
    type: actionTypes.SET_RECOMMENDED_CODES,
    recommendedCodesValue
  };
};

//Asysnc redux function using redux-thunk
export const fetchRecommendations = (codeObjArray, age, gender) => {
  return dispatch => {
    const stringOfCodes = getStringFromListOfCodes(codeObjArray);

    const ageParam = age === undefined || age === "" || age === null ? "" : "&age=" + age;
    const genderParam = gender === undefined || gender === "" || gender === null ? "" : "&gender=" + gender;

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
          dispatch(setRecommendedCodes(results));
        });
    } else {
      dispatch(setRecommendedCodes(null));
    }
  };
};
