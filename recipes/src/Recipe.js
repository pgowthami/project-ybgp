import React, { Component } from 'react';
import { Link } from "react-router-dom";
import './App.css';
import './Recipe.css';



class Recipe extends Component {
	recipeId= '';
	state = {
		instructions: [],
		ingredients: [],
		loggedIn:false,
		username: '',
		commentsList: []
	};

	componentDidMount = () => {
		this.recipeId = this.props.location.state.recipeId;

		this.setState({loggedIn: this.props.location.state.loggedIn});
		this.setState({ username: this.props.location.state.username});

		this.getIngredients();
		this.getInstructions();
		this.getComments();
		
    };

	getIngredients = () => {
		const fetchIngredients = fetch('/api/ingredients/' + this.recipeId + '/', {
			method: "GET",
			headers: {
				"Content-Type": "application/json"
			},
			//credentials: "same-origin"
		});
		fetchIngredients.then(response => {
			return response.json();
		}).then(data => {
			
			if (data === '[]') {
				this.setState({ ingredients: [{ step: "Sorry, no data found" }] });
				return;
			}
			this.setState({ ingredients: data });
			
		});

	};

	getInstructions = () => {
		const fetchInstructions = fetch('/api/instructions/' + this.recipeId + '/', {
			method: "GET",
			headers: {
				"Content-Type": "application/json"
			},
			//credentials: "same-origin"
		});
		fetchInstructions.then(response => {
			return response.json();
		}).then(data => {
			if (data === '[]') {
				this.setState({ instructions: [{ step: "Sorry, no data found" }] });
				return;
			}
			let allSteps = (JSON.parse(data)[0])['steps'];
			this.setState({ instructions: allSteps });
		});
	};


	handleFavourite = () => {
		// if recipe has been favourited, call remove function
		if (document.getElementById('btn-favourite').innerHTML === 'Remove from favourites') {
			this.removeFavourite();
		} else {

			// add to favourites
			this.favouriteRecipe();
		}
		
	}

	favouriteRecipe = () => {
		const favRecipe = fetch('/api/favourite/' + this.state.username + '/' + this.recipeId + '/', {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
		});
		favRecipe.then(response => {
			if (response.status === 200) {
				document.getElementById('btn-favourite').innerHTML = 'Remove from favourites';
			} else {
				window.alert('An error occured');
			}
		});
	};

	removeFavourite = () => {
		const removeFav = fetch('/api/remove/favourite/' + this.state.username + '/' + this.recipeId + '/', {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
		});
		removeFav.then(response => {
			if (response.status === 200) {
				document.getElementById('btn-favourite').innerHTML = 'Add to favourite';
				console.log(document.getElementById('btn-favourite'));
			} else {
				window.alert('An error occured');
			}
		});
	}

	addComment = () => {
		let comment = document.getElementById('user-comment').value;
		const addComment = fetch('/api/comments/', {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				username: this.state.username,
				recipeId: this.recipeId,
				content: comment
			})
		});
		addComment.then(response => {
			return response.json();
		}).then(data => {
			console.log((data.ops)[0]);
			let newComment = (data.ops)[0];
			this.setState({ commentsList: [...this.state.commentsList, newComment] });
			this.getComments();
			this.forceUpdate();
		});
	}

	// TODO: retrieve if recipe has been favourited and display button appropriately
	displayFavourite = () => {
		console.log('displayed favourite');
	}

	getComments = () => {
		const fetchComments = fetch('/api/comments/' +  this.recipeId + '/', {
			method: "GET",
			headers: {
				"Content-Type": "application/json"
			},
		});
		fetchComments.then(response => {
			return response.json();
		}).then(data => {
			console.log(data);
			if (data === '[]') {
				return;
			}
			this.setState({ commentsList: data});
		});
	}

	signOut = () => {
		this.setState({ username: '' });
		this.setState({ loggedIn: false });
		this.setState({ showLoginPage: true });
	}



	render() {
		return (
			<div>
				<header className="App-header">
					<h1 id='title'>Whats Cooking</h1>
					{this.state.loggedIn &&
						<div className='user-info'>
						<p id='user-name'>Username: {this.state.username}</p>
						<button id='user-button' onClick={this.signOut}> 
							<Link name="link-viewRecipe " to={{
								pathname: `/`,
								state: {
									username: '',
									loggedIn: false,
									showLoginPage: true
								}
							}}>Signout</Link>
						</button>
						</div>
					}
				</header>
				<div className='Recipe'>
					<div>
						<button id='user-button' >
							<Link name="link-backSearchResults " to={{
								pathname: `/`,
								state: {
									username: this.state.username,
									loggedIn: this.state.loggedIn,
									showLoginPage: this.state.showLoginPage
								}
							}}>Go Home</Link>
						</button>
						<h2>{this.props.location.state.title}</h2>
						{this.state.loggedIn && <button id='btn-favourite' onClick={this.handleFavourite} > Favourite</button>}
					</div>
					<div className='recipe-allparts'>
					<div className='recipe-part1'>
						<img src={this.props.location.state.image} alt={this.props.location.state.title}/>
						<h3>Cooking time: {this.props.location.state.cookingTime}</h3>
						<h3>Servings: {this.props.location.state.servings}</h3>
					</div>

					<div className='recipe-part2'>
						<h3>Ingredients</h3>
						<ol>
							{this.state.ingredients.map((ingredient, index) => {
								return <li key={index}>{ingredient.originalString}</li>
							})}
						</ol>
					</div>

					<div className='recipe=part3'>
					<h3>Instructions</h3>
					<ol>
						{this.state.instructions.map((step, index) => {
							return <li key={index}>{step['step']}</li>
						})}
							</ol>
						</div>
					</div>
				</div>

				<div className='comments'>
					<div className='comment-form'>
						<input type="text" className="comment-field" id="user-comment" />
						<button id='addComment-button' onClick={this.addComment}>Post comment</button>
					</div>

					<div id='messages'>
						<h3>Comments</h3>
						{this.state.commentsList.map((comment) => {
							return <div key={comment._id} className='msg_structure'>
								<img src={require('./user.png')} alt={comment.username}></img>
								<div className='usr_msg'>{comment.content}</div>
								<div className='date'>{comment._id}</div>
								<div className='delete'></div>
								<div className='usr_name'>{comment.username}</div>
							</div>
						})}
					</div>
				</div>

			</div>
		);
    };
};


export default Recipe;
