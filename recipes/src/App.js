import React, { Component } from 'react';
import { Link } from "react-router-dom";
import './App.css';
import SearchForm from './SearchForm.js';
import RecipeBox from './RecipeBox.js';
import LoginPage from './LoginPage.js';
import UserAccount from './UserAccount.js';
import './RecipeBox.css'
import HomePage from './HomePage';


class App extends Component {
	constructor() {
		super();
		this.state = {
			recipes: [],
			recipesFound: true,
			loggedIn: false,
			showLoginPage: false,
			username: '',
			showUserHomepage: false,
			userFavourites: [],
			userSuggestions: [],
			showSearchResults: false,
			changePassword: false
		};
		this.baseUrl = 'https://spoonacular.com/recipeImages/';
	};

	componentDidMount = () => {
		console.log(this.state);
		// set local storage intially
		if (localStorage.length === 0) {
			localStorage.setItem("recipes", JSON.stringify(this.state.recipes));
			localStorage.setItem('username', JSON.stringify(this.state.username));
			localStorage.setItem('loggedIn', JSON.stringify(this.state.loggedIn));
			localStorage.setItem('showLoginPage', JSON.stringify(this.state.showLoginPage));
			localStorage.setItem('userFavourites', JSON.stringify(this.state.userFavourites));
			localStorage.setItem('userSuggestions', JSON.stringify(this.state.userSuggestions));
		}


		// update local storage if user logged out
		if (this.props.location.state && this.props.location.state.username === '' && !this.props.location.state.showSearchResults) {
			this.signOut();
			this.removeUser();
			//return;
		}

		// if user clicks on 'Homepage' button
		if ((this.props.location.state && this.props.location.state.showUserHomepage) || this.state.showUserHomepage) {
			this.setState({ showUserHomepage: true });
			this.displayHomepage();
		}

		// update state variables with values from local storage
		let searchResults = JSON.parse(localStorage.getItem('recipes'));

		this.setState({ recipes: searchResults });
		this.setState({ username: JSON.parse(localStorage.getItem('username')) });
		this.setState({ loggedIn: JSON.parse(localStorage.getItem('loggedIn')) });
		this.setState({ showLoginPage: JSON.parse(localStorage.getItem('showLoginPage')) });
		this.setState({ userFavourites: JSON.parse(localStorage.getItem('userFavourites')) });
		this.setState({ userSuggestions: JSON.parse(localStorage.getItem('userSuggestions')) });

		console.log(this.state);
		this.forceUpdate();
	}

	componentDidUpdate = () => {
		localStorage.setItem("recipes", JSON.stringify(this.state.recipes));
		localStorage.setItem('username', JSON.stringify(this.state.username));
		localStorage.setItem('loggedIn', JSON.stringify(this.state.loggedIn));
		localStorage.setItem('showLoginPage', JSON.stringify(this.state.showLoginPage));
		localStorage.setItem('userFavourites', JSON.stringify(this.state.userFavourites));
		localStorage.setItem('userSuggestions', JSON.stringify(this.state.userSuggestions));
	}
	/*
	delete = () => {
		const del = fetch('/api/delete/', {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			//credentials: "same-origin"
		});
		del.then(response => {
			console.log('done');
		});
	}
	*/
	getAllRecipes = (e) => {
		e.preventDefault();
		this.setState({ showUserHomepage: false });
		//const ingredients = e.target.elements.ingredients.value;
		const ingredients = document.getElementById('ingredients').value;
		if (ingredients === '') {
			window.alert('Please enter an ingredient');
			//toast("Please enter an ingredient", { autoClose: false });
			return;
		}
		const fetchPromise = fetch('/api/recipes/', {
			method: "POST",
			body: JSON.stringify({ ingredients: ingredients }),
			headers: {
				"Content-Type": "application/json"
			},
			//credentials: "same-origin"
		});
		fetchPromise.then(response => {
			if (response.status === 400) {
				window.alert("Bad input");
				return null;
			}
			return response.json();
		}).then(data => {
			if (data === null) {
				return;
			}
			if (data === '[]' || data === 'undefined' || JSON.parse(data).results.length === 0) {
				this.setState({ recipes: [] });
				this.setState({ recipesFound: false });
				window.alert('No results found. Please use another ingredient');
			}
			this.setState({ recipes: (JSON.parse(data)).results });

		});
	};

	signOut = () => {
		const signoutPromise = fetch('/signout/', {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			//credentials: "same-origin"
		});
		signoutPromise.then(response => {
			console.log('SIGNED OYT')
			if (response.status === 200) {
				this.setState({ loggedIn: false });
				this.setState({ username: '' });
				this.setState({ showLoginPage: false });
				this.setState({ recipes: [] });
				this.setState({ showUserHomepage: false });
				this.setState({ userFavourites: [] });
				this.setState({ userSuggestions: [] });

				// clear props
				console.log(this.props.location.state);
				// clear local storage
				localStorage.clear();
				this.forceUpdate();
			} else {
				window.alert('An error occured. Please try again.')
			}
		});
	};

