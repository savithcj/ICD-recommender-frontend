import * as actionTypes from "./actionsTypes";

export const addSelectedCode = codeObjToAdd => {
  return {
    type: actionTypes.ADD_SELECTED_CODE,
    codeObj: codeObjToAdd
  };
};

export const removeSelectedCode = removedCodeIndex => {
  return {
    type: actionTypes.REMOVE_SELECTED_CODE,
    codeIndex: removedCodeIndex
  };
};
