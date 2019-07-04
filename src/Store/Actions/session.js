import * as actionTypes from "./actionsTypes";

export const addRHSToExclusion = rhs => {
  return {
    type: actionTypes.ADD_RHS_TO_EXCLUSION,
    rhs
  };
};

export const addRuleToSession = ruleObj => {
  return {
    type: actionTypes.ADD_RULE_TO_SESSION,
    ruleObj
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
