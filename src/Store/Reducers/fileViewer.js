import * as actionTypes from "../Actions/actionsTypes";

const initialState = {
  fileViewerText: "",
  sections: [],
  sentences: [],
  tokens: [],
  entities: [],
  spacyLoading: false,
  annotationFocus: "",
  annotations: [],
  tagColors: {},
  sectionList: [],
  tag: "",
  fileReference: "",
  alternatingColors: ["rgb(149,156,243)", "rgb(244,196,199)"],
  linkedListAdd: false
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
    case actionTypes.SET_TAG_COLORS:
      return { ...state, tagColors: action.tagColors };
    case actionTypes.SET_SECTION_LIST:
      return { ...state, sectionList: action.sectionList };
    case actionTypes.SET_TAG:
      return { ...state, tag: action.tag };
    case actionTypes.SET_FILE_REFERENCE:
      return { ...state, fileReference: action.fileReference };
    case actionTypes.SET_ALTERNATING_COLORS:
      return { ...state, alternatingColors: action.alternatingColors };
    case actionTypes.SET_LINKED_LIST_ADD:
      return { ...state, linkedListAdd: action.linkedListAdd };
    default:
      return state;
  }
};

export default reducer;
