import * as actionTypes from "../Actions/actionsTypes";

const initialState = {
  oAuthToken: null
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_TOKEN:
      console.log("REDUCER INPUT: ", action);
      return { oAuthToken: action.token };
    default:
      return state;
  }
};

export default reducer;
