import type { PastMatch } from "../types";

type MatchHistoryProps = {
  matches: PastMatch[];
};

export default function MatchHistoryList({ matches }: MatchHistoryProps) {
  return (
    <section className="profile-section">
      <h2>Match History</h2>

      <div className="profile-card-list">
        {matches.map((match) => (
          <div key={match.id} className="profile-card">
            <p className="profile-label">{match.topic}</p>
            <p className="profile-value">Level: {match.level}</p>
            <p className="profile-value">Result: {match.result}</p>
            <p>
              {match.result === "Won" ? "Won" : "Lost"} vs {match.opponent}
            </p>
            <p className="profile-muted">{match.completedOn}</p>
          </div>
        ))}
      </div>
    </section>
  );
}