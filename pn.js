const teams = require('./teams.json');
const data = require('./games.json');

// Avoid floating point errors
const round = (input, places) => {
  return Number(Number(input).toFixed(places));
}

const winScore = (team, a, baseA, b) => {
  if(a < 0.0001){
    return 0;
  }
  let score = 0;
  const newA = round(a*baseA,4);
  data.games.forEach(game => {
    const hScore = Number(game.home.score);
    const aScore = Number(game.away.score);
    let gameScore = 0;
    if(aScore > hScore){
      if(game.away.name === team){
        gameScore += a;
        gameScore += winScore(game.home.name, newA, baseA, b);
      } else {
        return 0;
      }
    } else if (hScore > aScore){
      if(game.home.name === team){
        gameScore += a;
        gameScore += winScore(game.away.name, newA, baseA, b);
      } else {
        return 0;
      }
    } else {
      return 0;
    }
    score += gameScore * Math.exp(-b * (data.currentWeek - game.week)); 
  });
  return round(score,4);
}

const lossScore = (team, a, baseA, b) => {
  if(a < 0.0001){
    return 0;
  }
  let score = 0;
  const newA = round(a*baseA,4);
  data.games.forEach(game => {
    const hScore = Number(game.home.score);
    const aScore = Number(game.away.score);
    let gameScore = 0;
    if(aScore > hScore){
      if(game.home.name === team){
        gameScore -= a;
        gameScore += lossScore(game.away.name, newA, baseA, b);
      } else {
        return 0;
      }
    } else if (hScore > aScore){
      if(game.away.name === team){
        gameScore -= a;
        gameScore += lossScore(game.home.name, newA, baseA, b);
      } else {
        return 0;
      }
    } else {
      return 0;
    }
    score += gameScore * Math.exp(-b * (data.currentWeek - game.week)); 
  });
  //console.log(score);
  return round(score,4);
}

teams.fcs.forEach(team => {
  /**
  * In their paper, Park and Newman have a complex process using eigenvalues or something
  * to find the optimal value for *a*. But that value hovers around 0.2 for every year they
  * tested, so I'm gonna just use 0.2.
  */
  const w = winScore(team, 1, 0.2, 1/data.seasonLength);
  const l = lossScore(team, 1, 0.2, 1/data.seasonLength);
  const wl = round(w + l, 4);

})