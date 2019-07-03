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

  //TODO: create a async redux-thunk function with get the getState() funciton here to update recommendation and dagger asterisk state
  //from here
  //TODO: refactor: get rid of the manual API call to add a selected code from the containers
  // export const addSelectedCodeAndUpdate
};
