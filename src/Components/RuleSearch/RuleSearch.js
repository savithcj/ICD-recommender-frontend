import React, { useState } from "react";
import CodeInputField from "../../Components/CodeInputField/CodeInputField";
import ListViewer from "../../Components/ListViewer/ListViewer";
import "./RuleSearch.css";

import APIClass from "../../Assets/Util/API";

function RuleSearch(props) {
  const [codeAutoCompleteDisplayed, setCodeAutoCompleteDisplayed] = useState([]);
  const [cachedCodeWithDescription, setCachedCodes] = useState([]);
  const [LHS, setLHS] = useState([]);
  const [RHS, setRHS] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

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
      method: "POST",
      headers,
      body: JSON.stringify(data)
    };

    const request = new Request(APIClass.getAPIURL("RULE_SEARCH"), options);
    fetch(request)
      .then(response => response.json())
      .then(data => parseSearchResults(data));
  };

  /**
   * FIXME:Temporary implementation of populating search results
   * Parse each rule in data into the format that contains a "code" and "description" fields
   * so that they can be displayed by the ListView component
   * @param {*} data
   */
  const parseSearchResults = data => {
    console.log(data);
    let formattedResults = [];
    if (data.length > 0) {
      data.forEach(item => {
        // console.log(item);
        formattedResults.push({
          id: item.id,
          code: item.lhs + " -> " + item.rhs,
          description:
            "Conf=" +
            item.confidence +
            ", Supp=" +
            item.support +
            ", #Accepted=" +
            item.num_accepted +
            ", #Rejected=" +
            item.num_rejected +
            ", #Suggested=" +
            item.num_suggested +
            ", Ages(" +
            item.min_age +
            "-" +
            item.max_age +
            ")"
        });
      });
    }
    setSearchResults(formattedResults);
  };

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

  const listComponentMenuItems = [
    {
      menuItemOnClick: LHS.length > 1 ? resetLHSCodes : null,
      menuItemText: "Remove All Items"
    }
  ];

  const adminSetRuleActive = () => {};
  const adminSetRuleInactive = () => {};

  return (
    <div className="grid-block">
      <div>
        <div>
          <ListViewer
            title="LHS Codes"
            items={LHS}
            noItemsMessage="No codes selected"
            valueName="code"
            descriptionName="description"
            removeItemButton={handleRemoveLHSCode}
            allowRearrage={false}
            menuOptions={listComponentMenuItems}
            disableTitleGutters={true}
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
            allowRearrage={false}
            menuOptions={listComponentMenuItems}
            disableTitleGutters={true}
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
      <div>
        <ListViewer
          title="Search Results"
          items={searchResults}
          noItemsMessage="No results"
          valueName="code"
          descriptionName="description"
          acceptItemButton={adminSetRuleActive}
          removeItemButton={adminSetRuleInactive}
          allowRearrage={false}
          menuOptions={listComponentMenuItems}
          disableTitleGutters={true}
        />
      </div>
    </div>
  );
}

export default RuleSearch;
