import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Accordion from "@mui/material/Accordion";
import AccordionActions from "@mui/material/AccordionActions";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { SvgIcon } from "@mui/material";

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

function EntryCard({ entry }) {
  const e = entry as Entry;

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <div style={{ flexDirection: "column" }}>
          <Typography color={e.dc_progress === 100.0 || e.ez ? "#4CAF50" : ""}>
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
      {data.map((a, i) => (
        <Box key={a.address} sx={{ p: 1 }}>
          <EntryCard entry={a} />
        </Box>
      ))}
    </Box>
  );
}
