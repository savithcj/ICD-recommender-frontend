import * as actionTypes from "./actionsTypes";

export const setUploadedTags = uploadedTags => {
  return {
    type: actionTypes.SET_UPLOADED_TAGS,
    uploadedTags
  };
};

export const enableTagByIndex = index => {
  return {
    type: actionTypes.ENABLE_TAG_BY_INDEX,
    index
  };
};

export const disableTagByIndex = index => {
  return {
    type: actionTypes.DISABLE_TAG_BY_INDEX,
    index
  };
};

export const enableAllTags = () => {
  return {
    type: actionTypes.ENABLE_ALL_TAGS
  };
};

export const disableAllTags = () => {
  return {
    type: actionTypes.DISABLE_ALL_TAGS
  };
};
