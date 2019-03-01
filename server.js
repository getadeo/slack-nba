let express = require('express');
let bodyParser = require('body-parser');
let request = require('request');
let moment = require('moment');

let app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let nbaAPIURL = "http://data.nba.net/10s"

app.get('/', function (req, res) {
  res.send('hello world');
});


app.post('/v1/nba', function (req, res) {
  console.log(req.body);
  let today = new Date();
  today = moment(today).subtract(16, 'hours').format('YYYYMMDD')
  if (req.body.text === 'scoreboard') {

    let todayEndpoint = nbaAPIURL + "/prod/v1/today.json";
    let todayObject = {};
    let scoreBoardEndpoint = "";
    request(todayEndpoint, function(error, response, body) {
      console.log('Fetching todays game details');
      console.log('request endpoint: ', todayEndpoint);
      console.log('error: ', error);
      console.log('statusCode: ', response && response.statusCode);

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
    })

    console.log('Scoreboard');
    console.log(scoreBoardEndpoint);
    // let scoreBoardEndpoint = nbaAPIURL + today + "/scoreboard.json";

  }
});

app.listen(port, () => console.log(`Server listening on port ${port}`));

