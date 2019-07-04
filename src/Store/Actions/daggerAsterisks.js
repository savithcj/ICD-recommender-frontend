import * as actionTypes from "./actionsTypes";

export const addDaggerAsterisk = codeObj => {
  return {
    type: actionTypes.ADD_DAGGER_ASTERISK,
    codeObj
  };
};

export const removeDaggerAsterisk = codeIndex => {
  return {
    type: actionTypes.REMOVE_DAGGGER_ASTERISK,
    codeIndex
  };
};

export const setDaggerAsterisk = daggerAsterisksValue => {
  return {
    type: actionTypes.SET_DAGGER_ASTERISKS,
    daggerAsterisksValue
  };
};
