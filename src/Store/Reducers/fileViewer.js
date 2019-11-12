import * as actionTypes from "../Actions/actionsTypes";

const initialState = {
  fileViewerText: "",
  sections: [],
  sentences: [],
  tokens: [],
  entities: []
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_FILE_VIEWER_TEXT:
      return { ...state, fileViewerText: action.fileText };
    case actionTypes.SET_SECTIONS:
    // action.sections
    case actionTypes.SET_SENTENCES:
    // action.sentences
    case actionTypes.SET_TOKENS:
    // action.tokens
    case actionTypes.SET_ENTITIES:
    // actions.entities
    default:
      return state;
  }
};

export default reducer;
