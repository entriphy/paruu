import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import CardMedia from "@mui/material/CardMedia";
import LinearProgress from "@mui/material/LinearProgress";

interface Game {
  id: string;
  title: string;
  description: string;
  decomp: number;
  total: number;
  sections: { [sectionId: string]: string };
}

function GameCard({ game }) {
  const g = game as Game;
  const progress = g.total === 0 ? 0.0 : (g.decomp / g.total) * 100.0;

  return (
    <Card>
      <CardMedia sx={{ height: 200 }} image={`/img/games/${game.id}.png`} />
      <CardContent>
        <Typography variant="h5" component="div">
          {g.title}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          {g.description}
        </Typography>
        <Typography noWrap variant="body2">
          {g.decomp}/{g.total} ({progress.toFixed(2)}%) functions decompiled
        </Typography>
        <LinearProgress
          variant="determinate"
          value={progress}
          color="success"
          sx={{ backgroundColor: "red" }}
        />
      </CardContent>
      <CardActions>
        <Button
          disabled={g.total === 0}
          href={`/sections/${g.id}`}
          size="small"
        >
          View Progress
        </Button>
      </CardActions>
    </Card>
  );
}

export default function GamesList() {
  const [data, setData] = useState<Game[]>([]);
  const [error, setError] = useState<string>();
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/game`)
      .then(async (res) => {
        const json = await res.json();
        setData(json);
        setIsDataLoaded(true);
      })
      .catch(async (err) => {
        console.error(err);
        setError(err);
        setIsDataLoaded(true);
      });
  }, []);

  if (!isDataLoaded) {
    return <CircularProgress />;
  }

  if (error !== undefined) {
    return <Typography>Error: {error.toString()}</Typography>;
  }

  if (data.length === 0) {
    return <Typography>No games found.</Typography>;
  }

  return (
    <Grid container spacing={2}>
      {data.map((a, i) => (
        <Grid item xs={12} sm={12} md={6} key={a.id}>
          <GameCard game={a} />
        </Grid>
      ))}
    </Grid>
  );
}
