import "./App.css";
import TopAppBar from "./components/TopAppBar.tsx";
import React from "react";
import { Box } from "@mui/material";
import GamesList from "./components/GamesList.tsx";
import SectionList from "./components/SectionsList.tsx";
import { useParams } from "react-router-dom";
import EntryList from "./components/EntryList.tsx";

export function Games() {
  return (
    <>
      <TopAppBar />
      <Box sx={{ p: 2 }}>
        <GamesList />
      </Box>
    </>
  );
}

export function Sections() {
  let { gameId } = useParams();

  return (
    <>
      <TopAppBar />
      <Box sx={{ p: 2 }}>
        <SectionList gameId={gameId} />
      </Box>
    </>
  );
}

export function Entries() {
  let { gameId, section } = useParams();

  return (
    <>
      <TopAppBar />
      <Box sx={{ p: 2 }}>
        <EntryList gameId={gameId} section={section} />
      </Box>
    </>
  );
}

