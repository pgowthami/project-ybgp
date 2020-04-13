# REST API Documentation

## Authentication API

### Create

- Description: sign up
- Request: 'POST /signup/'
	- content-type: 'application/json'
	- body: object
		- username: (string) username
		- password: (string) password in plaintext
- Response: 200
	- body: user signed up and signed in
- Response: 400
    - body: bad input
- Response: 401
    - body: username is missing in request body
- Response: 401
    - body: password is missing in request body
- Response: 401
	- body: password is empty
- Response: 409
	- body: username already exists
- Response: 500
	- body: 500 Internal Server Error

```
$ curl -H "Content-Type: application/json" 
	   -X POST 
	   -d '{"username":"alice","password":"alice"}' 
	   -c cookie.txt 
	   http://localhost:5000/signup/
```


- Description: sign in
- Request: 'POST /signin/'
	- content-type: 'application/json'
	- body: object
		- username: (string) username
		- password: (string) password in plaintext
- Response: 200
	- body: user signed in
- Response: 400
    - body: bad input
- Response: 400
	- body: username is missing in request body
- Response: 400
	- body: password is missing in request body
- Response: 400
	- body: password is empty
- Response: 401
	- body: incorrect password. access denied
- Response: 409
	- body: Username does not exist
- Response: 500
	- body: 500 Internal Server Error

```
$ curl -H "Content-Type: application/json" 
	   -X POST 
	   -d '{"username":"alice","password":"alice"}' 
	   -b cookie.txt 
	   http://localhost:5000/signin/
```


- Description: change password
- Request: 'POST /changePassword/'
	- content-type: 'application/json'
	- body: object
		- password1: (string) password in plaintext
		- password2: (string) re-entered password for confirmation in plaintext
- Response: 200
	- body: Password has been changed
- Response: 400
	- body: passwords cannot be empty string
- Response: 401
    - body: access denied
- Response: 401
	- body: password1 is missing in request body
- Response: 401
	- body: password2 is missing in request body
- Response: 409
	- body: username does not exist
- Response: 500
	- body: 500 Internal Server Error

```
$ curl -H "Content-Type: application/json" 
	   -X POST 
	   -d '{"password1":"alice1","password2":"alice1"}' 
	   -b cookie.txt 
	   http://localhost:5000/changePassword/
```

### Read

- Description: sign out
- Request: 'GET /signout/'
- Response: 200
	- body: user has been signed out
	
```
$ curl -b cookie.txt 
	   http://localhost:5000/signout/
```

## Recipe API

### Create

- Description: get recipe information from third-party API called Spoonacular
- Request: 'POST /api/recipes/'
	- content-type: 'application/json'
	- body: object
		- ingredients: (string) ingredients to search for recipes
- Response: 200
	- content-type: "application/json"
	- body: list
		- results: list of objects
			- id: (int) recipe id
			- title: (string) title of recipe
			- readyInMinutes: (int) cooking time in minutes
			- servings: (int) number of servings
			- image: (jpg) recipe image
			- imageUrls: (list of string) list of image urls
		- baseUri: (string) base url to get recipe images
		- offset: (int) the number of results to skip
		- number: (int) number of recipes returned in 'results'
		- totalRecipes: (int) total number of recipes in the Spoonacular's database for the given ingredient
		- processingTime: (int) time taken to process request
		- expires: (int) expiration time of the request
		- isStale: (boolean) is the request stale
- Response: 200 	// if no recipes were found
	- content-type: "application/json"
	- body: list
		- results: []
		- baseUri: (string) base url to get recipe images
		- offset: (int) the number of results to skip
		- number: (int) number of recipes returned in 'results'
		- totalRecipes: (int) total number of recipes in the Spoonacular's database for the given ingredient
		- processingTime: (int) time taken to process request
		- expires: (int) expiration time of the request
- Response: 400
	- body: bad input
- Response: 500
	- body: 500 Internal Server Error

```
$  curl -H "Content-Type: application/json" 
		-X POST 
		-d '{"ingredients":"chicken"}' 
		http://localhost:5000/api/recipes/
```

### Read

- Description: get the instructions of the recipe with the given recipe id
- Request: 'GET /api/instructions/:id/'
- Response: 200
	- content-type: "application/json"
	- body: list of subprocesses
		- name: (string) name of subprocess
		- steps: list of objects
			- equipment: (list) list of equipment required for each step of the sub-process
			- ingredients: (list) list of ingredients required for each step of the sub-process
			- number: (int) step number
			- step: (string) detailed description of each step of the process
- Response: 400
	- body: bad input
- Response: 500
	- body: 500 Internal Server Error

```
$ curl http://localhost:5000/api/instructions/485365/
```


