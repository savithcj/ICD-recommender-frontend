import * as actionTypes from "../Actions/actionsTypes";

const initialState = {
  fileViewerText: ""
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_FILE_VIEWER_TEXT:
      return { ...state, fileViewerText: action.fileText };

    default:
      return state;
  }
};

export default reducer;
