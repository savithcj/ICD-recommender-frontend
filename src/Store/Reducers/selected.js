import * as actionTypes from "../Actions/actionsTypes";

const initialState = {
  selectedCodes: [{ code: 1 }]
};

const reducer = (state = initialState, action) => {
  const addCode = () => {
    const selectedCodes = Array.from(state.selectedCodes);
    // check if the code already exist in the selection
    if (selectedCodes.find(codeObj => codeObj.code === action.codeObj.code) === undefined) {
      // get code description from auto-suggest cache
      const codeDescriptions = Array.from(state.cachedCodeWithDescription);
      const cachedCode = codeDescriptions.find(codeObj => codeObj.code === action.codeObj.code);
      // construct new code object
      const newCode = {
        code: cachedCode.code,
        description: cachedCode.description
      };
      selectedCodes.push(newCode);
    }
    return { selectedCodes };
  };

  const removeCode = () => {
    const selectedCodes = Array.from(state.selectedCodes);
    selectedCodes.splice(action.codeIndex, 1);
    return { selectedCodes };
  };

  switch (action.type) {
    case actionTypes.ADD_SELECTED_CODE:
      return addCode();

    case actionTypes.REMOVE_SELECTED_CODE:
      return removeCode();

    default:
      return state;
  }
};

export default reducer;
