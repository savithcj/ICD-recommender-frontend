import * as actionTypes from "./actionsTypes";

export const setUploadedLabels = uploadedLabels => {
  return {
    type: actionTypes.SET_UPLOADED_LABELS,
    uploadedLabels
  };
};

export const appendToUploadedLabels = uploadedLabels => {
  return {
    type: actionTypes.APPEND_TO_UPLOADED_LABELS,
    uploadedLabels
  };
};
