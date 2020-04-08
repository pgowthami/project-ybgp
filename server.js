var Request = require("request");
const path = require('path');
const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const fs = require('fs');
const helmet = require('helmet');

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
    secret: 'my secret',
    resave: false,
    saveUninitialized: true,
}));

app.use(function (req, res, next){
    req.username = req.session.username;
    console.log("HTTPS request", req.method, req.url, req.body);
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
    return res.end("user has been signed out");   
});


let apiKey = 'ee29c579c7af4db59e00ba30158a11a9';
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
    let readyInMinutes = req.body.readyInMinutes;
    let servings = req.body.servings;
    let title = req.body.title;
    if(isAuthenticated(req, res, next)){
    	console.log('HERE');
		MongoClient.connect(url, function(err, db) {
			if (err) throw err;
			console.log('EHERE');
			let dbo = db.db("mydb");
			dbo.collection("favourites").insertOne({username: req.username, recipeId: recipeId, title:title, readyInMinutes: readyInMinutes, servings: servings}, function(err, result) {
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
			dbo.collection("favourites").removeOne({username: req.username, recipeId: recipeId}, function(err, result) {
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
app.get('/api/favourite/:recipeId/', function(req, res, next){
	let username = req.username;
	let recipeId = req.params.recipeId;
	if(isAuthenticated(req, res, next)){
		MongoClient.connect(url, function(err, db) {
			if (err) throw err;
			let dbo = db.db("mydb");
			dbo.collection("favourites").findOne({username: username, recipeId: recipeId}, function(err, result) {
				if (err) return res.status(500).end("internal server error");
				console.log(result);
				return res.json(result);
				db.close();
			});
		});
	} else {
		return res.status(404).end('User not authenticated');
	}
});


// get the latest 5 favourites of user
app.get('/api/favourites/', function(req, res, next){
	if(isAuthenticated(req, res, next)){
		MongoClient.connect(url, function(err, db) {
				if (err) throw err;
				let dbo = db.db("mydb");
				dbo.collection("favourites").find({username: req.username},  {sort: {_id: -1}, limit: 5}).toArray(function(err, result){
				//dbo.collection("comments").find({recipeId: parseInt(req.params.recipeId)}).toArray(function(err, result){
					if (err) return res.status(500).end("internal server error");
					console.log(result);
					return res.json(result);
					db.close();
				});
			});
	} else {
		return res.status(404).end('User not authenticated');
	}
});


// ADD COMMENTS TO RECIPE
app.post('/api/comments/', function (req, res, next) {
    let username = req.body.username;
    let recipeId = req.body.recipeId;
    let content = req.body.content;

    if(isAuthenticated(req, res, next)){
		MongoClient.connect(url, function(err, db) {
			if (err) throw err;
			let dbo = db.db("mydb");
			dbo.collection("comments").insertOne({username: req.username, recipeId: recipeId, content: content, date: new Date()}, function(err, result) {
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

// Delete comment

app.delete('/api/comments/:id/', function (req, res, next) {
	if(isAuthenticated(req, res, next)){
		MongoClient.connect(url, function(err, db) {
			console.log('herehere');
			if (err) throw err;
			let dbo = db.db("mydb");
			dbo.collection("comments").findOne({_id: new mongo.ObjectId(req.params.id)}, function(err, result) {
				if (err) return res.status(500).end("internal server error");
				if(!result) return res.status(404).end('comment not found');
				// check if comment is owned by the user
				console.log(req.username);
				console.log(result.username);
				if(req.username !== '' && result.username === req.username){
					dbo.collection("comments").removeOne({_id: new mongo.ObjectId(req.params.id)}, function(err, result) {
						if (err) return res.status(500).end("internal server error");
						return res.json('Comment removed from database');
						db.close();
					});
				} else {
					db.close();
					return res.status(401).end('User not authenticated to delete this message');
				}
			});
		});
	} else {
		return res.status(401).end('User not authenticated');
	}
});

//get all comments for a recipe

app.get('/api/comments/:recipeId/', function(req, res, next){
	MongoClient.connect(url, function(err, db) {
			if (err) throw err;
			let dbo = db.db("mydb");
			//dbo.collection("comments").find({recipeId: req.params.recipeId},  {sort: {_id: -1}, limit: 10}).toArray(function(err, result){
			dbo.collection("comments").find({recipeId: req.params.recipeId}).toArray(function(err, result){
				if (err) return res.status(500).end("internal server error");
				console.log(result);
				return res.json(result);
				db.close();
			});
		});
});


app.post('/api/delete/', function(req, res, next){
	console.log('DELETE');
	MongoClient.connect(url, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db("mydb");
	  dbo.collection("comments").drop(function(err, delOK) {
	    if (err) throw err;
	    if (delOK) console.log("comments deleted");
	  });
		dbo.collection("favourites").drop(function(err, delOK) {
	    if (err) throw err;
	    if (delOK) console.log("comments deleted");
	  });


	  db.close();
	});
	
});
/*
const http = require('http');
const PORT = 5000;

http.createServer(app).listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTP server on http://localhost:%s", PORT);
});
*/

const https = require('https');
const PORT = 5000;

var privateKey = fs.readFileSync( 'server.key' );
var certificate = fs.readFileSync( 'server.crt' );
var config = {
        key: privateKey,
        cert: certificate
};

https.createServer(config, app).listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTPS server on https://localhost:%s", PORT);
});
