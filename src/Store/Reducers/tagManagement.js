import * as actionTypes from "../Actions/actionsTypes";

const initialState = {
  uploadedTags: []
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_UPLOADED_TAGS:
      return { uploadedTags: action.uploadedTags };

    default:
      return state;
  }
};

export default reducer;
