/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';



export const Finish: React.FC<any> = ({ teamScores, teams, onStartGame, }) => {
    const winner = teamScores.team1 > teamScores.team2 ? 'Team 1' : 'Team 2';
    const isDraw = teamScores.team1 === teamScores.team2;
    const winningTeam = teamScores.team1 > teamScores.team2 ? teams.team1 : teams.team2;

    const handleStartGame = () => {


        onStartGame();

    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">

            <div className="bg-white p-6 rounded-lg shadow-md w-96 text-center">
                <h2 className="text-xl font-semibold mb-2">Final Scores</h2>
                <p className="text-lg">Team 1: <span className="font-bold">{teamScores.team1}</span></p>
                <p className="text-lg">Team 2: <span className="font-bold">{teamScores.team2}</span></p>
                {isDraw ? (
                    <p className="text-blue-500 font-bold text-xl mt-4">It's a Draw!</p>
                ) : (
                    <div className="mt-4">
                        <p className="text-green-500 font-bold text-xl">{winner} Wins!</p>
                        <h3 className="text-lg font-semibold mt-2">Winning Team Players:</h3>
                        <ul className="list-disc list-inside">
                            {winningTeam.map((player: { name: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }, index: React.Key | null | undefined) => (
                                <li key={index} className="text-gray-700">{player.name}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            <button
                onClick={handleStartGame}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
            >
                Jogar novamente
            </button>
        </div>
    );
};
