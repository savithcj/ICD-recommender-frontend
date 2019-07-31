import * as actionTypes from "./actionsTypes";

export const setToken = token => {
  return {
    type: actionTypes.SET_TOKEN,
    token
  };
};
