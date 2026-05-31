import type { PastMatch } from "../types";

type MatchHistoryProps = {
    matches: PastMatch[];
};

export default function MatchHistoryList ({
    matches,
}: MatchHistoryProps) {
    return (
        <section className="border bg-white p-7 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <h2 className ="text-xl font-bold"> Match History </h2>

            <div className="mt-4 space-y-3">
                {matches.map((match) => (
                    <div
                        key={match.id}
                        className="border p-4 dark:border-gray-700"
                    >
                        <p className="font-semibold">
                            {match.topic}
                        </p>

                        <p>
                            Level: {match.level}
                        </p>

                        <p>
                            Result: {match.result}
                        </p>

                        <p className="text-sm text-gray-500">
                            {match.completedOn}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    )
}