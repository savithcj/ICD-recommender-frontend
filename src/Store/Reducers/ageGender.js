import * as actionTypes from "../Actions/actionsTypes";

const initialState = {
  selectedAge: null,
  selectedGender: null
};

const reducer = (state = initialState, action) => {
  const setAge = () => {
    return { ...state, selectedAge: action.newAgeValue };
  };
  const setGender = () => {
    return { ...state, selectedGender: action.newGenderValue };
  };

  switch (action.type) {
    case actionTypes.SET_AGE:
      return setAge();
    case actionTypes.SET_GENDER:
      return setGender();
    default:
      return state;
  }
};

export default reducer;
