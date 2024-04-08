import React, { useEffect, useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionActions from "@mui/material/AccordionActions";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Link from "@mui/material/Link";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import Table from "@mui/material/Table";
import TableRow from "@mui/material/TableRow";
import TableBody from "@mui/material/TableBody";

interface Entry {
  address: number;
  game_id: string;
  section: string | null;
  name: string | null;
  implemented: boolean;
  matching: boolean;
  ez: boolean;
  note: string | null;
  dc_id: string | null;
  dc_progress: number | null;
  source_file: string | null;
}

const isMatching = (entry: Entry) => entry.dc_progress == 100.0 || entry.ez;

function EntryCard({ entry }) {
  const e = entry as Entry;

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <div style={{ flexDirection: "column" }}>
          <Typography color={isMatching(e) ? "success.main" : ""}>
            {e.name !== null
              ? e.name
              : `func_${e.address.toString(16).padStart(8, "0").toUpperCase()}`}
          </Typography>
          <Typography variant="caption">
            0x{e.address.toString(16).padStart(8, "0").toUpperCase()}
          </Typography>
        </div>
      </AccordionSummary>
      <AccordionDetails>
        <ul>
          <li>
            <Typography
              color={
                e.implemented && e.matching ? "success.main" : "error.main"
              }
            >
              {/* TODO: Add link to source file (have to fetch /game first?) */}
              {e.implemented
                ? `Implemented in: ${e.source_file}${!e.matching ? " (Not matching)" : ""}`
                : "Not implemented"}
            </Typography>
          </li>
          {/* TODO: Implement proper crediting */}
          {e.ez && (
            <li>
              Marked as EZ by{" "}
              <Link href="https://github.com/entriphy">entriphy</Link>
            </li>
          )}
          {e.dc_id !== null && (
            <li>
              decomp.me Scratch:{" "}
              <Link
                href={`https://decomp.me/scratch/${e.dc_id}`}
              >{`https://decomp.me/scratch/${e.dc_id}`}</Link>{" "}
              ({e.dc_progress?.toFixed(2)}%)
            </li>
          )}
        </ul>
      </AccordionDetails>
      {/* <AccordionActions>
        <Button>Cancel</Button>
        <Button>Agree</Button>
      </AccordionActions> */}
    </Accordion>
  );
}

export default function EntryList({ gameId, section }) {
  const g = gameId as string;
  const s = section as string;
  const [data, setData] = useState<Entry[]>([]);
  const [isDataLoaded, setIsDataLoaded] = React.useState(false);
  const [filter, setFilter] = React.useState("all");
  const [tableView, setTableView] = React.useState(false);

  const handleChange = (event: SelectChangeEvent) => {
    setFilter(event.target.value as string);
  };

  const entryFilter = (e: Entry) => {
    switch (filter) {
      case "all":
        return true;
      case "matching":
        return isMatching(e);
      case "not_matching":
        return !isMatching(e);
      case "implemented":
        return e.implemented;
      case "not_implemented":
        return !e.implemented;
      case "implemented+not_matching":
        return e.implemented && !e.matching;
    }
  }

  useEffect(() => {
    fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/entry/${g}/${s}`,
    ).then(async (res) => {
      const json = await res.json();
      setData(json);
      setIsDataLoaded(true);
    });
  }, []);

  if (!isDataLoaded) {
    return <CircularProgress />;
  }

  if (data.length === 0) {
    return <Typography>No entries found.</Typography>;
  }

  return (
    <Box sx={{ px: { xl: !tableView ? 64 : 16 } }}>
      <FormControl>
        <InputLabel id="demo-simple-select-label">Filter</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={filter}
          label="Filter"
          onChange={handleChange}
        >
          <MenuItem value={"all"}>All</MenuItem>
          <MenuItem value={"matching"}>Matching</MenuItem>
          <MenuItem value={"not_matching"}>Not Matching</MenuItem>
          <MenuItem value={"implemented"}>Implemented</MenuItem>
          <MenuItem value={"not_implemented"}>Not Implemented</MenuItem>
          <MenuItem value={"implemented+not_matching"}>
            Implemented + Not Matching
          </MenuItem>
        </Select>
        <FormControlLabel
          control={
            <Checkbox
              checked={tableView}
              onChange={(e) => setTableView(e.target.checked)}
            />
          }
          label="Table view"
        />
      </FormControl>
      {!tableView &&
        data
          .filter((v, _, __) => entryFilter(v))
          .map((a, i) => (
            <Box key={a.address} sx={{ p: 1 }}>
              <EntryCard entry={a} />
            </Box>
          ))}
      {tableView && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Address</TableCell>
                <TableCell>Name</TableCell>
                <TableCell align="center">Implemented</TableCell>
                <TableCell align="center">Matching</TableCell>
                <TableCell align="center">EZ</TableCell>
                <TableCell>Source File</TableCell>
                <TableCell>Decomp.me Scratch</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data
                .filter((v, _, __) => entryFilter(v))
                .map((e, i) => (
                  <TableRow key={e.address}>
                    <TableCell>
                      0x{e.address.toString(16).padStart(8, "0").toUpperCase()}
                    </TableCell>
                    <TableCell>{e.name !== null && e.name}</TableCell>
                    {/* TODO: Implement checkbox for project admins */}
                    <TableCell align="center">
                      <Checkbox disabled checked={e.implemented}></Checkbox>
                    </TableCell>
                    <TableCell align="center">
                      <Checkbox disabled checked={e.matching}></Checkbox>
                    </TableCell>
                    <TableCell align="center">
                      {/* <CircularProgress size="2rem" /> */}
                      <Checkbox disabled checked={e.ez}></Checkbox>
                    </TableCell>
                    <TableCell>
                      {e.source_file !== null && e.source_file}
                    </TableCell>
                    <TableCell>
                      {e.dc_id !== null && (
                        <>
                          <Link href={`https://decomp.me/scratch/${e.dc_id}`}>
                            {e.dc_id}
                          </Link>{" "}
                          ({e.dc_progress?.toFixed(2)}%)
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
