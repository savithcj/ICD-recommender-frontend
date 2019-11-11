import * as actionTypes from "../Actions/actionsTypes";

const initialState = {
  uploadedLabels: []
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_UPLOADED_LABELS:
      return { uploadedLabels: action.uploadedLabels };

    case actionTypes.APPEND_TO_UPLOADED_LABELS:
      const currentLabels = Array.from(state.uploadedLabels);
      for (let i = 0; i < action.uploadedLabels.length; ) {
        let thisLabel = action.uploadedLabels[i];
        let duplicateLabel = currentLabels.find(label => label === thisLabel);
        if (duplicateLabel === undefined) {
          currentLabels.push(thisLabel);
        }
      }
      return { uploadedLabels: currentLabels };

    default:
      return state;
  }
};

export default reducer;
