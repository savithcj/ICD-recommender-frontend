import React, { useState, useEffect } from "react";
import ListViewer from "../../Components/ListViewer/ListViewer";

export default function RuleReviewer() {
  const [flaggedRules, setFlaggedRules] = useState([]);

  useEffect(() => {
    getFlaggedRulesFromAPI();
  }, []);

  const getFlaggedRulesFromAPI = () => {
    const url = "http://localhost:8000/api/flaggedRules/";
    fetch(url)
      .then(response => response.json)
      .then(results => setFlaggedRules(results));
  };

  const handleAcceptRule = event => {
    const removeCodeIndex = parseInt(event.currentTarget.id, 10);
    const codes = [...LHS];
    codes.splice(removeCodeIndex, 1);
    setLHS(codes);
  };

  const handleRejectRule = event => {
    const removeCodeIndex = parseInt(event.currentTarget.id, 10);
    const codes = [...RHS];
    codes.splice(removeCodeIndex, 1);
    setRHS(codes);
  };

  const createRule = async () => {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    const LHSCodes = LHS.map(codeObj => codeObj.code);
    const RHSCodes = RHS.map(codeObj => codeObj.code);

    const data = { LHSCodes, RHSCodes, ageStart, ageEnd, gender };

    const options = {
      method: "PUT",
      headers,
      body: JSON.stringify(data)
    };

    const request = new Request("http://localhost:8000/api/modifyRule/", options);
    const response = await fetch(request);
    const status = await response.status;

    if (status === 200 || status === 201) {
      setLHS([]);
      setRHS([]);
      setAgeStart(0);
      setAgeEnd(0);
      setGender();
    }
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
    <ListViewer
      title="List of fagged rules"
      items={RHS}
      noItemsMessage="No flagged rules"
      valueName="code"
      descriptionName="description"
      removeItemButton={handleRemoveRHSCode}
      onSortEndCallback={updatedListOfSelectedCodes => {
        setRHS({ updatedListOfSelectedCodes });
      }}
      allowRearrage={false}
      menuOptions={RHSCodesComponentMenuItems}
    />
  );
}
