import React, { useState } from "react";
import CodeInputField from "../../Components/CodeInputField/CodeInputField";
import ListViewer from "../../Components/ListViewer/ListViewer";
import * as APIUtility from "../../Util/API";
import Button from "@material-ui/core/Button";
import { connect } from "react-redux";
import * as actions from "../../Store/Actions/index";
import { makeStyles } from "@material-ui/core/styles";

import "./RuleCreator.css";
const useStyles = makeStyles(theme => ({
  createButton: {
    margin: theme.spacing(1)
  }
}));

function RuleCreator(props) {
  // const [codeAutoCompleteDisplayed, setCodeAutoCompleteDisplayed] = useState([]);
  const [cachedCodeWithDescription, setCachedCodes] = useState([]);
  const [LHS, setLHS] = useState([]);
  const [RHS, setRHS] = useState([]);
  const [ageStart, setAgeStart] = useState(0);
  const [ageEnd, setAgeEnd] = useState(150);
  const [gender, setGender] = useState();

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

  const addAgeStart = value => {
    setAgeStart(value);
  };
  const addAgeEnd = value => {
    setAgeEnd(value);
  };
  const addGender = value => {
    setGender(value);
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

  const createRule = async () => {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    const LHSCodes = LHS.map(codeObj => codeObj.code);
    const RHSCodes = RHS.map(codeObj => codeObj.code);

    if (LHSCodes.length < 1) {
      props.setAlertMessage({ message: "There must be at least one code in the LHS", messageType: "error" });
    } else if (RHSCodes.length !== 1) {
      props.setAlertMessage({ message: "There must be exactly one code in the RHS", messageType: "error" });
    } else if (LHSCodes.indexOf(RHSCodes[0]) >= 0) {
      console.log("rhs in lhs");
      props.setAlertMessage({ message: "The rule can't have the same code in the LHS and RHS", messageType: "error" });
    } else {
      const data = { LHSCodes, RHSCodes, ageStart, ageEnd, gender };

      const options = {
        method: "POST",
        headers,
        body: JSON.stringify(data)
      };

      const response = await APIUtility.API.makeAPICall(APIUtility.CREATE_RULE, options);
      const status = await response.status;

      if (status === 200 || status === 201) {
        props.setAlertMessage({ message: "Rule successfully created", messageType: "success" });
        setLHS([]);
        setRHS([]);
        setAgeStart(0);
        setAgeEnd(150);
        setGender();
      } else {
        props.setAlertMessage({ message: "Rule not created", messageType: "error" });
      }
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
    <div>
      <div className="ruleSideBySideContainer">
        <div className="ruleSideBySideComponent">
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
          <div>
            <ListViewer
              title="LHS Codes"
              items={LHS}
              noItemsMessage="No codes selected"
              valueName="code"
              descriptionName="description"
              removeItemButton={{ title: "Remove code", onClick: handleRemoveLHSCode }}
              onSortEndCallback={updatedListOfSelectedCodes => {
                setLHS({ updatedListOfSelectedCodes });
              }}
              allowRearrage={false}
              menuOptions={LHSCodesComponentMenuItems}
              disableTitleGutters={true}
            />
          </div>
        </div>
        <div className="ruleSideBySideComponent">
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
          <div>
            <ListViewer
              title="RHS Codes"
              items={RHS}
              noItemsMessage="No codes selected"
              valueName="code"
              descriptionName="description"
              removeItemButton={{ title: "Remove code", onClick: handleRemoveRHSCode }}
              onSortEndCallback={updatedListOfSelectedCodes => {
                setRHS({ updatedListOfSelectedCodes });
              }}
              allowRearrage={false}
              menuOptions={RHSCodesComponentMenuItems}
              disableTitleGutters={true}
            />
          </div>
        </div>
      </div>

      <div className="ageGenderInput">
        <CodeInputField id_age="inputAgeStart" placeholder_age="Age(Start)" selectAge={addAgeStart} width_age="30%" />
        <CodeInputField id_age="inputAgeEnd" placeholder_age="Age(End)" selectAge={addAgeEnd} width_age="30%" />
        <CodeInputField
          id_gender="inputGender"
          placeholder_gender="Gender"
          selectGender={addGender}
          width_gender="30%"
        />
      </div>
      <div>
        <Button variant="contained" color="default" className={classes.createButton} onClick={createRule} size="large">
          Create
        </Button>
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
)(RuleCreator);
