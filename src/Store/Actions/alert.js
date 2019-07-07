import * as actionTypes from "./actionsTypes";

export const setAlertMessage = newValue => {
  return {
    type: actionTypes.SET_ALERT_MESSAGE,
    newValue
  };
};
