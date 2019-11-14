import * as actionTypes from "../Actions/actionsTypes";

const initialState = {
  fileViewerText: "",
  sections: [],
  sentences: [],
  tokens: [],
  entities: [],
  spacyLoading: false,
  annotationFocus: "NA",
  annotations: []
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_FILE_VIEWER_TEXT:
      return { ...state, fileViewerText: action.fileText };
    case actionTypes.SET_SECTIONS:
      return { ...state, sections: action.sections };
    case actionTypes.SET_SENTENCES:
      return { ...state, sentences: action.sentences };
    case actionTypes.SET_TOKENS:
      return { ...state, tokens: action.tokens };
    case actionTypes.SET_ENTITIES:
      return { ...state, entities: action.entities };
    case actionTypes.SET_SPACY_LOADING:
      return { ...state, spacyLoading: action.spacyLoading };
    case actionTypes.SET_ANNOTATION_FOCUS:
      return { ...state, annotationFocus: action.annotationFocus };
    case actionTypes.SET_ANNOTATIONS:
      return { ...state, annotations: action.annotations };
    default:
      return state;
  }
};

export default reducer;
