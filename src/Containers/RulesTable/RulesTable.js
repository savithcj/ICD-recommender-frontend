import React, { useEffect, useState } from "react";
import ReactTable from "react-table";
import "react-table/react-table.css";
import "./CustomStyle.css";

import * as APIUtility from "../../Util/API";

export default function SortableTable() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const url = APIUtility.API.getAPIURL(APIUtility.RULES) + "?format=json";

    fetch(url)
      .then(response => response.json())
      .then(results => {
        results.forEach(ruleObject => {
          ruleObject.rule = ruleObject.lhs + " \u2192 " + ruleObject.rhs;
          ruleObject.confidence = ruleObject.confidence.toFixed(4);
          ruleObject.support = ruleObject.support.toFixed(4);
        });
        setData(results);
      });
  }, []);

  const columns = [
    {
      Header: "Rule",
      accessor: "rule"
    },
    {
      Header: "Suggested",
      accessor: "num_suggested"
    },
    {
      Header: "Accepted",
      accessor: "num_accepted"
    },
    {
      Header: "Rejected",
      accessor: "num_rejected"
    },
    {
      Header: "Confidence",
      accessor: "confidence"
    },
    {
      Header: "Support",
      accessor: "support"
    }
  ];

  return (
    <ReactTable
      className="-striped -highlight"
      data={data}
      columns={columns}
      style={{
        width: "100%",
        height: "100%",
        fontSize: "13px"
      }}
      defaultSorted={[
        {
          id: "num_suggested",
          desc: true
        }
      ]}
    />
  );
}
