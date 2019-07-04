import * as actionTypes from "../Actions/actionsTypes";

const initialState = {
  rules: [],
  rhsExclusions: []
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.ADD_RULE_TO_SESSION:
      break;

    case actionTypes.ADD_RHS_TO_EXCLUSION:
      if (!state.rules.includes(action.rhs)) {
        const newRHSExclusions = Array.from(state.rhsExclusions);
        newRHSExclusions.push(action.rhs);
        return {
          ...state,
          rhsExclusions: newRHSExclusions
        };
      }
      return state;

    case actionTypes.SET_RULES_IN_SESSION:
      return {
        ...state,
        rules: action.value
      };
    case actionTypes.SET_RHS_EXCLUSION:
      return {
        ...state,
        rhsExclusions: action.value
      };
    default:
      return state;
  }
};

export default reducer;
