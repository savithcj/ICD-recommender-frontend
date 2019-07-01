/**
 * Action types----------------------------------------------------
 */

// Selected codes action types
export const ADD_SELECTED_CODE = "ADD_SELECTED_CODE";
export const REMOVE_SELECTED_CODE = "REMOVE_SELECTED_CODE";
export const RESET_SELECTED_CODES = "RESET_SELECTED_CODES";

// Recommended codes action types
export const GET_RECOMMENDED_CODES = "GET_RECOMMENDED_CODES";

// Dagger/Asterisks codes action types

// Cached codes action types

/**
 * Action creators-------------------------------------------------
 */

// Selected codes action creators
export function addSelectedCode(newCodeObj) {
  return { type: ADD_SELECTED_CODE, newCodeObj };
}
