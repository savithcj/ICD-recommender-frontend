import * as actionTypes from "./actionsTypes";

export const setFileText = fileText => {
  return {
    type: actionTypes.SET_FILE_VIEWER_TEXT,
    fileText
  };
};
