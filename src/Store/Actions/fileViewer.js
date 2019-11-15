import * as actionTypes from "./actionsTypes";

export const setFileText = fileText => {
  return {
    type: actionTypes.SET_FILE_VIEWER_TEXT,
    fileText
  };
};

export const setSections = sections => {
  return {
    type: actionTypes.SET_SECTIONS,
    sections
  };
};

export const setSentences = sentences => {
  return {
    type: actionTypes.SET_SENTENCES,
    sentences
  };
};

export const setTokens = tokens => {
  return {
    type: actionTypes.SET_TOKENS,
    tokens
  };
};

export const setEntities = entities => {
  return {
    type: actionTypes.SET_ENTITIES,
    entities
  };
};

export const setSpacyLoading = spacyLoading => {
  return {
    type: actionTypes.SET_SPACY_LOADING,
    spacyLoading
  };
};

export const setAnnotationFocus = annotationFocus => {
  return {
    type: actionTypes.SET_ANNOTATION_FOCUS,
    annotationFocus
  };
};

export const setAnnotations = annotations => {
  return {
    type: actionTypes.SET_ANNOTATIONS,
    annotations
  };
};

export const setTagColors = tagColors => {
  return {
    type: actionTypes.SET_TAG_COLORS,
    tagColors
  };
};

export const setSectionList = sectionList => {
  return {
    type: actionTypes.SET_SECTION_LIST,
    sectionList
  };
};

export const setTag = tag => {
  return {
    type: actionTypes.SET_TAG,
    tag
  };
};