	createAccount = () => {
		this.setState({ showLoginPage: true });
		this.forceUpdate();

	};

	updateUser = (username) => {
		if (username !== '') {
			this.setState({ loggedIn: true });
			this.setState({ username: username });
			this.setState({ userFavourites: [] });
			this.setState({ showUserHomepage: true });
			this.displayHomepage();
		}
		else {
			this.setState({ loggedIn: false });
			this.setState({ username: '' });
		}
		this.setState({ showLoginPage: false });
	};

	removeUser = () => {
		localStorage.setItem('username', JSON.stringify(this.state.username));
		localStorage.setItem('loggedIn', JSON.stringify(this.state.loggedIn));
		localStorage.setItem('showLoginPage', JSON.stringify(this.state.showLoginPage));
		localStorage.setItem('recipes', JSON.stringify(this.state.recipes));
	}

	getUserFavourites = () => {
		const userFavourites = fetch('/api/favourites/', {
			method: "GET",
			headers: {
				"Content-Type": "application/json"
			},
		});
		userFavourites.then(response => {
			return response.json();
		}).then(data => {
			console.log(data.length);
			console.log(document.getElementById('favourite-message'));
			if (data.length === 0) {
				document.getElementById('favourite-message').innerHTML = 'You did not favourite any recipes.';
				this.setState({ userFavourites: [] });
				this.forceUpdate();
				return;
			}
			document.getElementById('favourite-message').innerHTML = '';
			//this.setState({ userFavourites: data });
			this.state.userFavourites = data;
			this.forceUpdate();
		});
	}

	getUserSuggestions = () => {
		const userSuggestions = fetch('/api/toprecipes/', {
			method: "GET",
			headers: {
				"Content-Type": "application/json"
			},
		});
		userSuggestions.then(response => {
			return response.json();
		}).then(data => {
			console.log(data);
			this.setState({ userSuggestions: data });
		});

	}

	displayHomepage = () => {
		console.log('DISPLAY');
		this.setState({ showUserHomepage: true });
		this.setState({ changePassword: false });
		this.getUserFavourites();
		this.getUserSuggestions();
		this.forceUpdate();

	}

	updatePassword = () => {
		this.setState({ changePassword: true });
		console.log('hereeeee');
		this.forceUpdate();
	}

	render() {
		return (
			<div className="App">
				<header className="App-header">
					<h1 id='title'>Whats Cooking</h1>
					{!this.state.loggedIn && !this.state.showLoginPage && <button className='account-button' id='signin-button' onClick={this.createAccount}>
						Sign in/Sign up</button>}
					{this.state.loggedIn && <p id='user-name'>Logged in as: {this.state.username}</p>}
					{this.state.loggedIn && this.state.showUserHomepage && !this.state.changePassword &&
						<button id='changepassword-button' className='account-button' onClick={this.updatePassword}>Change Password</button>
					}
					{this.state.loggedIn && <button id='signout-button' className='account-button' onClick={this.signOut}>Sign out</button>}
				</header>


				{this.state.changePassword && <UserAccount username={this.state.username} updateUser={this.updateUser} history={this.props.history} />}

				{this.state.loggedIn && !this.state.showUserHomepage && !this.state.changePassword &&
					<button id='btn-home' className='btn' onClick={this.displayHomepage}>Homepage</button>
				}

				<div className="second-header">
					{this.state.showLoginPage && <LoginPage updateUser={this.updateUser} history={this.props.history} />}
					{!this.state.showLoginPage && !this.state.changePassword && <SearchForm recipes={this.getAllRecipes} />}
				</div>

				{!this.state.showUserHomepage && !this.state.showLoginPage && <div className="allRecipesContainer">
					{this.state.recipes.map((recipe) => {
						return <RecipeBox key={recipe.id}
							id={recipe.id}
							title={recipe.title}
							cookingTime={recipe.readyInMinutes}
							servings={recipe.servings}
							image={this.baseUrl + recipe.id + '-312x231.jpg'}
							loggedIn={this.state.loggedIn}
							username={this.state.username}
							history={JSON.stringify(this.props.history)}
							showBackButton={true} />
					})}
				</div>
				}

				{this.state.showUserHomepage && !this.state.changePassword &&
					<HomePage userFavourites={this.state.userFavourites} baseUrl={this.baseUrl}
						loggedIn={this.state.loggedIn} username={this.state.username} history={this.props.history}
						userSuggestions={this.state.userSuggestions}
					/>}

			</div>
		);
	};
};

export default App;