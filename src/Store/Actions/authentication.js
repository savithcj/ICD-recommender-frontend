import * as actionTypes from "./actionsTypes";

export const setIsAuthorized = authBool => {
  return {
    type: actionTypes.SET_IS_AUTHORIZED,
    authBool
  };
};

export const setUserRole = userRole => {
  return {
    type: actionTypes.SET_USER_ROLE,
    userRole
  };
};

export const setIsServerDown = serverDownBool => {
  return {
    type: actionTypes.SET_IS_SERVER_DOWN,
    serverDownBool
  };
};
