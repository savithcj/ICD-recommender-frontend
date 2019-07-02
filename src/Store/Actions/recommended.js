import * as actionTypes from "./actionsTypes";

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
