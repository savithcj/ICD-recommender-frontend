import * as actionTypes from "./actionsTypes";
import * as APIUtility from "../../Util/API";

export const removeRecommendedCode = removedCodeIndex => {
  return {
    type: actionTypes.REMOVE_RECOMMENDED_CODE,
    codeIndex: removedCodeIndex
  };
};

export const setRecommendedCodes = value => {
  return {
    type: actionTypes.SET_RECOMMENDED_CODES,
    recommendedCodesValue: value
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
            ruleObj.description = ruleObj.description + " ~ Score: " + (ruleObj.score * 100).toFixed(1);
            ruleObj.rule = ruleObj.lhs + " -> " + ruleObj.rhs;
            //dislike button should be disabled if an admin has reviewed and accepted a rule
            ruleObj.shouldDisableDislikeButton = ruleObj["review_status"] === 2;
          });
          dispatch(setRecommendedCodes(results));
        });
    } else {
      dispatch(setRecommendedCodes(null));
    }
  };
};

/**
 * Helper method to convert the code objects within the passed array
 * to a single string with comma separated codes.
 * @param {*} codeObjArray Array of code objects
 * @returns A comma separated string version of the array of codes
 */
const getStringFromListOfCodes = codeObjArray => {
  let stringOfCodes = "";
  codeObjArray.forEach(codeObj => {
    stringOfCodes += codeObj.code + ",";
  });

  //slice method used to remove the last comma
  return stringOfCodes.slice(0, -1);
};
