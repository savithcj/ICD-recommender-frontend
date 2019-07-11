/* eslint-disable no-script-url */

import React from "react";
import Link from "@material-ui/core/Link";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Title from "./Title";

// Generate Order Data
function createData(id, date, name, shipTo, paymentMethod, amount) {
  return { id, date, name, shipTo, paymentMethod, amount };
}

const rows = [
  createData(0, "16 Mar, 2019", "Elvis Presley", "Tupelo, MS", "VISA ⠀•••• 3719", 312.44),
  createData(1, "16 Mar, 2019", "Paul McCartney", "London, UK", "VISA ⠀•••• 2574", 866.99),
  createData(2, "16 Mar, 2019", "Tom Scholz", "Boston, MA", "MC ⠀•••• 1253", 100.81),
  createData(3, "16 Mar, 2019", "Michael Jackson", "Gary, IN", "AMEX ⠀•••• 2000", 654.39),
  createData(4, "15 Mar, 2019", "Bruce Springsteen", "Long Branch, NJ", "VISA ⠀•••• 5919", 212.79)
];

export default function Orders() {
  return (
    <React.Fragment>
      <Title>2004-2015 DAD Statistics</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Statistic</TableCell>
            <TableCell>Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(row => (
            <TableRow key={row.id}>
              <TableCell>{row.date}</TableCell>
              <TableCell>{row.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <br />
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Top 10 Codes</TableCell>
            <TableCell>Times coded</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(row => (
            <TableRow key={row.id}>
              <TableCell>{row.date}</TableCell>
              <TableCell>{row.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </React.Fragment>
  );
}
