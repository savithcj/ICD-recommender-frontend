/* eslint-disable no-script-url */

import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Title from "./Title";
import * as APIUtility from "../../Util/API";

const useStyles = makeStyles(() => ({
  table: {
    alignItems: "center"
  },
  stats: {
    height: "96%",
    width: "96%",
    backgroundColor: "inherit",
    padding: "2%",
    overflow: "auto"
  }
}));

function numberWithCommas(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function DADStats() {
  const styles = useStyles();
  const [statRows, setStatRows] = useState([]);
  const [topRows, setTopRows] = useState([]);

  useEffect(() => {
    APIUtility.API.makeAPICall(APIUtility.STATS, null)
      .then(response => response.json())
      .then(results => {
        const numUnique = results.numUnique;
        const totalNum = results.totalNumber;
        const topTen = results.Top10;

        setStatRows([
          { id: 1, statistic: "Total number of codes entered", value: numberWithCommas(totalNum) },
          { id: 0, statistic: "Number of unique codes", value: numberWithCommas(numUnique) }
        ]);

        let topRows = [];
        topTen.forEach(element => {
          topRows.push({
            code: element.code,
            description: element.description,
            times_coded: numberWithCommas(element.times_coded)
          });
        });

        setTopRows(topRows);
      });
  }, []);

  return (
    <div className={styles.stats}>
      <Title>2004-2015 DAD Statistics</Title>
      <Table size="small" className={styles.table}>
        <TableHead>
          <TableRow>
            <TableCell>Statistic</TableCell>
            <TableCell>Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {statRows.map(row => (
            <TableRow key={row.id}>
              <TableCell>{row.statistic}</TableCell>
              <TableCell>{row.value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <br />
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Top 10 Codes</TableCell>
            <TableCell>Code Description</TableCell>
            <TableCell>Times coded</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {topRows.map(row => (
            <TableRow key={row.code}>
              <TableCell>{row.code}</TableCell>
              <TableCell>{row.description}</TableCell>
              <TableCell>{row.times_coded}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
