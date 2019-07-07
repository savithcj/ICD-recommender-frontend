import { combineReducers } from "redux";
import selected from "./selected";
import recommended from "./recommended";
import cached from "./cached";
import daggerAsterisks from "./daggerAsterisks";
import ageGender from "./ageGender";
import session from "./session";
import alert from "./alert";

export default combineReducers({
  cached,
  daggerAsterisks,
  recommended,
  selected,
  ageGender,
  session,
  alert
});
