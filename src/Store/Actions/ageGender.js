import * as actionTypes from "./actionsTypes";

export const setAge = newAgeValue => {
  return {
    type: actionTypes.SET_AGE,
    newAgeValue
  };
};
export const setGender = newGenderValue => {
  return {
    type: actionTypes.SET_GENDER,
    newGenderValue
  };
};
