import * as actionTypes from "../Actions/actionsTypes";

const initialState = {
  uploadedTags: []
};

const reducer = (state = initialState, action) => {
  const enableTagByIndex = () => {
    const items = [...state.uploadedTags];
    const newTag = { ...items[action.index], disabled: false };
    items[action.index] = newTag;
    return { uploadedTags: items };
  };

  const disableTagByIndex = () => {
    const items = [...state.uploadedTags];
    const newTag = { ...items[action.index], disabled: true };
    items[action.index] = newTag;
    return { uploadedTags: items };
  };

  switch (action.type) {
    case actionTypes.SET_UPLOADED_TAGS:
      return { uploadedTags: action.uploadedTags };

    case actionTypes.ENABLE_TAG_BY_INDEX:
      return enableTagByIndex();

    case actionTypes.DISABLE_TAG_BY_INDEX:
      return disableTagByIndex();
    default:
      return state;
  }
};

export default reducer;
