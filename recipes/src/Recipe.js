import React, { Component } from 'react';
import { Link } from "react-router-dom";
import Moment from 'moment';
import BeautyStars from 'beauty-stars';
import './App.css';
import './Recipe.css';



class Recipe extends Component {
	recipeId= '';
	state = {
		instructions: [],
		ingredients: [],
		loggedIn:false,
		username: '',
		commentsList: [],
		showUserHomepage: false,
		ratings: { value: 0 },
		averagerating: '0',
		favouriteValue: 'Favourite'
	};

	componentDidMount = () => {
		this.recipeId = this.props.location.state.recipeId;
		
		this.state.loggedIn = this.props.location.state.loggedIn;
		this.state.username = this.props.location.state.username;
		this.getIngredients();
		this.getInstructions();
		this.getComments();
		if (this.props.location.state.loggedIn) {
			this.getFavourite();
			this.getRatings();
		}
		this.getAverageRating();
	};


	getIngredients = () => {
		const fetchIngredients = fetch('/api/ingredients/' + this.recipeId + '/', {
			method: "GET",
			headers: {
				"Content-Type": "application/json"
			},
		});
		fetchIngredients.then(response => {
			if (response.status === 400) {
				window.alert('Bad input. Please enter another ingredient.');
				return null;
			}
			return response.json();
		}).then(data => {
			if (data === null) {
				return;
			}
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
		});
		fetchInstructions.then(response => {
			if (response.status === 400) {
				window.alert('Bad input. Please enter a valid recipe id');
				return null;
			}
			return response.json();
		}).then(data => {
			if (data === null) {
				return;
			}
			if (data === '[]') {
				this.setState({ instructions: [{ step: "Sorry, no data found" }] });
				return;
			}
			let allSteps = (JSON.parse(data)[0])['steps'];
			this.setState({ instructions: allSteps });
		});
	};


	handleFavourite = () => {
		if (this.state.favouriteValue === 'Favourited!') {
			this.removeFavourite();
		} else {
			this.favouriteRecipe();
		}
	}


	favouriteRecipe = () => {
		const favRecipe = fetch('/api/favourite/' + this.state.username + '/' + this.recipeId + '/', {
			method: "POST",
			body: JSON.stringify({
				title: this.props.location.state.title, readyInMinutes: this.props.location.state.cookingTime,
				servings: this.props.location.state.servings
			}),
			headers: {
				"Content-Type": "application/json"
			},
		});
		favRecipe.then(response => {
			if (response.status === 200) {
				this.state.favouriteValue = 'Favourited!';
				this.forceUpdate();
			} else if (response.status === 400) {
				window.alert('Bad input. Please enter a valid username and recipe id');
			}else {
				window.alert('An error occured');
			}
		});
	};


