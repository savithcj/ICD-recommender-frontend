import React, { useState } from "react";
import CodeInputField from "../../Components/CodeInputField/CodeInputField";

import "./RuleCreator.css";

function RuleCreator(props) {
  const [codeAutoCompleteDisplayed, setCodeAutoCompleteDisplayed] = useState([]);

  function addCodeLHS() {}
  function codeSearchBoxChangeListener() {}

  return (
    <div>
      <CodeInputField
        id_code="input1"
        placeholder="Search for a code"
        onChange={codeSearchBoxChangeListener}
        codes={codeAutoCompleteDisplayed}
        selectCode={addCodeLHS}
      />
    </div>
  );
}

export default RuleCreator;
