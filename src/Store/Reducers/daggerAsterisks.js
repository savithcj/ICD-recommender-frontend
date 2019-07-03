import * as actionTypes from "../Actions/actionsTypes";

const initialState = {
  suggestedDaggerAsterisks: null
};

const reducer = (state = initialState, action) => {
  const addDagAst = () => {
    const suggestedDaggerAsterisks = Array.from(state.suggestedDaggerAsterisks);
    suggestedDaggerAsterisks.push(action.codeObj);
    return { suggestedDaggerAsterisks };
  };

  const removeDagAst = () => {
    const suggestedDaggerAsterisks = Array.from(state.suggestedDaggerAsterisks);
    suggestedDaggerAsterisks.splice(action.codeIndex, 1);
    return { suggestedDaggerAsterisks };
  };
  const setDagAst = () => {
    const suggestedDaggerAsterisks = action.daggerAsterisksValue;
    return { suggestedDaggerAsterisks };
  };

  switch (action.type) {
    case actionTypes.ADD_DAGGER_ASTERISK:
      return addDagAst();

    case actionTypes.REMOVE_DAGGGER_ASTERISK:
      return removeDagAst();

    case actionTypes.SET_DAGGER_ASTERISKS:
      return setDagAst();

    default:
      return state;
  }
};

export default reducer;
