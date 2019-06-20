import React, { useState, useEffect } from "react";
import ListViewer from "../../Components/ListViewer/ListViewer";

export default function RuleReviewer() {
  const [flaggedRules, setFlaggedRules] = useState([]);

  useEffect(() => {
    getFlaggedRulesFromAPI();
  }, []);

  const getFlaggedRulesFromAPI = () => {
    const url = "http://localhost:8000/api/flaggedRules/?format=json";

    fetch(url)
      .then(response => response.json())
      .then(results => {
        results.forEach(ruleObject => {
          ruleObject.rule = ruleObject.lhs + " -> " + ruleObject.rhs;
        });
        return setFlaggedRules(results);
      });
  };

  const handleAcceptRule = event => {
    const acceptRuleIndex = parseInt(event.currentTarget.id, 10);

    const url = "http://localhost:8000/api/updateFlaggedRule/" + flaggedRules[acceptRuleIndex].id + ",ACCEPT/";

    console.log(url);

    const rules = [...flaggedRules];

    //ListViewer will display a loading indicator while the API promise is being fullfilled
    setFlaggedRules("LOADING");

    fetch(url, { method: "PUT" }).then(response => {
      console.log(response.status);
      if (response.status === 200) {
        rules.splice(acceptRuleIndex, 1);
      }
      setFlaggedRules(rules);
    });
  };

  const handleRejectRule = event => {
    const rejectRuleIndex = parseInt(event.currentTarget.id, 10);

    const url = "http://localhost:8000/api/updateFlaggedRule/" + flaggedRules[rejectRuleIndex].id + ",REJECT/";

    const rules = [...flaggedRules];

    //ListViewer will display a loading indicator while the API promise is being fullfilled
    setFlaggedRules("LOADING");

    fetch(url, { method: "PUT" }).then(response => {
      console.log(response.status);
      if (response.status === 200) {
        rules.splice(rejectRuleIndex, 1);
      }
      setFlaggedRules(rules);
    });
  };

  return (
    <ListViewer
      className="ruleReviwer"
      title="List of flagged rules"
      items={flaggedRules}
      noItemsMessage="No flagged rules"
      valueName="rule"
      descriptionName="description"
      acceptItemButton={handleAcceptRule}
      removeItemButton={handleRejectRule}
      allowRearrage={false}
      menuOptions={[]}
    />
  );
}
