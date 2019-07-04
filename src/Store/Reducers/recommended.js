import * as actionTypes from "../Actions/actionsTypes";

const initialState = {
  recommendedCodes: null
};

const reducer = (state = initialState, action) => {
  const removeCode = () => {
    const recommendedCodes = Array.from(state.recommendedCodes);
    recommendedCodes.splice(action.codeIndex, 1);
    return { recommendedCodes };
  };
  const setCodes = () => {
    const recommendedCodes = action.recommendedCodesValue;
    return { recommendedCodes };
  };

  switch (action.type) {
    case actionTypes.REMOVE_RECOMMENDED_CODE:
      return removeCode();

    case actionTypes.SET_RECOMMENDED_CODES:
      return setCodes();

    default:
      return state;
  }
};

export default reducer;
