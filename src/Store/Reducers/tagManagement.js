import * as actionTypes from "../Actions/actionsTypes";

const initialState = {
  uploadedTags: []
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_UPLOADED_TAGS:
      return { uploadedTags: action.uploadedTags };

    case actionTypes.APPEND_TO_UPLOADED_TAGS:
      const currentTags = Array.from(state.uploadedTags);

      for (let i = 0; i < action.uploadedTags.length; i++) {
        let thisTag = action.uploadedTags[i];
        let duplicateTag = currentTags.find(tag => tag.id === thisTag.id);

        if (duplicateTag === undefined) {
          currentTags.push(thisTag);
        }
      }
      return { uploadedTags: currentTags };

    default:
      return state;
  }
};

export default reducer;
