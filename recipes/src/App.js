import React, {Component} from 'react';
import './App.css';
import SearchForm from './SearchForm.js';
import RecipeBox from './RecipeBox.js';
import LoginPage from './LoginPage.js';
import { Route } from 'react-router-dom';
import Recipe from './Recipe.js';

import './RecipeBox.css'


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

	componentDidMount = () => {
		// executed if user logs out
		if (this.props.location.state) {
			this.removeUser();
			//this.setState({ recipes: [], username: this.props.location.state.username, loggedIn: this.props.location.state.loggedIn })
		}
	}

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
				this.setState({ loggedIn: false });
				this.setState({ username: '' });
				this.forceUpdate();
			}

		});
	};

	createAccount = () => {
		this.setState({ showLoginPage: true });
		this.forceUpdate();
		
	};

	updateUser = (username) => {
		this.setState({ loggedIn: true });
		this.setState({ username: username });
		this.setState({ showLoginPage: false });
	};

	removeUser = () => {
		this.setState({ loggedIn: false });
		this.setState({ username: '' });
		this.setState({ showLoginPage: false });
	}

	render() {
		console.log(this.props.history);
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
				<Route path="/recipe/:id" render={(props) => <Recipe {...props} removeUser={this.removeUser} />} />
				{!this.state.showLoginPage && <div className="allRecipesContainer">
					{this.state.recipes.map((recipe) => {
						return <RecipeBox key={recipe.id}
							id={recipe.id}
							title={recipe.title}
							cookingTime={recipe.readyInMinutes}
							servings={recipe.servings}
							image={this.baseUrl + recipe.id + '-480x360.jpg'}
							loggedIn={this.state.loggedIn}
							username={this.state.username}
							history={JSON.stringify(this.props.history)} />
					})}
				</div>
				}
			</div>
		);
	};
};

export default App;