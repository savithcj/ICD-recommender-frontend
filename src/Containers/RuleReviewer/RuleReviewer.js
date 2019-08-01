import React, { useState, useEffect } from "react";
import ListViewer from "../../Components/ListViewer/ListViewer";

import * as APIUtility from "../../Util/API";

export default function RuleReviewer() {
  const [flaggedRules, setFlaggedRules] = useState([]);

  useEffect(() => {
    getFlaggedRulesFromAPI();
  }, []);

  const getFlaggedRulesFromAPI = () => {
    APIUtility.API.makeAPICall(APIUtility.FLAGGED_RULES, null)
      .then(response => response.json())
      .then(results => {
        results.forEach(ruleObject => {
          ruleObject.rule = ruleObject.lhs + " \u2192 " + ruleObject.rhs;
        });
        setFlaggedRules(results);
      })
      .catch(error => {
        console.log("ERROR:", error);
      });
  };

  const handleAcceptRule = event => {
    const acceptRuleIndex = parseInt(event.currentTarget.id, 10);

    const param = {
      id: flaggedRules[acceptRuleIndex].id,
      action: ",ACCEPT/"
    };

    const rules = [...flaggedRules];

    //ListViewer will display a loading indicator while the API promise is being fullfilled
    setFlaggedRules("LOADING");

    APIUtility.API.makeAPICall(APIUtility.UPDATE_FLAGGED_RULE, param)
      .then(response => {
        console.log(response.status);
        //Only removes a rule from the list viewer if the put request was successful
        //TODO: show a message to the user if the request failed
        if (response.status === 200) {
          rules.splice(acceptRuleIndex, 1);
        }
        setFlaggedRules(rules);
      })
      .catch(error => {
        console.log("ERROR:", error);
      });
  };

  const handleRejectRule = event => {
    const rejectRuleIndex = parseInt(event.currentTarget.id, 10);

    const param = {
      id: flaggedRules[rejectRuleIndex].id,
      action: ",REJECT/"
    };

    const rules = [...flaggedRules];

    setFlaggedRules("LOADING");

    APIUtility.API.makeAPICall(APIUtility.UPDATE_FLAGGED_RULE, param)
      .then(response => {
        console.log(response.status);
        //Only removes a rule from the list viewer if the put request was successful
        //TODO: show a message to the user if the request failed
        if (response.status === 200) {
          rules.splice(rejectRuleIndex, 1);
        }
        setFlaggedRules(rules);
      })
      .catch(error => {
        console.log("ERROR:", error);
      });
  };

  return (
    <div className="grid-block">
      <ListViewer
        className="ruleReviwer"
        title="List of flagged rules"
        items={flaggedRules}
        noItemsMessage="No flagged rules"
        valueName="rule"
        descriptionName="description"
        acceptItemButton={{ title: "Accept Rule", onClick: handleAcceptRule }}
        removeItemButton={{ title: "Reject Rule", onClick: handleRejectRule }}
        allowRearrage={false}
        menuOptions={[]}
        disableTitleGutters={true}
      />
    </div>
  );
}
