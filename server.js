let express = require('express');
let bodyParser = require('body-parser');
let request = require('request');
let moment = require('moment');

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let nbaAPIURL = "http://data.nba.net/10s/prod/v1/"

app.get('/', function (req, res) {
  res.send('hello world');
});

app.post('/v1/nba', function (req, res) {
  console.log(req.body);
  let today = new Date();
  today = moment(today).subtract(16, 'hours').format('YYYYMMDD')
  if (req.body.text === 'scoreboard') {
    console.log('Scoreboard');
    let scoreBoardEndpoint = nbaAPIURL + today + "/scoreboard.json";
    request(scoreBoardEndpoint, function(error, response, body) {
      console.log('request endpoint: ', scoreBoardEndpoint)
      console.log('error: ', error);
      console.log('statusCode: ', response && response.statusCode);
      let scoreBoard = ""
      if (response.statusCode === 200) {
        let gamesObject = JSON.parse(body);
        for (let game of gamesObject.games ){
          scoreBoard += `${game.vTeam.score} ${game.vTeam.triCode} (${game.vTeam.win}-${game.vTeam.win}) VS ${game.hTeam.score} ${game.hTeam.triCode} (${game.hTeam.win}-${game.hTeam.win})\n`;
        }
        console.log('scoreboard: \n', scoreBoard);
        res.statusCode = 200;
        return res.send(scoreBoard);
      }
    })
  }
});

app.listen(3000);

