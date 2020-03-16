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
    req.username = ('username' in req.session)? req.session.username : null;
    let username = (req.username)? req.username._id : '';
    console.log("HTTP request", req.method, req.url, req.body);
    next();
});

var isAuthenticated = function(req, res, next) {
    if (!req.username) return res.status(401).end("access denied");
    next();
};

// curl -H "Content-Type: application/json" -X POST -d '{"username":"alice","password":"alice"}' -c cookie.txt localhost:3000/signup/
app.post('/signup/', function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    //users.findOne({_id: username}, function(err, user){
      //  if (err) return res.status(500).end(err);
        //if (user) return res.status(409).end("username " + username + " already exists");
		bcrypt.genSalt(10, function(err, salt) {
		            bcrypt.hash(password, salt, function(err, hash) {
						// FIX WE NEED UPSERT AND TO UPDATE INSTEAD I GUESS
						MongoClient.connect(url, function(err, db) {
							  if (err) throw err;
							  var dbo = db.db("mydb");
							  dbo.collection("users").insertOne({_id: username, hash}, function(err, result) {
							    if (err) throw err;
							    console.log(result);
							    console.log("1 user inserted");
								console.log(result.insertedId);
								//return res.json(message);
							    db.close();
							  });
							  
							 
					            res.setHeader('Set-Cookie', cookie.serialize('username', username, {
					                  path : '/', 
					                  maxAge: 60 * 60 * 24 * 7
					            }));
								 req.session.username = username; 
					            return res.json("user " + username + " signed up");
		
  
						  });
						
				       /* users.update({_id: username},{_id: username, hash}, {upsert: true}, function(err){
				            if (err) return res.status(500).end(err);
				            // initialize cookie
				            res.setHeader('Set-Cookie', cookie.serialize('username', username, {
				                  path : '/', 
				                  maxAge: 60 * 60 * 24 * 7
				            }));
							 req.session.username = username; 
				            return res.json("user " + username + " signed up");
				        }); */
		            });
		        });
  //  });
});

// curl -H "Content-Type: application/json" -X POST -d '{"username":"alice","password":"alice"}' -c cookie.txt localhost:3000/signin/
app.post('/signin/', function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
	
	MongoClient.connect(url, function(err, db) {
		  if (err) throw err;
		  var dbo = db.db("mydb");

		  dbo.collection("users").find({ _id: username}).toArray(function(err, result) {
		      if (err) throw err;
		      console.log(result);
			  console.log(result[0].hash);
  		    bcrypt.compare(password, result[0].hash, function(err, valid) {
  		              if (err) return res.status(500).end(err);
  		              if (!valid) return res.status(401).end("access denied");
  		              // start a session
  	       // if (user.password !== password) return res.status(401).end("access denied"); 
  	        // initialize cookie
  		   		req.session.username = username; 
  		   		//req.session.user = user;
  	        	res.setHeader('Set-Cookie', cookie.serialize('username', username, {
  	              	path : '/', 
  	              	maxAge: 60 * 60 * 24 * 7
  	        	}));
		
  	        	return res.json("user " + username + " signed in");
  			 });
			  //return res.json(result);
		      db.close();
		    });
			
		   


	  });
	
  
	/*
	
    // retrieve user from the database
    users.findOne({_id: username}, function(err, user){
        if (err) return res.status(500).end(err);
        if (!user) return res.status(401).end("access denied");
	    bcrypt.compare(password, user.hash, function(err, valid) {
	              if (err) return res.status(500).end(err);
	              if (!valid) return res.status(401).end("access denied");
	              // start a session
       // if (user.password !== password) return res.status(401).end("access denied"); 
        // initialize cookie
	   		req.session.username = username; 
	   		//req.session.user = user;
        	res.setHeader('Set-Cookie', cookie.serialize('username', username, {
              	path : '/', 
              	maxAge: 60 * 60 * 24 * 7
        	}));
		
        	return res.json("user " + username + " signed in");
		 });
    }); */
});

// curl -b cookie.txt -c cookie.txt localhost:3000/signout/
app.post('/signout/', function (req, res, next) {
    res.setHeader('Set-Cookie', cookie.serialize('username', '', {
          path : '/', 
          maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
    }));
    res.redirect('/');
});


let apiKey = 'b5f04b0b394e4a6eb1d3d0157c4abaa1';
app.get('/api/recipes/:ingredients/', function (req, res, next) {
	 console.log(req.body);
	 console.log(req.params.ingredients);

 	Request.get("https://api.spoonacular.com/recipes/search?apiKey="+ apiKey+"&query=" + req.params.ingredients, (error, response, body) => {
	     if(error) {
	         return console.dir(error);
	     }
		 return res.json(body);
	 });
});

app.get('/api/instructions/:recipeId/', function (req, res, next) {	
 	Request.get("https://api.spoonacular.com/recipes/" + req.params.recipeId + "/analyzedInstructions?apiKey=" + apiKey, (error, response, body) => {
	     if(error) {
	         return console.dir(error);
	     }
		 return res.json(body);
		 
	 });
});

app.get('/api/ingredients/:id/', function (req, res, next) {
 Request.get("https://api.spoonacular.com/recipes/" + req.params.id + "/information?apiKey=" + apiKey, (error, response, body) => {
	     if(error) {
	         return console.dir(error);
	     }
		 return res.json(JSON.parse(body).extendedIngredients);
		 
	 });
});

const http = require('http');
const PORT = 5000;

http.createServer(app).listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTP server on http://localhost:%s", PORT);
});