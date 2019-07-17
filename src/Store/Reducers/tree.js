import * as actionTypes from "../Actions/actionsTypes";

const initialState = {
  selectedCodeInTree: ""
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_CODE_SELECTED_IN_TREE:
      return { ...state, selectedCodeInTree: action.codeSelected };

    default:
      return state;
  }
};

export default reducer;
