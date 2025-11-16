// Utility functions for match details stats
export function getBattingStats(players, balls, team) {
  // Returns array of { name, runs, balls, outBy, extras }
  return players.filter(p => p.team === team).map(player => {
    let runs = 0, ballsFaced = 0, outBy = null, extras = 0;
    balls.forEach(ball => {
      if (ball.striker === player.id) {
        if (ball.extras === 'none' || ball.extras === 'no-ball') runs += ball.runs;
        if (ball.extras !== 'wide' && ball.extras !== 'no-ball') ballsFaced++;
        if (ball.isWicket) outBy = ball.bowler;
        if (ball.extras !== 'none') extras += ball.runs;
      }
    });
    return {
      name: player.name,
      runs,
      balls: ballsFaced,
      outBy,
      extras
    };
  });
}

export function getBowlingStats(players, balls, team) {
  // Returns array of { name, runsGiven, wickets, balls }
  return players.filter(p => p.team === team).map(player => {
    let runsGiven = 0, wickets = 0, ballsBowled = 0;
    balls.forEach(ball => {
      if (ball.bowler === player.id) {
        runsGiven += ball.runs;
        if (ball.extras !== 'none') runsGiven += 0; // extras already in runs
        if (ball.isWicket) wickets++;
        if (ball.extras !== 'wide' && ball.extras !== 'no-ball') ballsBowled++;
      }
    });
    return {
      name: player.name,
      runsGiven,
      wickets,
      balls: ballsBowled
    };
  });
}

export function getTeamExtras(balls, teamPlayers) {
  // Sum extras for a team
  let extras = 0;
  balls.forEach(ball => {
    if (teamPlayers.some(p => p.id === ball.striker) && ball.extras !== 'none') {
      extras += ball.runs;
    }
  });
  return extras;
}
