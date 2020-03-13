var Request = require("request");
const path = require('path');
const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static('static'));

app.use(function (req, res, next){
    console.log("HTTP request", req.method, req.url, req.body);
    next();
});

app.get('/api/recipes/:ingredients/', function (req, res, next) {
	 //var message = new Message(req.body);
	 console.log(req.body);
	 console.log(req.params.ingredients);

 	Request.get("https://api.spoonacular.com/recipes/search?apiKey=ee29c579c7af4db59e00ba30158a11a9&query=" + req.params.ingredients, (error, response, body) => {
	     if(error) {
	         return console.dir(error);
	     }
		 //console.log(body);
	     //console.dir(JSON.parse(body));
		 //console.log(getsource(body.results[0].id));
		 console.log(body);
		 return res.json(body);
	 });
});

app.get('/api/recipes/instructions/', function (req, res, next) {
	 //var message = new Message(req.body);
	 console.log(req.body);
	 console.log(req.body.ingredient);
 Request.get("https://api.spoonacular.com/recipes/" + req.body.recipeid + "/information?apiKey=ee29c579c7af4db59e00ba30158a11a9&query=" + req.body.ingredient, (error, response, body) => {
	     if(error) {
	         return console.dir(error);
	     }
		 console.log(JSON.parse(body).summary);
		 console.log(JSON.parse(body).extendedIngredients);
		 
		 
		 //console.log(body);
	     //console.dir(JSON.parse(body));
		// console.log(getsource(body.results[0].id));
		 return res.json(body);
		 
	 });
});


const http = require('http');
const PORT = 5000;

http.createServer(app).listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTP server on http://localhost:%s", PORT);
});