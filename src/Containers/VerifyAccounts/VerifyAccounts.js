import React, { useState, useEffect } from "react";
import ListViewer from "../../Components/ListViewer/ListViewer";
import * as APIUtility from "../../Util/API";
import { connect } from "react-redux";

function VerifyAccounts(props) {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    APIUtility.API.makeAPICall(APIUtility.LIST_UNVERIFIED_ACCOUNTS, null)
      .then(response => response.json())
      .then(results => {
        setAccounts(results);
      })
      .catch(error => {
        console.log("ERROR:", error);
      });
  }, []);

  const approveAccount = idToApprove => {
    const data = { idToApprove };
    const options = {
      method: "PATCH",
      body: JSON.stringify(data)
    };
    APIUtility.API.makeAPICall(APIUtility.APPROVE_USER, null, options);
  };

  const rejectAccount = idToReject => {
    const options = {
      method: "DELETE"
    };
    APIUtility.API.makeAPICall(APIUtility.REJECT_USER, idToReject, options);
  };

  const approveIndex = event => {
    const indexToApprove = parseInt(event.currentTarget.id, 10);
    approveAccount(accounts[indexToApprove].id);
    updateList(indexToApprove);
  };

  const rejectIndex = event => {
    const indexToReject = parseInt(event.currentTarget.id, 10);
    rejectAccount(accounts[indexToReject].id);
    updateList(indexToReject);
  };

  const updateList = index => {
    let displayAccounts = [...accounts];
    displayAccounts.splice(index, 1);
    setAccounts(displayAccounts);
  };

  const approveAll = () => {
    while (accounts.length > 0) {
      approveAccount(accounts[0].id);
      const updatedAccounts = [...accounts];
      updatedAccounts.splice(0, 1);
      setAccounts(updatedAccounts);
    }
  };

  const rejectAll = () => {
    while (accounts.length > 0) {
      rejectAccount(accounts[0].id);
      const updatedAccounts = [...accounts];
      updatedAccounts.splice(0, 1);
      setAccounts(updatedAccounts);
    }
  };

  const listComponentMenuItems = [
    {
      menuItemOnClick: accounts.length > 0 ? approveAll : null,
      menuItemText: "Approve all accounts"
    },
    {
      menuItemOnClick: accounts.length > 0 ? rejectAll : null,
      menuItemText: "Reject all accounts"
    }
  ];

  return (
    <div>
      <ListViewer
        title="Unverified Accounts"
        items={accounts}
        noItemsMessage="No results"
        dontAddDotBoolean={true}
        valueName="username"
        descriptionName="description"
        acceptItemButton={{ title: "Approve account", onClick: approveIndex }}
        removeItemButton={{ title: "Remove account", onClick: rejectIndex }}
        shouldHideRemoveButton={false}
        shouldHideAcceptButton={false}
        allowRearrage={false}
        menuOptions={listComponentMenuItems}
        disableTitleGutters={true}
      />
    </div>
  );
}

export default connect(
  null,
  null
)(VerifyAccounts);
