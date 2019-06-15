import React, { useState } from "react";
import CodeInputField from "../../Components/CodeInputField/CodeInputField";

import "./RuleCreator.css";

function RuleCreator(props) {
  const [codeAutoCompleteDisplayed, setCodeAutoCompleteDisplayed] = useState([]);
  const [cachedCodeWithDescription, setCachedCodes] = useState([]);

  function addCodeLHS() {}
  const selectAge_a = () => {};
  const selectAge_b = () => {};

  /**
   *  Required for code searchbox Auto-Complete
   * Cache code suggestion results from API call to state for repeated quiries
   * Updates the cachedCodeList and cachedCodeWithDescription in App.state
   * @param {*} results
   * @param {*} oFunc optional function to be called at end of the method
   * @param {*} oArg optinal argument for the optional function
   */

  const appendCodeToCache = results => {
    let codesWithDescript = Array.from(cachedCodeWithDescription);

    for (let i = 0, l = results.length; i < l; i++) {
      let thisCode = results[i];
      let codeFound = codesWithDescript.find(codeObj => codeObj.code === thisCode.code);
      if (codeFound === undefined) {
        codesWithDescript.push(thisCode);
      }
    }

    setCachedCodes(codesWithDescript);
  };

  return (
    <div>
      <CodeInputField
        id_code="input1"
        placeholder_code="Search for a code"
        selectCode={addCodeLHS}
        codeCache={cachedCodeWithDescription}
        appendCodeToCache={appendCodeToCache}
      />
      <CodeInputField id_age="input2" placeholder_age="Age(Start)" />
      <CodeInputField id_age="input3" placeholder_age="Age(End)" />
      <CodeInputField id_gender="input4" placeholder_gender="Gender" />
    </div>
  );
}

export default RuleCreator;
