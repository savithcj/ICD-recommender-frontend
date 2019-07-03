import * as actionTypes from "./actionsTypes";

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
