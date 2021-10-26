var express = require('express');
var axios = require('axios');
var redis = require('redis');

var app = express();

var client = redis.createClient(6379);

client.on('error', (err) => {
  console.log(err);
});

starwarsURL = "https://swapi.dev/api/";

app.get('/', (req, res) => {
  res.send('<h2>Caching StarWars Api</h2>')
});
var checkCache = (req, res, next) => {
  let category = req.params.category;
  let number = req.params.number;
  client.get(`${category}/${number}`, async (err, data) =>  {
    if(err) throw err;
    if(!data) return next();
    res.json({info : JSON.parse(data), status : "retrieved from cache memory"})
  })
}

app.get('/info/:category/:number', checkCache, async (req, res) => {
  let category = req.params.category;
  let number = req.params.number;
  var info =  await axios.get(starwarsURL +`${category}/` +`${number}`);
  client.SETEX(`${category}/${number}`,300, JSON.stringify(info.data));
  res.json({info : info.data, status : "retrieved from starwars API"});
});

app.listen(3000, () => console.log('Server listening on port 3k!'));