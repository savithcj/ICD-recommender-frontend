import * as actionTypes from "./actionsTypes";

export const setUploadedTags = uploadedTags => {
  return {
    type: actionTypes.SET_UPLOADED_TAGS,
    uploadedTags
  };
};
