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
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
        malesuada lacus ex, sit amet blandit leo lobortis eget.
      </AccordionDetails>
      <AccordionActions>
        <Button>Cancel</Button>
        <Button>Agree</Button>
      </AccordionActions>
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
