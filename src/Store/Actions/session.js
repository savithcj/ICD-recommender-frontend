import * as actionTypes from "./actionsTypes";

export const addRHSToExclusion = rhs => {
  return {
    type: actionTypes.ADD_RHS_TO_EXCLUSION,
    rhs
  };
};

export const setRHSExclusion = value => {
  return {
    type: actionTypes.SET_RHS_EXCLUSION,
    value
  };
};

export const setRulesInSession = value => {
  return {
    type: actionTypes.SET_RULES_IN_SESSION,
    value
  };
};

export const setRolledRules = value => {
  return {
    type: actionTypes.SET_RULES_ROLLED,
    value
  };
};
