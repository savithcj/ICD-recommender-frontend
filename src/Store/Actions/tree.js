import * as actionTypes from "./actionsTypes";

export const setCodeInTree = codeSelected => {
  return {
    type: actionTypes.SET_CODE_SELECTED_IN_TREE,
    codeSelected
  };
};
