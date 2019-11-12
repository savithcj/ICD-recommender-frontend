import * as actionTypes from "./actionsTypes";

export const setUploadedTags = uploadedTags => {
  return {
    type: actionTypes.SET_UPLOADED_TAGS,
    uploadedTags
  };
};

export const appendToUploadedTags = uploadedTags => {
  return {
    type: actionTypes.APPEND_TO_UPLOADED_TAGS,
    uploadedTags
  };
};
