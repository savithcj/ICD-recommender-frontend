import * as actionTypes from "../Actions/actionsTypes";

const initialState = {
  alertMessage: null
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_ALERT_MESSAGE:
      return { alertMessage: action.newValue };

    default:
      return state;
  }
};

export default reducer;
