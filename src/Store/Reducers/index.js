import { combineReducers } from "redux";
import selected from "./selected";
import recommended from "./recommended";
import cached from "./cached";
import daggerAsterisks from "./daggerAsterisks";
import inputBoxes from "./inputBoxes";

export default combineReducers({
  cached,
  daggerAsterisks,
  recommended,
  selected,
  inputBoxes
});
