import * as actionTypes from "./actionsTypes";

export const appendToCache = codeObjArray => {
  return {
    type: actionTypes.APPEND_TO_CACHE,
    codeObjArray
  };
};
