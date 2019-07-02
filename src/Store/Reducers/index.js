import { combineReducers } from "redux";
import selected from "./selected";
import recommended from "./recommended";
import cached from "./cached";

export default combineReducers({
  cached,
  recommended,
  selected
});
