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
