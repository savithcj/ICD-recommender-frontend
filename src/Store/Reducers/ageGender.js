import * as actionTypes from "../Actions/actionsTypes";

const initialState = {
  selectedAge: null,
  selectedGender: null
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_AGE:
      return { ...state, selectedAge: action.newAgeValue };
    case actionTypes.SET_GENDER:
      return { ...state, selectedGender: action.newGenderValue };
    default:
      return state;
  }
};

export default reducer;
