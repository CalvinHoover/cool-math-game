"use client";

import { useEffect, useState } from "react";
import { getPastOpponents } from "./api";
import type { PastOpponent } from "./types";

export default function PastOpponents() {
  const [opponents, setOpponents] = useState<PastOpponent[]>([]);
  useEffect(() => {
    async function loadPastOpponents() {
      const data = await getPastOpponents();
      setOpponents(data);
    }
    loadPastOpponents();
  }, []);

  return (
    <section>
      <h2>Previous Opponents</h2>

      {opponents.map((opponent) => (
        <div key={opponent.profile.id}>
          <h3>{opponent.profile.username}</h3>
          <p>@{opponent.profile.id}</p>
          <p>Result: {opponent.result}</p>
        </div>
      ))}
    </section>
  );
}