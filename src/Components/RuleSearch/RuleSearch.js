import React, { useState } from "react";
import CodeInputField from "../../Components/CodeInputField/CodeInputField";
import ListViewer from "../../Components/ListViewer/ListViewer";
import "./RuleSearch.css";

function RuleSearch(props) {
  const [codeAutoCompleteDisplayed, setCodeAutoCompleteDisplayed] = useState([]);
  const [cachedCodeWithDescription, setCachedCodes] = useState([]);
  const [LHS, setLHS] = useState([]);
  const [RHS, setRHS] = useState([]);

  const addCodeLHS = newCodeObj => {
    let selectedCodes = Array.from(LHS);
    // check if the code already exist in the selection
    const getDuplicate = selectedCodes.find(codeObj => codeObj.code === newCodeObj);
    if (getDuplicate === undefined) {
      // get code description from auto-suggest cache
      const codeDescriptions = Array.from(cachedCodeWithDescription);
      const cachedCode = codeDescriptions.find(codeObj => codeObj.code === newCodeObj);
      // construct new code object
      const newCode = {
        code: cachedCode.code,
        description: cachedCode.description
      };
      selectedCodes.push(newCode);
      setLHS(selectedCodes);
    }
  };

  const addCodeRHS = newCodeObj => {
    let selectedCodes = Array.from(RHS);
    // check if the code already exist in the selection
    const getDuplicate = selectedCodes.find(codeObj => codeObj.code === newCodeObj);
    if (getDuplicate === undefined) {
      // get code description from auto-suggest cache
      const codeDescriptions = Array.from(cachedCodeWithDescription);
      const cachedCode = codeDescriptions.find(codeObj => codeObj.code === newCodeObj);
      // construct new code object
      const newCode = {
        code: cachedCode.code,
        description: cachedCode.description
      };
      selectedCodes.push(newCode);
      setRHS(selectedCodes);
    }
  };

  const resetLHSCodes = () => {
    setLHS([]);
  };

  const resetRHSCodes = () => {
    setRHS([]);
  };

  const handleRemoveLHSCode = event => {
    const removeCodeIndex = parseInt(event.currentTarget.id, 10);
    const codes = [...LHS];
    codes.splice(removeCodeIndex, 1);
    setLHS(codes);
  };

  const handleRemoveRHSCode = event => {
    const removeCodeIndex = parseInt(event.currentTarget.id, 10);
    const codes = [...RHS];
    codes.splice(removeCodeIndex, 1);
    setRHS(codes);
  };

  const searchForRule = async () => {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    const LHSCodes = LHS.map(codeObj => codeObj.code);
    const RHSCodes = RHS.map(codeObj => codeObj.code);

    const data = { LHSCodes, RHSCodes };

    const options = {
      method: "GET",
      headers,
      body: JSON.stringify(data)
    };

    const request = new Request("http://localhost:8000/api/ruleSearch/", options);
    const response = await fetch(request);
    const status = await response.status;

    console.log(response);
  };

  const LHSCodesComponentMenuItems = [
    {
      menuItemOnClick: LHS.length > 1 ? resetLHSCodes : null,
      menuItemText: "Remove All Items"
    }
  ];

  const RHSCodesComponentMenuItems = [
    {
      menuItemOnClick: RHS.length > 1 ? resetRHSCodes : null,
      menuItemText: "Remove All Items"
    }
  ];

  return (
    <div>
      <div>
        <div>
          <ListViewer
            title="LHS Codes"
            items={LHS}
            noItemsMessage="No codes selected"
            valueName="code"
            descriptionName="description"
            removeItemButton={handleRemoveLHSCode}
            onSortEndCallback={updatedListOfSelectedCodes => {
              setLHS({ updatedListOfSelectedCodes });
            }}
            allowRearrage={false}
            menuOptions={LHSCodesComponentMenuItems}
          />
        </div>
        <div>
          <CodeInputField
            id_code="inputCodeLHS"
            placeholder_code="Enter Code to be added to LHS"
            selectCode={addCodeLHS}
            codeCache={cachedCodeWithDescription}
            appendCodeToCache={appendCodeToCache}
            autoClearCode={true}
            width_code="100%"
          />
        </div>
      </div>
      <div>
        <div>
          <ListViewer
            title="RHS Codes"
            items={RHS}
            noItemsMessage="No codes selected"
            valueName="code"
            descriptionName="description"
            removeItemButton={handleRemoveRHSCode}
            onSortEndCallback={updatedListOfSelectedCodes => {
              setRHS({ updatedListOfSelectedCodes });
            }}
            allowRearrage={false}
            menuOptions={RHSCodesComponentMenuItems}
          />
        </div>
        <div>
          <CodeInputField
            id_code="inputCodeRHS"
            placeholder_code="Enter code to be added to RHS"
            setCodeValue={setRHS}
            selectCode={addCodeRHS}
            codeCache={cachedCodeWithDescription}
            appendCodeToCache={appendCodeToCache}
            autoClearCode={true}
            width_code="100%"
          />
        </div>
      </div>
      <div>
        <button type="button" onClick={searchForRule}>
          Search
        </button>
      </div>
    </div>
  );
}
