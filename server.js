var Request = require("request");
const path = require('path');
const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const fs = require('fs');
const helmet = require('helmet');

const validator = require('validator');

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


var isAuthenticated = function(req, res, next) {
    if (!req.username) return res.status(401).end("access denied");
    next();
};

// 3 methods to check input before processing it
var checkUsername = function(req, res, next) {
    if (!validator.isAlphanumeric(req.body.username)) return res.status(400).end("bad input");
    next();
};

var sanitizeContent = function(req, res, next) {
    req.body.content = validator.escape(req.body.content);
    next();
}

var checkId = function(req, res, next) {
    if (!validator.isAlphanumeric(req.params.id)) return res.status(400).end("bad input");
    next();
};

var checkIngredients = function(req, res, next) {
    if (!validator.isAlphanumeric(req.body.ingredients)) return res.status(400).end("bad input");
    next();
};


app.post('/signup/', checkUsername, function (req, res, next) {
	if (!('username' in req.body)) return res.status(400).end('username is missing');
    if (!('password' in req.body)) return res.status(400).end('password is missing');
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

app.post('/signin/', checkUsername, function (req, res, next) {
	if (!('username' in req.body)) return res.status(400).end('username is missing');
    if (!('password' in req.body)) return res.status(400).end('password is missing');
    let username = req.body.username;
    let password = req.body.password;
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		let dbo = db.db("mydb");
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

// Change password
app.post('/changePassword/', isAuthenticated, function (req, res, next) {
	if (!('password1' in req.body)) return res.status(400).end('password entry #1 is missing');
    if (!('password2' in req.body)) return res.status(400).end('password entry #2 is missing');
    let username = req.username;
    let password1 = req.body.password1;
    let password2 = req.body.password2;
	// Check if passwords match
	if(password1 !== password2){
		return res.status(404).end('Passwords do not match. Please try again.');
	}
	bcrypt.genSalt(10, function(err, salt) {
	bcrypt.hash(password1, salt, function(err, hash) {
		MongoClient.connect(url, function(err, db) {
			  if (err) throw err;
			  var dbo = db.db("mydb");
			  dbo.collection("users").find({ _id: username}).toArray(function(err, user) {
			      if (err) throw err;				   
				  if (!user) return res.status(409).end("username does not exist");
				  dbo.collection("users").replaceOne({_id: username}, {_id: username, hash}, function(err, result) {
				  	if (err) return res.status(500).end("internal server error");
	            	return res.json('Password has been changed');
			    	db.close();
				  	});          
			  	});
			});
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


//let apiKey = 'b5f04b0b394e4a6eb1d3d0157c4abaa1';
//let apiKey = '3bd6b3501a044f70b65971f869776dfb';
let apiKey = 'ee29c579c7af4db59e00ba30158a11a9';
app.post('/api/recipes/', checkIngredients, function (req, res, next) {
	 console.log(req.body);
	 console.log(req.body.ingredients);

 	Request.get("https://api.spoonacular.com/recipes/search?apiKey="+apiKey+"&query=" + req.body.ingredients, (error, response, body) => {
	     if(error) {
	         return console.dir(error);
	     }
		 return res.json(body);
	 });
});

app.get('/api/instructions/:id/', checkId, function (req, res, next) {	
 	Request.get("https://api.spoonacular.com/recipes/" + req.params.id + "/analyzedInstructions?apiKey="+apiKey, (error, response, body) => {
	     if(error) {
	         return console.dir(error);
	     }
		 return res.json(body);
		 
	 });
});

app.get('/api/ingredients/:id/', checkId, function (req, res, next) {
 Request.get("https://api.spoonacular.com/recipes/" + req.params.id + "/information?apiKey="+apiKey, (error, response, body) => {
	     if(error) {
	         return console.dir(error);
	     }
		 return res.json(JSON.parse(body).extendedIngredients);
		 
	 });
});

// FAVOURITE RECIPE
app.post('/api/favourite/:username/:id/', isAuthenticated, checkId, function (req, res, next) {
    let username = req.params.username;
    let recipeId = req.params.id;
    let readyInMinutes = req.body.readyInMinutes;
    let servings = req.body.servings;
    let title = req.body.title;
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		let dbo = db.db("mydb");
		dbo.collection("favourites").insertOne({username: req.username, recipeId: recipeId, title:title, readyInMinutes: readyInMinutes, servings: servings}, function(err, result) {
			if (err) return res.status(500).end("internal server error");
			console.log(result);
			return res.json('recipe favourited');
			db.close();
		});
	});
});

// remove favourite
app.post('/api/remove/favourite/:username/:id/', isAuthenticated, checkId, function (req, res, next) {
    let username = req.params.username;
    let recipeId = req.params.id;
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
});

// get favourite status for a recipe
app.get('/api/favourite/:id/', isAuthenticated, checkId, function(req, res, next){
	let username = req.username;
	let recipeId = req.params.id;
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
});


// get the latest 5 favourites of user
app.get('/api/favourites/', isAuthenticated, function(req, res, next){
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
});


// ADD COMMENTS TO RECIPE
app.post('/api/comments/', isAuthenticated, sanitizeContent, function (req, res, next) {
    let username = req.body.username;
    let recipeId = req.body.recipeId;
    let content = req.body.content;
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
});

// Delete comment

app.delete('/api/comments/:id/', isAuthenticated, checkId, function (req, res, next) {
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		let dbo = db.db("mydb");
		dbo.collection("comments").findOne({_id: new mongo.ObjectId(req.params.id)}, function(err, result) {
			if (err) return res.status(500).end("internal server error");
			if(!result) return res.status(404).end('comment not found');
			// check if comment is owned by the user
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
});

//get all comments for a recipe

app.get('/api/comments/:id/', checkId, function(req, res, next){
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		let dbo = db.db("mydb");
		dbo.collection("comments").find({recipeId: req.params.id},  {sort: {date: -1}, limit: 10}).toArray(function(err, result){
		//dbo.collection("comments").find({recipeId: req.params.id} ).toArray(function(err, result){
			if (err) return res.status(500).end("internal server error");
			console.log(result);
			return res.json(result);
			db.close();
		});
	});
});


// RATINGS

// get the latest 5 favourites of user
app.get('/api/toprecipes/', isAuthenticated, function(req, res, next){
	console.log("HITTTED");

		MongoClient.connect(url, function(err, db) {
				if (err) throw err;
				let dbo = db.db("mydb");
				dbo.collection("avgrating").find({},  {sort: {avgRate: -1}, limit: 5}).toArray(function(err, result){
				//dbo.collection("comments").find({recipeId: parseInt(req.params.recipeId)}).toArray(function(err, result){
					if (err) return res.status(500).end("internal server error");
					console.log(result);
					return res.json(result);
					db.close();
				});
			});

});

// get favourite status for a recipe
app.get('/api/toprating/:recipeId/', isAuthenticated, function(req, res, next){
	let username = req.username;
	let recipeId = req.params.recipeId;

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
	
});

app.post('/api/rating/:username/:recipeId/:rating/', isAuthenticated, function (req, res, next) {
    let username = req.params.username;
    let recipeId = req.params.recipeId;
	 let rating = req.params.rating;
	 let readyInMinutes = req.body.readyInMinutes;
	 let servings = req.body.servings;
	 let title = req.body.title;
	 console.log("POST RATE");
	 console.log(req.body);

    	console.log('HERE');
		MongoClient.connect(url, function(err, db) {
			if (err) throw err;
			console.log('EHERE');
			let dbo = db.db("mydb");
			//db.rating.update({"username" : "yaaliny", "recipeId" : "74172"}, {"username" : "yaaliny", "recipeId" : "74172" , "rating": "2"} , { upsert: true });
			dbo.collection("rating").update({username: username, recipeId: recipeId } , {username: username, recipeId: recipeId, rating: parseInt(rating), title:title, readyInMinutes: readyInMinutes, servings: servings}, { upsert: true }  , function(err, result) {
				if (err) return res.status(500).end("internal server error");
				
				dbo.collection("rating").aggregate([ {$group: { _id: "$recipeId", avgRate: { $avg: "$rating" } } }, { $match: { "_id": recipeId } } ]).toArray(function(err, result){
					if (err) return res.status(500).end("internal server error");
						console.log("TESTfaeTTTTT");
						console.log(result);
						console.log(result[0]);
						console.log(result[0]._id);
						//{ _id: '74172', avgRate: 4.5 }
						 console.log(req.body);
						dbo.collection("avgrating").update({_id: result[0]._id } , {recipeId: result[0]._id, avgRate: result[0].avgRate, title: title, readyInMinutes: readyInMinutes, servings: servings }, { upsert: true }  , function(err, result) {
							if (err) return res.status(500).end("internal server error");
						});
					}); 
				
				return res.json(rating);
				db.close();
			});
		});
	
});

app.get('/api/rating/:username/:recipeId/', isAuthenticated, function (req, res, next) {
	console.log("HIT");
    let username = req.params.username;
    let recipeId = req.params.recipeId;
	 //let rating = req.params.rating;
    	console.log('HERE');
		MongoClient.connect(url, function(err, db) {
			if (err) throw err;
			console.log('EHERE');
			let dbo = db.db("mydb");
			dbo.collection("rating").findOne({username: username, recipeId: recipeId }, function(err, result) {
				if (err) return res.status(500).end("internal server error");
				console.log(result);
				if(result) {
					return res.json(result.rating.toString());
				} else {
					return res.json(0);
				}
				
				db.close();
			});
		});
	
});

app.get('/api/rating/:recipeId/', function (req, res, next) {
	console.log("HITTT");
    let recipeId = req.params.recipeId;
	 //let rating = req.params.rating;
	 console.log(recipeId);
    
    	console.log('HERE');
		
		MongoClient.connect(url, function(err, db) {
			if (err) throw err;
			console.log('EHERE');
			let dbo = db.db("mydb");
			
			//dbo.collection("rating").aggregate([ {$group: { _id: "$recipeId", avgRate: { $avg: "$rating" } } }, { $match: { "_id": recipeId } }], function(err, result) {
				dbo.collection("avgrating").findOne({_id: recipeId}, function(err, result) {
					if (err) return res.status(500).end("internal server error");
					console.log("AVERAGE");
					console.log(result);
					if(result) {
						
						console.log(Math.round(result.avgRate * 10) / 10);
						return res.json((Math.round(result.avgRate * 10) / 10).toString());
					} else {
						return res.json(0);
					}
					//return res.json(result);
					db.close();
				});
		});
	
});









/*
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
