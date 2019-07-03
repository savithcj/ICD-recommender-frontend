import * as actionTypes from "./actionsTypes";

export const addSelectedCode = codeObj => {
  return {
    type: actionTypes.ADD_SELECTED_CODE,
    codeObj
  };
};

export const removeSelectedCode = codeIndex => {
  return {
    type: actionTypes.REMOVE_SELECTED_CODE,
    codeIndex
  };
};

export const setSelectedCodes = selectedCodesValue => {
  return {
    type: actionTypes.SET_SELECTED_CODES,
    selectedCodesValue
  };
};
