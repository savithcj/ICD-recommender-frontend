import * as actionTypes from "./actionsTypes";
import * as APIUtility from "../../Util/API";
import { getStringFromListOfCodes } from "./utility";

export const removeDaggerAsterisk = codeIndex => {
  return {
    type: actionTypes.SET_DAGGER_ASTERISKS,
    codeIndex
  };
};

export const setDaggerAsterisk = value => {
  return {
    type: actionTypes.SET_DAGGER_ASTERISKS,
    daggerAsterisksValue: value
  };
};

export const fetchDaggerAsterisks = codeObjArray => {
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
