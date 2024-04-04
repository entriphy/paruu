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
              {e.implemented ? `Implemented in: ${e.source_file}${!e.matching ? " (Not matching)" : ""}` : "Not implemented"}
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

  const handleChange = (event: SelectChangeEvent) => {
    setFilter(event.target.value as string);
  };

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
    <Box sx={{ px: { xl: 64 } }}>
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
          <MenuItem value={"implemented+not_matching"}>Implemented + Not Matching</MenuItem>
        </Select>
      </FormControl>
      {data
        .filter((v, _, __) => {
          switch (filter) {
            case "all":
              return true;
            case "matching":
              return isMatching(v);
            case "not_matching":
              return !isMatching(v);
            case "implemented":
              return v.implemented;
            case "not_implemented":
              return !v.implemented;
            case "implemented+not_matching":
                return v.implemented && !v.matching;
          }
        })
        .map((a, i) => (
          <Box key={a.address} sx={{ p: 1 }}>
            <EntryCard entry={a} />
          </Box>
        ))}
    </Box>
  );
}
