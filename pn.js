const teams = require('./teams.json');
const data = require('./games.json');
const fs = require('fs');

const results = [];

// Avoid floating point errors
const round = (input, places) => {
  return Number(Number(input).toFixed(places));
}

const winScore = (team, a, baseA) => {
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
        gameScore += winScore(game.home.name, newA, baseA);
      } else {
        return 0;
      }
    } else if (hScore > aScore){
      if(game.home.name === team){
        gameScore += a;
        gameScore += winScore(game.away.name, newA, baseA);
      } else {
        return 0;
      }
    } else {
      return 0;
    }
    // weight by game length as well
    gameScore *= game.gameLength / 1680;
    score += gameScore; 
  });
  return round(score,4);
}

const lossScore = (team, a, baseA) => {
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
        gameScore += lossScore(game.away.name, newA, baseA);
      } else {
        return 0;
      }
    } else if (hScore > aScore){
      if(game.away.name === team){
        gameScore -= a;
        gameScore += lossScore(game.home.name, newA, baseA);
      } else {
        return 0;
      }
    } else {
      return 0;
    }
    // weight by game length as well
    gameScore *= game.gameLength / 1680;
    score += gameScore; 
  });
  //console.log(score);
  return round(score,4);
}

const sortGames = (a,b) => {
  if(a[1] === b[1]){
    return 0;
  } else {
    return (a[1] > b[1]) ? -1 : 1;
  }
}

teams.fcs.forEach(team => {
  /**
  * In their paper, Park and Newman have a complex process using eigenvalues or something
  * to find the optimal value for *a*. But that value hovers around 0.2 for every year they
  * tested, so I'm gonna just use 0.2.
  */
  const w = winScore(team, 1, 0.2);
  const l = lossScore(team, 1, 0.2);
  const wl = round(w + l, 4);
  results.push([team,wl]);
})

results.sort(sortGames);

results.forEach((result, index) => {
  result[2] = index + 1;
})

fs.writeFile("./results.csv", results.map(result => {return result.join()}).join("\n"), err => {
  if(err){
    console.log(err);
  } else {
    console.log("./results.csv has successfully been written.");
  }
});