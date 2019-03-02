let express = require('express');
let bodyParser = require('body-parser');
let request = require('request');

let app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let nbaAPIURL = "http://data.nba.net/10s"

app.get('/', function (req, res) {
  res.send('hello world');
});


function buildTeamsObject(teams) {
  let teamObject = {}
  for (let team of teams) {
    teamObject[team.teamId] = team.tricode;
  }
  return teamObject
};

function buildStandingsObject(teams, standings) {
  let standingsObject = {
    "text": `Standings:`,
    "attachments": [
      {
        "text": ""
      }
    ]
  }
  standingsObject.attachments[0].text += "Eastern Conference:\n\n"
  for (let [i, east] of standings.east.entries()) {
    standingsObject.attachments[0].text += `${i+1} ${teams[east.teamId]} (${east.win}-${east.loss})\n`
  }
  standingsObject.attachments[0].text += "\n\nWestern Conference:\n\n"
  for (let [i, west] of standings.west.entries()) {
    standingsObject.attachments[0].text += `${i+1} ${teams[west.teamId]} (${west.win}-${west.loss})\n`
  }
  return standingsObject;
};


app.post('/v1/nba', function (req, res) {

  let todayEndpoint = nbaAPIURL + "/prod/v1/today.json";
  request(todayEndpoint, function (error, response, body) {
    console.log('Fetching todays game details');
    console.log('request endpoint: ', todayEndpoint);
    console.log('error: ', error);
    console.log('statusCode: ', response && response.statusCode);
    let todayObject = {};

    if (req.body.text === 'scoreboard') {
      let scoreBoardEndpoint = "";
        if (response.statusCode === 200){
          todayObject = JSON.parse(body);
          scoreBoardEndpoint = nbaAPIURL + todayObject.links.currentScoreboard;
          request(scoreBoardEndpoint, function (error, response, body) {
            console.log('request endpoint: ', scoreBoardEndpoint)
            console.log('error: ', error);
            console.log('statusCode: ', response && response.statusCode);

            let scoreBoardResponse = {
              "text": `Gameday: ${todayObject.links.currentDate}`,
              "attachments": [
                {
                  "text": ""
                }
              ]
            }
            if (response.statusCode === 200) {
              let gamesObject = JSON.parse(body);
              for (let game of gamesObject.games) {
                scoreBoardResponse.attachments[0].text += `${game.vTeam.score} ${game.vTeam.triCode} (${game.vTeam.win}-${game.vTeam.win}) VS ${game.hTeam.score} ${game.hTeam.triCode} (${game.hTeam.win}-${game.hTeam.win})\n`;
              }
              console.log('scoreboard: \n', scoreBoardResponse);
              res.statusCode = 200;
              return res.json(scoreBoardResponse);
            }
          })
        }
    } else if (req.body.text === 'standings') {
      let teamsEndpoint = nbaAPIURL + "/prod/v2/2018/teams.json"
      request(teamsEndpoint, function (error, response, body) {
        if (response.statusCode === 200) {
          let teams = JSON.parse(body);
          teams = buildTeamsObject(teams.league.standard);
          let standingsEndpoint = nbaAPIURL + "/prod/v1/current/standings_conference.json"
          request(standingsEndpoint, function (error, response, body) {
            if (response.statusCode === 200) {
              let standings = JSON.parse(body);
              standings = standings.league.standard.conference;
              standings = buildStandingsObject(teams, standings);
              console.log(standings);
              res.statusCode = 200;
              return res.json(standings);
            }
          })
        }
      });
    } else {
      return res.send({
        "text" : "Command not found."
      })
    }
  })
});

app.listen(port, () => console.log(`Server listening on port ${port}`));