- Description: get the ingredients of the recipe with the given recipe id
- Request: 'GET /api/ingredients/:id/'
- Response: 200
	- content-type: "application/json"
	- body: list of objects
		- aisle: (string) grocery category that the ingredient belongs to
		- amount: (int) amount of ingredient
		- consistency: (string) consistency of ingredient (ex: solid for cheese)
		- id: (string) id of ingredient in Spoonacular API
		- measures: (list) detailed quantity of ingredient in 'metric' and 'us' measures
		- meta: (string) specific detail about ingredient (ex: cheese must be grated)
		- name: (string) ingredient name (ex: cheese)
		- original: (string) name and amount of ingredient	(ex: 2 tbsp grated cheese)
		- originalName: (string) detailed name of ingredient (ex: grated cheese)
		- unit: (string) unit of measurement (ex: tbsp)
- Response: 400
	- body: bad input
- Response: 500
	- body: 500 Internal Server Error

```
$ curl http://localhost:5000/api/ingredients/485365/
```


## Favourite API


### Create

- Description: favourite the recipe with the given recipe id
- Request: 'POST /api/favourite/:username/:id/'
	- content-type: 'application/json'
	- body: object
		- username: (string) username 
		- id: (string) recipe id
		- title: (string) recipe title previously retrieved from Spoonacular database
		- readyInMinutes: (string) cooking time for recipe previously retrieved from Spoonacular database
		- servings: (string) number of servings previously retrieved from Spoonacular database
- Response: 200
	- body: recipe favourited
- Response: 401
	- body: access denied
- Response: 404
	- body: recipe details are missing
- Response: 500
	- body: 500 Internal Server Error

```
$ curl -H "Content-Type: application/json" 
	   -X POST 
	   -d '{"title":"best chicken recipe", "readyInMinutes":"5", "servings":"1"}' 
	   -b cookie.txt 
	   http://localhost:5000/api/favourite/alice/485365/
```

- Description: favourite the recipe with the given recipe id
- Request: 'POST /api/favourite/:username/:id/'
	- content-type: 'application/json'
	- body: object
		- username: (string) username 
		- id: (string) recipe id
		- title: (string) recipe title previously retrieved from Spoonacular database
		- readyInMinutes: (string) cooking time for recipe previously retrieved from Spoonacular database
		- servings: (string) number of servings previously retrieved from Spoonacular database
- Response: 200
	- body: recipe favourited
- Response: 400
	- body: bad input		// bad recipe id
- Response: 401
	- body: access denied
- Response: 404
	- body: recipe details are missing
- Response: 500
	- body: 500 Internal Server Error

```
$ curl -H "Content-Type: application/json" 
	   -X POST 
	   -d '{"title":"best chicken recipe", "readyInMinutes":"5", "servings":"1"}' 
	   -b cookie.txt 
	   http://localhost:5000/api/favourite/alice/485365/
```


### Read

- Description: get whether the recipe with the given id was favourited by the user
- Request: 'GET /api/favourite/:id/'
- Response: 200					// if user has favourited this repice
	- content-type: 'application/json'
	- body: object
		_id: (string) id of the entry
		- username: (string) username of current user 
		- id: (string) recipe id
		- title: (string) recipe title
		- readyInMinutes: (string) cooking time
		- servings: (string) number of servings
- Response: 200					// if user has not favourited this recipe
	- body: null
- Response: 400
	- body: bad input
- Response: 401
	- body: access denied
- Response: 500
	- body: 500 Internal Server Error

```
$ curl -b cookie.txt http://localhost:5000/api/favourite/485363/
```


- Description: get the latest 5 recipes favourited by the user
- Request: 'GET /api/favourites/'
- Response: 200
	- content-type: 'application/json'
	- body: list of objects
		_id: (string) id of the entry
		- username: (string) username of current user 
		- id: (string) recipe id
		- title: (string) recipe title
		- readyInMinutes: (string) cooking time
		- servings: (string) number of servings
- Response: 200			// if user has not favourited any recipes
	- body: []
- Response: 401
	- body: access denied
- Response: 500
	- body: 500 Internal Server Error

```
$ curl -b cookie.txt http://localhost:5000/api/favourites/
```


### Delete
- Description: un-favourite the recipe with the given recipe id
- Request: 'DELETE /api/remove/favourite/:username/:id/'
- Response: 200
	- body: recipe removed from favourites
- Response: 400
	- body: bad input			// bad recipe id
- Response: 401
	- body: access denied
- Response: 409
	- body: cannot delete a recipe that has not been favourited.
- Response: 500
	- body: 500 Internal Server Error

```
$ curl -H "Content-Type: application/json" 
	   -X DELETE 
	   -b cookie.txt 
	   http://localhost:5000/api/remove/favourite/aa/485365/
```


## Comments API


### Create

