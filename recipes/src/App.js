import React, { useEffect, Component, useState } from 'react';
import './App.css';
import SearchForm from './SearchForm.js';
import RecipeBox from './RecipeBox.js';
import LoginPage from './LoginPage.js';


import './RecipeBox.css'

import { useAlert } from 'react-alert'

class App extends Component {
	constructor() {
		super();
		this.apiKey = "ee29c579c7af4db59e00ba30158a11a9";
		this.state = {
			recipes: [],
			recipesFound: true,
			loggedIn: false,
			showLoginPage: false,
			username: ''
		};
		this.baseUrl = 'https://spoonacular.com/recipeImages/';
	};

	getAllRecipes = (e) => {
		e.preventDefault();
		//const ingredients = e.target.elements.ingredients.value;
		const ingredients = document.getElementById('ingredients').value;
		if (ingredients === '') {
			return;
		}
		const fetchPromise = fetch('/api/recipes/' + ingredients + '/', {
			method: "GET",
			headers: {
				"Content-Type": "application/json"
			},
			//credentials: "same-origin"
		});
		fetchPromise.then(response => {
			return response.json();
		}).then(data => {
			console.log(data);
			if (data === '[]' || data === 'undefined') {
				this.setState({ recipes: [] });
				this.setState({ recipesFound: false });
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
			console.log(response);
			if (response.status === 200) {
				this.state.loggedIn = false;
				this.state.username = '';
				this.forceUpdate();
			}

		});
	};

	createAccount = () => {
		this.state.showLoginPage = 'true';
		//this.props.match.updateUser = this.updateUser;
		this.forceUpdate();
		
	};

	updateUser = (username) => {
		this.state.loggedIn = true;
		this.state.username = username;
		this.state.showLoginPage = false;
		console.log(this.state.username);
	};

	render() {
		return (
			<div className="App">
				<header className="App-header">
					<h1 id='title'>Whats Cooking</h1>
					{!this.state.loggedIn && <button className='user-info' id='user-button'onClick={this.createAccount}>
						Sign in/Sign up</button>}
					{this.state.loggedIn &&
						<div className='user-info'>
							<p id='user-name'>Username: {this.state.username}</p>
							<button id='user-button' onClick={this.signOut}>Sign out</button>
						</div>
					}
				</header>
				<div className="second-header">
					{this.state.showLoginPage && <LoginPage updateUser={this.updateUser} history = {this.props.history} />} 
					{!this.state.showLoginPage && <SearchForm recipes={this.getAllRecipes} />}
					
				</div>
				{!this.state.showLoginPage && <div className="allRecipesContainer">
					{this.state.recipes.map((recipe) => {
						return <RecipeBox key={recipe.id}
							id={recipe.id}
							title={recipe.title}
							cookingTime={recipe.readyInMinutes}
							servings={recipe.servings}
							image={this.baseUrl + recipe.id + '-480x360.jpg'}
							loggedIn={this.state.loggedIn}
							username={this.state.username}/>
					})}
				</div>
				}
			</div>
		);
	};
};

export default App;