	removeFavourite = () => {
		const removeFav = fetch('/api/remove/favourite/' + this.state.username + '/' + this.recipeId + '/', {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json"
			},
		});
		removeFav.then(response => {
			if (response.status === 200) {
				this.state.favouriteValue = 'Favourite';
				this.forceUpdate();
			} else if (response.status === 400) {
				window.alert('Bad input. Please enter a valid username and recipe id');
			} else {
				window.alert('An error occured');
			}
		});
	};


	addComment = () => {
		let comment = document.getElementById('user-comment').value;
		if (comment && comment.length !== 0) {
			if (comment.length > 55) {
				window.alert('Comment is too long. Please enter a comment with less than 55 characters.');
				return;
			}
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
				if (response.status === 400) {
					window.alert('Bad input. Please enter a valid username and recipe id');
					return null;
				}
				return response.json();
			}).then(data => {
				if (data === null) {
					return;
				}
				let newComment = (data.ops)[0];
				this.getComments();
			});
		}
	};


	deleteComment = (id) => {
		const deleteComment = fetch('/api/comments/'+id+'/', {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json"
			}
		});
		deleteComment.then(response => {
			if (response.status === 200) {
				this.getComments();
				this.forceUpdate();
			} else if (response.status === 400) {
				window.alert('Bad input. Please enter a valid comment id');
			} else if (response.status === 401) {
				window.alert('Unauthorized. Cannot delete this comment.');
			} else if (response.status === 404) {
				window.alert('This comment does not exist anymore');
			} else {
				window.alert('An error occured. Please try again');
			}
		});
	};


	getFavourite = () => {
		const fetchFavourite = fetch('/api/favourite/' + this.recipeId + '/', {
			method: "GET",
			headers: {
				"Content-Type": "application/json"
			},
		});
		fetchFavourite.then(response => {
			if (response.status === 400) {
				window.alert('Bad input. Please enter a valid recipe id.');
				return null;
			}
			return response.json();
		}).then(data => {
			if (data === null) {
				return;
			}
			if (data) {
				this.state.favouriteValue = 'Favourited!';
			} else {
				this.state.favouriteValue = 'Favourite';
			}
			this.forceUpdate();
			return;
		});
	}


	getComments = () => {
		const fetchComments = fetch('/api/comments/' +  this.recipeId + '/', {
			method: "GET",
			headers: {
				"Content-Type": "application/json"
			},
		});
		fetchComments.then(response => {
			if (response.status === 400) {
				window.alert('Bad input. Please enter a valid recipe id.');
				return null;
			}
			return response.json();
		}).then(data => {
			if (data === null) {
				return;
			}
			if (data === '[]') {
				return;
			}
			this.state.commentsList = data;
			this.forceUpdate();
		});
	}


	getAverageRating = () => {
		const avgRateOfRecipe = fetch('/api/rating/' + this.recipeId + '/', {
			method: "GET",
			headers: {
				"Content-Type": "application/json"
			},
		});
		avgRateOfRecipe.then(response => {
			return response.json();
		}).then(value => {
			if (value > 0) {
				this.state.averagerating = value;
				this.forceUpdate();
			}
			return;
		});
	}


	getRatings = () => {
		const ratingOfRecipe = fetch('/api/rating/' + this.state.username + '/' + this.recipeId + '/', {
			method: "GET",
			headers: {
				"Content-Type": "application/json"
			},
		});
		ratingOfRecipe.then(response => {
			return response.json();
		}).then(value => {
			if (value > 0) {
				this.setState({ ratings: { value } });
				this.forceUpdate();
			}
			return;
		});
	};


	rateRecipe = (value) => {
		const ratingsRecipe = fetch('/api/rating/' + this.state.username + '/' + this.recipeId + '/' + value + '/', {
			method: "POST",
			body: JSON.stringify({
				title: this.props.location.state.title, readyInMinutes: this.props.location.state.cookingTime,
				servings: this.props.location.state.servings
			}),
			headers: {
				"Content-Type": "application/json"
			},
		});
		ratingsRecipe.then(response => {
			return response.json();
		}).then(data => {
			this.setState({ ratings: { value } });
			this.getAverageRating();
			this.forceUpdate();
		});
	};


	render() {
		return (
			<div>
				<header className="App-header">
					<h1 id='title'>Whats Cooking</h1>
					{this.state.loggedIn && <p id='user-name'>Logged in as: {this.state.username}</p>}
					{this.state.loggedIn &&
						<button id='user-button' className='btn-login'>
							<Link name="link-viewRecipe " style={{ textDecoration: 'none', color: 'black' }} to={{
								pathname: `/`,
								state: {
									username: '',
									loggedIn: false,
									showLoginPage: true
								}
							}}>Signout</Link>
						</button>
					}
				</header>
				<div className='Recipe'>
					<div>
						<div className='btn-options'>
							{this.props.location.state.showBackButton && <button id='btn-back' className='btn'>
								<Link name="link-backSearchResults" style={{ textDecoration: 'none', color: 'black' }} to={{
									pathname: `/`,
									state: {
										username: this.state.username,
										loggedIn: this.state.loggedIn,
										showLoginPage: this.state.showLoginPage,
										showUserHomepage: false,
										showSearchResults: true
										
									}
								}}>Search Results</Link>
							</button>
							}
							{this.state.loggedIn &&
								<button id='btn-home' className='btn'>
									<Link name="link-backSearchResults" style={{ textDecoration: 'none', color: 'black' }} to={{
										pathname: `/`,
										state: {
											username: this.state.username,
											loggedIn: this.state.loggedIn,
											showLoginPage: this.state.showLoginPage,
											showUserHomepage: true
											
										}
									}}>Homepage</Link>
								</button>
								}
						</div>
						<div id='recipe-header'>
							<div id='recipes-title'>{this.props.location.state.title}</div>
							{this.state.loggedIn &&
								
								<button id='btn-favourite' className='btn' onClick={this.handleFavourite}>{this.state.favouriteValue}</button>
								
								}
						</div>
					</div>
					<div className='recipe-allparts'>
					<div className='recipe-part1'>
						<img src={this.props.location.state.image} alt={this.props.location.state.title}/>
						<div id='cooking-time'>Cooking time: {this.props.location.state.cookingTime} mins</div>
						<div id='servings'>Servings: {this.props.location.state.servings}</div>
						<div id='averagerate'>Average Rating: {this.state.averagerating}/5</div>
							{this.state.loggedIn &&
								<div>
								<div id='add-ratings'>Add your rating:</div>
								<BeautyStars id="starrating"
									value={this.state.ratings.value}
									onChange={value => this.rateRecipe(value)} />
							</div>
							}
						</div>
						<div className='recipe-part2'>
							<div className='heading'>Ingredients</div>
							<ol>
								{this.state.ingredients.map((ingredient, index) => {
									return <li className='bullet' key={index}>{ingredient.originalString}</li>
								})}
							</ol>
						</div>

						<div className='recipe=part3'>
							<div className='heading'>Instructions</div>
							<ol>
								{this.state.instructions.map((step, index) => {
									return <li className='bullet' key={index}>{step['step']}</li>
								})}
							</ol>
						</div>
					</div>


					<div className='comments'>
						<div className='heading'>Comments</div>
							{this.state.loggedIn && <div className='comment-form'>
							<textarea type="text" className="comment-field" id="user-comment" />
							<button id='addComment-button' className='btn' onClick={this.addComment}>Post comment</button>
						</div>}

						<div id='messages'>
							
							{this.state.commentsList.map((comment) => {
								return <div key={comment._id} className='msg_structure'>
									<div className='usr_msg'>{comment.content}</div>
									<div className='date'>{Moment(comment.date).format('DD-MMM-YYYY')}</div>
									<div className='delete' onClick={this.deleteComment.bind(this, comment._id)}></div>
									<div className='usr_name'>{comment.username}</div>
								</div>
							})}
						</div>
					</div>
				</div>
			</div>
		);
    };
};


export default Recipe;