- Description: create a new comment
- Request: 'POST /api/comments/'
	- content-type: 'application/json'
	- body: object
		- recipeId: (string) the id of the recipe to which this comment was posted
		- content: (string) the content of the comment
- Response: 200
	- content-type: 'application/json'
	- body: object
		- result : (object)
			- n: (string) number of rows inserted
			- ok: (string) status
		- connection: (object)
			- id: (string) id of the connection
			- host: (string) host of the connection
			- port: (string) port of the connection
		- ops: (object)		// details about the inserted comment
			- _id: (string) id of the comment
			- username: (string) username of author
			- recipeId: (string) id of the recipe on which the comment was made
			- content: (string) comment content
			- date: (string) date and time when the comment was posted
		- insertedCount: (int) number of rows inserted
		- insertedId: (string) id of the comment
		- n: (string) number of rows inserted
		- ok: (string) status
- Response: 400			//comment content is sanitized
	- body: bad input
- Response: 401
	- body: access denied
- Response: 500
	- body: 500 Internal Server Error

```
$ curl -H "Content-Type: application/json" 
	   -X POST
	   -d '{"recipeId":"485363", "content":"nice recipe"}'
	   -b cookie.txt
	   http://localhost:5000/api/comments/
```


### Read
- Description: get the latest 10 comments on the given recipe
- Request: 'GET /api/comments/:id/'
- Response: 200
	- content-type: 'application/json'
    - body: list of objects
      - _id : (string) the comment id
	  - recipeId: (string) the id of the recipe to which this comment was posted
	  - content: (string) the content of the comment
	  - username: (string) the author of the comment
	  - date: (string) date and time when the comment was posted
- Response: 401
	- body: access denied
- Response: 500
	- body: 500 Internal Server Error
- Response: 200		// if recipe with the given id does not exist
	- body: []

```
$ curl -b cookie.txt
	   http://localhost:5000/api/comments/485363/
```
### Delete

- Description: delete the comment with the given comment id
- Request: 'DELETE /api/comments/:id/'
- Response: 200
	- body: comment removed from database
- Response: 404
	- body: comment not found
- Response: 500
	- body: 500 Internal Server Error
- Response: 401
	- body: User not authenticated to delete this message
- Response: 401
	- body: access denied
- Response: 400			// if given comment id is bad input
	- body: bad input

```
$ curl -X DELETE 
	   -b cookie.txt
	   http://localhost:5000/api/comments/5e9386c3ef8422815881d746/
```
	
## Ratings API


### Create
- Description: add rating to the recipe with given recipe id
- Request: 'POST /api/rating/:username/:id/:rating/'
	- content-type: 'application/json'
	- body: object
		- title: (string) recipe title previously retrieved from Spoonacular database
		- readyInMinutes: (string) cooking time for recipe previously retrieved from Spoonacular database
		- servings: (string) number of servings previously retrieved from Spoonacular database
- Response: 200
	- body: user's rating on the recipe
- Response: 400			//recipe id is invalid
	- body: bad input
- Response: 401
	- body: access denied
- Response: 500
	- body: Internal server error
	
```
$  curl -H "Content-Type: application/json" 
		-X POST 
		-d '{"title":"recipe #1", "readyInMinutes":"10", "servings":"1"}' 
		-b cookie.txt 
		http://localhost:5000/api/rating/alice/4853631/5/
```

### Read


- Description: get the rating given by the user on the recipe with the given id
- Request: 'GET /api/rating/:username/:id/'
- Response: 200
	- body: user's rating on the recipe
- Response: 400			//recipe id is invalid
	- body: bad input
- Response: 401
	- body: access denied
- Response: 500
	- body: Internal server error
	
```
$ curl -b cookie.txt http://localhost:5000/api/rating/alice/485363/
```


- Description: get the average rating on the recipe with the given id
- Request: 'GET /api/rating/:id/'
- Response: 200
	- body: average rating on the recipe
- Response: 400			//recipe id is invalid
	- body: bad input
- Response: 401
	- body: access denied
- Response: 500
	- body: Internal server error

```
$ curl -b cookie.txt
	   http://localhost:5000/api/rating/485363/
```


- Description: get the 5 top rated recipes from our database
- Request: 'GET /api/toprecipes/'
- Response: 200
	- content-type: 'application/json'
    - body: list of objects
		- _id : (string) the recipe id
		- recipeId: (string) the recipe id
		- avgRate: (int) the average rating of the recipe
		- title: (string) recipe title
		- readyInMinutes: (string) cooking time for recipe
		- servings: (string) number of servings
- Response: 401
	- body: access denied
- Response: 500
	- body: 500 Internal Server Error
- Response: 200		// if no recipes were rated in the database
	- body: []

```
$  curl -b cookie.txt 
		http://localhost:5000/api/toprecipes/
```
