import * as actionTypes from "../Actions/actionsTypes";

const initialState = {
  cachedCodeWithDescription: []
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.APPEND_TO_CACHE:
      const cachedCodeWithDescription = Array.from(state.cachedCodeWithDescription);

      for (let i = 0; i < action.codeObjArray.length; i++) {
        let thisCode = action.codeObjArray[i];
        let codeFound = cachedCodeWithDescription.find(codeObj => codeObj.code === thisCode.code);
        if (codeFound === undefined) {
          cachedCodeWithDescription.push(thisCode);
        }
      }

      return { cachedCodeWithDescription };

    default:
      return state;
  }
};

export default reducer;
