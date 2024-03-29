import * as actionTypes from "../Actions/actionsTypes";

const initialState = {
  selectedCodes: []
};

const reducer = (state = initialState, action) => {
  const addCode = () => {
    const selectedCodes = Array.from(state.selectedCodes);
    // check if the code already exist in the selection
    if (selectedCodes.find(codeObj => codeObj.code === action.codeObj.code) === undefined) {
      selectedCodes.push(action.codeObj);
    } else {
      console.log("[selected reducer] Error: trying to add duplicate code => ", action.codeObj.code);
    }
    return { selectedCodes };
  };

  const removeCode = () => {
    const selectedCodes = Array.from(state.selectedCodes);
    selectedCodes.splice(action.codeIndex, 1);
    return { selectedCodes };
  };

  const setCodes = () => {
    const selectedCodes = action.selectedCodesValue;
    return { selectedCodes };
  };

  switch (action.type) {
    case actionTypes.ADD_SELECTED_CODE:
      return addCode();

    case actionTypes.REMOVE_SELECTED_CODE:
      return removeCode();

    case actionTypes.SET_SELECTED_CODES:
      return setCodes();

    default:
      return state;
  }
};

export default reducer;
