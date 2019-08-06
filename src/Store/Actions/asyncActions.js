// Contains all async actions dispatched using redux-thunk
import { setSelectedCodes } from "./selected";
import { setRecommendedCodes } from "./recommended";
import { appendToCache } from "./cached";
import { setDaggerAsterisk } from "./daggerAsterisks";
import * as APIUtility from "../../Util/API";
import { getStringFromListOfCodes } from "../../Util/utility";
import { setAge, setGender } from "./ageGender";
import { setRulesInSession, setRolledRules, setRHSExclusion } from "./session";
import { setAlertMessage } from "./alert";
import * as HelperFunctions from "../../Util/utility.js";
import { setCodeInTree } from "./tree";
import { setIsAuthorized, setUserRole } from "./authentication";

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
      const param = {
        codes: stringOfCodes,
        age: ageParam,
        gender: genderParam
      };

      dispatch(setRecommendedCodes("LOADING"));

      APIUtility.API.makeAPICall(APIUtility.REQUEST_ACTIVE_RULES, param)
        .then(response => response.json())
        .then(results => {
          results.forEach(ruleObj => {
            ruleObj.descriptionWithScore = ruleObj.description + " ~ Score: " + (ruleObj.score * 100).toFixed(1);
            ruleObj.rule = ruleObj.lhs + " -> " + ruleObj.rhs;
            //dislike button should be disabled if an admin has reviewed and accepted a rule
            //TODO:remove this
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

          //TODO: get rid of roll results output
          const passedRules = rolledRules.filter(rule => rule.rollOutcome);

          console.log("Number of rules rolled: ", rolledRules.length);
          console.log("Number of rules passed: ", passedRules.length);

          dispatch(setRolledRules(rolledRules));
          dispatch(setRulesInSession(HelperFunctions.createRulesToSendBack(cleanedResults, rulesToSendBack)));
          dispatch(setRecommendedCodes(cleanedResults));
        })
        .catch(error => {
          console.log("ERROR:", error);
        });
    } else {
      dispatch(setRecommendedCodes(null));
    }
  };
};

export const fetchDaggerAsterisksAndUpdateCache = codeObjArray => {
  let getDaggerAsteriskFor = [];
  codeObjArray.forEach(codeObj => {
    if (!codeObj.paired) {
      getDaggerAsteriskFor.push(codeObj);
    }
  });
  return (dispatch, getState) => {
    const stringOfCodes = getStringFromListOfCodes(getDaggerAsteriskFor);
    if (stringOfCodes !== "") {
      dispatch(setDaggerAsterisk("LOADING"));
      let indicesToRemove = [];
      APIUtility.API.makeAPICall(APIUtility.DAGGER_ASTERISK, stringOfCodes)
        .then(response => response.json())
        .then(results => {
          let promiseList = [];
          results.forEach(result => {
            result.combo = result.dagger + "\u271D " + result.asterisk + "*";
            if (codeObjArray.find(codeObject => codeObject.code === result.dagger) === undefined) {
              promiseList.push(
                APIUtility.API.makeAPICall(APIUtility.CODE_DESCRIPTION, result.dagger)
                  .then(response => response.json())
                  .then(codeObject => {
                    result.description = HelperFunctions.addDotToCode(codeObject.code) + ": " + codeObject.description;
                  })
              );
            } else if (codeObjArray.find(codeObject => codeObject.code === result.asterisk) === undefined) {
              promiseList.push(
                APIUtility.API.makeAPICall(APIUtility.CODE_DESCRIPTION, result.asterisk)
                  .then(response => response.json())
                  .then(codeObject => {
                    result.description = HelperFunctions.addDotToCode(codeObject.code) + ": " + codeObject.description;
                  })
              );
            } else {
              indicesToRemove.push(results.indexOf(result));
            }
          });
          Promise.all(promiseList).then(() => {
            let resultsToSend = [];
            for (let i = 0; i < results.length; i++) {
              if (!indicesToRemove.includes(i)) {
                resultsToSend.push(results[i]);
              }
            }
            dispatch(setDaggerAsterisk(resultsToSend));
          });
        })
        .catch(error => {
          console.log("ERROR:", error);
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
    APIUtility.API.makeAPICall(APIUtility.CHECK_CODE, enteredCodeObject.code)
      .then(response => response.json())
      .then(result => {
        if (result.exists !== true) {
          dispatch(setAlertMessage({ message: enteredCodeObject.code + " is an invalid code!", messageType: "error" }));
        } else {
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
            dispatch(setAlertMessage({ message: enteredCodeObject.code + " already selected", messageType: "error" }));
          }
        }
      })
      .catch(error => {
        console.log("ERROR:", error);
      });
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
    dispatch(setCodeInTree(""));
  };
};

/**
 * Action used to reset session states.
 */
export const resetSession = () => {
  return dispatch => {
    dispatch(setRolledRules([]));
    dispatch(setRulesInSession([]));
    dispatch(setRHSExclusion([]));
    dispatch(setAge(null));
    dispatch(setGender(null));
  };
};

/**
 * used to verify the token in the local storage
 */
export const verifyLSToken = callBackFunction => {
  return dispatch => {
    APIUtility.API.makeAPICall(APIUtility.VALIDATE_TOKEN).then(response => {
      if (response.status === 200) {
        dispatch(setIsAuthorized(true));
        dispatch(setUserRole(JSON.parse(localStorage.getItem("tokenObject")).user.role));
      }
    });
    callBackFunction();
  };
};
