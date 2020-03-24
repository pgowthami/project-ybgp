var Request = require("request");
const path = require('path');
const express = require('express');
const app = express();
const bcrypt = require('bcrypt');

var mongo = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const cookie = require('cookie');

app.use(express.static('static'));

const session = require('express-session');
app.use(session({
    secret: 'please change this secret',
    resave: false,
    saveUninitialized: true,
}));

app.use(function (req, res, next){
    req.username = req.session.username;
    console.log("HTTP request", req.method, req.url, req.body);
    next();
});

let isAuthenticated = function(req, res, next) {
    if (req.username) return true;
    else return false;
};

app.post('/signup/', function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
	bcrypt.genSalt(10, function(err, salt) {
    	bcrypt.hash(password, salt, function(err, hash) {
			MongoClient.connect(url, function(err, db) {
				  if (err) throw err;
				  var dbo = db.db("mydb");
				  dbo.collection("users").find({ _id: username}).toArray(function(err, user) {
				      if (err) throw err;				   
					  if (user.length > 0) return res.status(409).end("username " + username + " already exists");
					  dbo.collection("users").insertOne({_id: username, hash}, function(err, result) {
					  	if (err) return res.status(500).end("internal server error");
				    	console.log("1 user inserted");
						console.log(result.username);
				
		            	res.setHeader('Set-Cookie', cookie.serialize('username', username, {
		                  	path : '/', 
		                  	maxAge: 60 * 60 * 24 * 7
		            	}));
					 	req.session.username = username; 
		            	return res.json("user " + username + " signed up");
				    	db.close();
					  	});          
				  	});
				});
		});
	});
});

app.post('/signin/', function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		var dbo = db.db("mydb");
		dbo.collection("users").find({ _id: username}).toArray(function(err, result) {
			if (err) throw err;
		  	if(!result.length > 0) {
			  	return res.status(409).end("username does not exist");
		 	} 
			bcrypt.compare(password, result[0].hash, function(err, valid) {
				if (err) return res.status(500).end(err);
		    	if (!valid) return res.status(401).end("incorrect password. access denied");
		  		//signed in
	   			req.session.username = username; 
	    		res.setHeader('Set-Cookie', cookie.serialize('username', username, {
	          		path : '/', 
	          		maxAge: 60 * 60 * 24 * 7
	    		}));
	    		return res.json("user " + username + " signed in");
			});
			db.close();
		});
	});
});
// curl -b cookie.txt -c cookie.txt localhost:3000/signout/
app.post('/signout/', function (req, res, next) {
    res.setHeader('Set-Cookie', cookie.serialize('username', '', {
          path : '/', 
          maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
    }));
    req.session.destroy();
    res.redirect('/');
});


let apiKey = 'b5f04b0b394e4a6eb1d3d0157c4abaa1';
app.get('/api/recipes/:ingredients/', function (req, res, next) {
	 console.log(req.body);
	 console.log(req.params.ingredients);

 	Request.get("https://api.spoonacular.com/recipes/search?apiKey="+apiKey+"&query=" + req.params.ingredients, (error, response, body) => {
	     if(error) {
	         return console.dir(error);
	     }
		 return res.json(body);
	 });
});

app.get('/api/instructions/:recipeId/', function (req, res, next) {	
 	Request.get("https://api.spoonacular.com/recipes/" + req.params.recipeId + "/analyzedInstructions?apiKey="+apiKey, (error, response, body) => {
	     if(error) {
	         return console.dir(error);
	     }
		 return res.json(body);
		 
	 });
});

app.get('/api/ingredients/:id/', function (req, res, next) {
 Request.get("https://api.spoonacular.com/recipes/" + req.params.id + "/information?apiKey="+apiKey, (error, response, body) => {
	     if(error) {
	         return console.dir(error);
	     }
		 return res.json(JSON.parse(body).extendedIngredients);
		 
	 });
});

// FAVOURITE RECIPE
app.post('/api/favourite/:username/:recipeId/', function (req, res, next) {
    let username = req.params.username;
    let recipeId = req.params.recipeId;
    if(isAuthenticated(req, res, next)){
    	console.log('HERE');
		MongoClient.connect(url, function(err, db) {
			if (err) throw err;
			console.log('EHERE');
			let dbo = db.db("mydb");
			dbo.collection("favourites").insertOne({username: username, recipeId: recipeId}, function(err, result) {
				if (err) return res.status(500).end("internal server error");
				console.log(result);
				return res.json('recipe favourited');
				db.close();
			});
		});
	} 
});

// remove favourite
app.post('/api/remove/favourite/:username/:recipeId/', function (req, res, next) {
    let username = req.params.username;
    let recipeId = req.params.recipeId;
    if(isAuthenticated(req, res, next)){
		MongoClient.connect(url, function(err, db) {
			if (err) throw err;
			let dbo = db.db("mydb");
			dbo.collection("favourites").removeOne({username: username, recipeId: recipeId}, function(err, result) {
				if (err) return res.status(500).end("internal server error");
				console.log(result);
				return res.json('recipe removed from favourites');
				db.close();
			});
		});
	} else {
		return res.status(404).end('User not authenticated');
	}
});

// get favourite status for a recipe
/*
app.get('/api/favourite/:username/:recipeId/', function(req, res, next){

});
*/

// ADD COMMENTS TO RECIPE
app.post('/api/comments/', function (req, res, next) {
    let username = req.body.username;
    let recipeId = req.body.recipeId;
    let content = req.body.content;

    if(isAuthenticated(req, res, next)){
    	console.log('HERE');
		MongoClient.connect(url, function(err, db) {
			if (err) throw err;
			console.log('EHERE');
			let dbo = db.db("mydb");
			dbo.collection("comments").insertOne({username: username, recipeId: recipeId, content: content}, function(err, result) {
				if (err) return res.status(500).end("internal server error");
				console.log(result);
				return res.json(JSON.parse(result));
				db.close();
			});
		});
	} else {
		return res.status(404).end('User not authenticated');
	}
});

//get all comments for a recipe

app.get('/api/comments/:recipeId/', function(req, res, next){
if(isAuthenticated(req, res, next)){
	MongoClient.connect(url, function(err, db) {
			if (err) throw err;
			let dbo = db.db("mydb");
			//dbo.collection("comments").find({recipeId: req.params.recipeId},  {sort: {_id: -1}, limit: 10}).toArray(function(err, result){
			dbo.collection("comments").find({recipeId: parseInt(req.params.recipeId)}).toArray(function(err, result){
				if (err) return res.status(500).end("internal server error");
				console.log(result);
				return res.json(result);
				db.close();
			});
		});
    
    } else {
        return res.json([]);
    }
});



const http = require('http');
const PORT = 5000;

http.createServer(app).listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTP server on http://localhost:%s", PORT);
});