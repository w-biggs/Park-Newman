const data = require('./wl.json');

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
  data[team].wins.forEach(opp => {
    score += a;
    score += winScore(opp, newA, baseA);
  })
  return round(score,4);
}

const lossScore = (team, a, baseA) => {
  if(a < 0.0001){
    return 0;
  }
  let score = 0;
  const newA = round(a*baseA,4);
  data[team].losses.forEach(opp => {
    score -= a;
    score -= lossScore(opp, newA, baseA);
  })
  return round(score,4);
}

Object.keys(data).forEach(team => {
  /**
  * In their paper, Park and Newman have a complex process using eigenvalues or something
  * to find the optimal value for *a*. But that value hovers around 0.2 for every year they
  * tested, so I'm gonna just use 0.2.
  */
  const w = winScore(team, 1, 0.2);
  const l = lossScore(team, 1, 0.2);
  const wl = round(w + l, 4);
  console.log(team, wl);
})