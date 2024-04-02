import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import CircularProgress from "@mui/material/CircularProgress";

interface Section {
  id: string;
  game_id: string;
  name: string;
  description: string;
  decomp: number;
  total: number;
};

function SectionCard({ game_id, section }) {
  const g = game_id as string;
  const s = section as Section;
  const progress = (s.decomp / s.total) * 100.0;

  return (
    <Card>
      <CardContent>
        <Typography noWrap variant="h5" component="div">
          {s.name}
        </Typography>
        <Typography noWrap sx={{ mb: 1.5 }} color="text.secondary">
          {s.description}
        </Typography>
        <Typography noWrap variant="body2">
          {s.decomp}/{s.total} (
          {progress.toFixed(2)}%)
          functions decompiled
        </Typography>
        <LinearProgress
          variant="determinate"
          value={progress}
          color="success"
          sx={{backgroundColor: "red"}}
        />
      </CardContent>
      <CardActions>
        <Button href={`/entries/${g}/${s.id}`} size="small">View entries</Button>
      </CardActions>
    </Card>
  );
}

export default function SectionList({ gameId }) {
  const g = gameId as string;
  const [data, setData] = useState<Section[]>([]);
  const [isDataLoaded, setIsDataLoaded] = React.useState(false);
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/section/${g}`)
      .then(async (res) => {
        const json = await res.json();
        setData(json);
        setIsDataLoaded(true);
      });
  }, []);

  if (!isDataLoaded) {
    return (
      <CircularProgress />
    )
  }

  if (data.length === 0) {
    return (
      <Typography>No sections found.</Typography>
    );
  }

  return (
    <Grid container spacing={2}>
      {data.map((a, i) => (
        <Grid item xs={12} sm={6} md={3} key={a.name}>
          <SectionCard game_id={gameId} section={a} />
        </Grid>
      ))}
    </Grid>
  );
}
