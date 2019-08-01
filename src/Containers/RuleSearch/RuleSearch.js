import React, { useState } from "react";
import CodeInputField from "../../Components/CodeInputField/CodeInputField";
import ListViewer from "../../Components/ListViewer/ListViewer";
import * as APIUtility from "../../Util/API";
import { connect } from "react-redux";
import * as actions from "../../Store/Actions/index";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";

import "./RuleSearch.css";
const useStyles = makeStyles(theme => ({
  searchButton: {
    margin: theme.spacing(1)
  }
}));

function RuleSearch(props) {
  // const [codeAutoCompleteDisplayed, setCodeAutoCompleteDisplayed] = useState([]);
  const [cachedCodeWithDescription, setCachedCodes] = useState([]);
  const [LHS, setLHS] = useState([]);
  const [RHS, setRHS] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  const classes = useStyles();

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
    if (RHS.length > 0) {
      props.setAlertMessage({ message: "RHS already entered", messageType: "error" });
    } else {
      // get code description from auto-suggest cache
      const codeDescriptions = Array.from(cachedCodeWithDescription);
      const cachedCode = codeDescriptions.find(codeObj => codeObj.code === newCodeObj);
      // construct new code object
      const newCode = {
        code: cachedCode.code,
        description: cachedCode.description
      };
      let selectedCodes = [newCode];
      setRHS(selectedCodes);
    }
  };

  const resetLHSCodes = () => {
    setLHS([]);
  };

  const resetSearchResults = () => {
    setSearchResults([]);
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
    const LHSCodes = LHS.map(codeObj => codeObj.code);
    const RHSCodes = RHS.map(codeObj => codeObj.code);

    const data = { LHSCodes, RHSCodes };

    const options = {
      method: "POST",
      body: JSON.stringify(data)
    };

    APIUtility.API.makeAPICall(APIUtility.RULE_SEARCH, null, options)
      .then(response => response.json())
      .then(data => parseSearchResults(data))
      .catch(error => {
        console.log("ERROR:", error);
      });
  };

  /**
   * FIXME:Temporary implementation of populating search results
   * Parse each rule in data into the format that contains a "code" and "description" fields
   * so that they can be displayed by the ListView component
   * @param {*} data
   */
  const parseSearchResults = data => {
    let formattedResults = [];
    if (data.length > 0) {
      data.forEach(item => {
        formattedResults.push({
          id: item.id,
          code: item.lhs + " -> " + item.rhs,
          description: `Conf=${item.confidence}, Supp=${item.support}, #Accepted=${item.num_accepted}, #Rejected=${
            item.num_rejected
          }, #Suggested=${item.num_suggested}, Ages(${item.min_age}-${item.max_age}), Gender=${item.gender} `,
          active: item.active
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

  const listComponentMenuItemsLHS = [
    {
      menuItemOnClick: LHS.length > 1 ? resetLHSCodes : null,
      menuItemText: "Remove All Items"
    }
  ];

  const listComponentMenuItemsResults = [
    {
      menuItemOnClick: searchResults.length > 0 ? resetSearchResults : null,
      menuItemText: "Remove All Items"
    }
  ];

  const adminSetRuleActive = event => {
    const indexToChange = parseInt(event.currentTarget.id, 10);
    setRuleStatus(indexToChange, "True");
    let searchResultsNew = Array.from(searchResults);
    searchResultsNew[indexToChange].active = true;
    setSearchResults(searchResultsNew);
  };

  const adminSetRuleInactive = event => {
    const indexToChange = parseInt(event.currentTarget.id, 10);
    setRuleStatus(indexToChange, "False");
    let searchResultsNew = Array.from(searchResults);
    searchResultsNew[indexToChange].active = false;
    setSearchResults(searchResultsNew);
  };

  const setRuleStatus = (indexToChange, status) => {
    const rule_id = searchResults[indexToChange].id;
    // const headers = new Headers();
    // headers.append("Content-Type", "application/json");
    const data = { status, rule_id };
    const options = {
      method: "PATCH",
      // headers,
      body: JSON.stringify(data)
    };

    APIUtility.API.makeAPICall(APIUtility.RULE_STATUS, null, options)
      .then(response => {
        if (response.status !== 200) {
          props.setAlertMessage({ message: "Error sending data to server", messageType: "error" });
        }
      })
      .catch(error => {
        console.log("ERROR:", error);
      });
  };

  const shouldHideRemoveButton = index => {
    return searchResults[index].active ? false : true;
  };

  const shouldHideAcceptButton = index => {
    return searchResults[index].active ? true : false;
  };

  const displayInactiveRules = () => {
    APIUtility.API.makeAPICall(APIUtility.INACTIVE_RULES, null)
      .then(response => response.json())
      .then(data => parseSearchResults(data))
      .catch(error => {
        console.log("ERROR:", error);
      });
  };

  return (
    <div className="grid-block">
      <div className="ruleSideBySideContainer">
        <div className="ruleSideBySideComponent">
          <div>
            <CodeInputField
              id_code="inputCodeLHS"
              placeholder_code="Search for Code in LHS"
              selectCode={addCodeLHS}
              codeCache={cachedCodeWithDescription}
              appendCodeToCache={appendCodeToCache}
              autoClearCode={true}
              width_code="100%"
            />
          </div>
          <div>
            <ListViewer
              title="LHS Codes"
              items={LHS}
              noItemsMessage="No codes selected"
              valueName="code"
              descriptionName="description"
              removeItemButton={{ title: "Remove code", onClick: handleRemoveLHSCode }}
              allowRearrage={false}
              menuOptions={listComponentMenuItemsLHS}
              disableTitleGutters={true}
            />
          </div>
        </div>

        <div className="ruleSideBySideComponent">
          <div>
            <CodeInputField
              id_code="inputCodeRHS"
              placeholder_code="Search for Code in RHS"
              setCodeValue={setRHS}
              selectCode={addCodeRHS}
              codeCache={cachedCodeWithDescription}
              appendCodeToCache={appendCodeToCache}
              autoClearCode={true}
              width_code="100%"
            />
          </div>
          <div>
            <ListViewer
              title="RHS Codes"
              items={RHS}
              noItemsMessage="No codes selected"
              valueName="code"
              descriptionName="description"
              removeItemButton={{ title: "Remove code", onClick: handleRemoveRHSCode }}
              allowRearrage={false}
              menuOptions={[]}
              disableTitleGutters={true}
            />
          </div>
        </div>
      </div>

      <div>
        <Button
          variant="contained"
          color="default"
          className={classes.searchButton}
          onClick={searchForRule}
          size="large"
        >
          Search
        </Button>
        <Button
          variant="contained"
          color="default"
          className={classes.searchButton}
          onClick={displayInactiveRules}
          size="large"
        >
          Display Inactive Rules
        </Button>
      </div>
      <div>
        <ListViewer
          title="Search Results"
          items={searchResults}
          noItemsMessage="No results"
          valueName="code"
          descriptionName="description"
          acceptItemButton={{ title: "Set status to active", onClick: adminSetRuleActive }}
          removeItemButton={{ title: "Set status to inactive", onClick: adminSetRuleInactive }}
          shouldHideRemoveButton={shouldHideRemoveButton}
          shouldHideAcceptButton={shouldHideAcceptButton}
          allowRearrage={false}
          menuOptions={listComponentMenuItemsResults}
          disableTitleGutters={true}
        />
      </div>
    </div>
  );
}

const mapDispatchToProps = dispatch => {
  return {
    setAlertMessage: newValue => dispatch(actions.setAlertMessage(newValue))
  };
};

export default connect(
  null,
  mapDispatchToProps
)(RuleSearch);
