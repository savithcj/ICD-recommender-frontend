import * as actionTypes from "../Actions/actionsTypes";

const initialState = {
  rulesToSendBack: [], // A list of rules with user actions flags to be sent back to server
  rhsExclusions: [], // A list of RHS codes that have been rejected by user in current session
  rulesRolled: [] // A list of rules rolled with roll results
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.ADD_RHS_TO_EXCLUSION:
      if (!state.rulesToSendBack.includes(action.rhs)) {
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
        rulesToSendBack: action.value
      };

    case actionTypes.SET_RHS_EXCLUSION:
      return {
        ...state,
        rhsExclusions: action.value
      };

    case actionTypes.SET_RULES_ROLLED:
      return {
        ...state,
        rulesRolled: action.value
      };

    default:
      return state;
  }
};

export default reducer;
