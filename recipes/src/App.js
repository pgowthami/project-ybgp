import React, { useEffect, Component, useState } from 'react';
import './App.css';
import SearchForm from './SearchForm.js';
class App extends Component {

	// this is run when the page first loads
	/*
	useEffect(() => {
		console.log("page refreshed");
	}, []);
	*/
	/*
	const getRecipes = () => {
		console.log("hello");
	};
	*/

	apiKey = "ee29c579c7af4db59e00ba30158a11a9";
	state = {
		recipes: []
	};

	getRecipes = (e) => {
		e.preventDefault();
		//const ingredients = e.target.elements.ingredients.value;
		const ingredients = document.getElementById('ingredients').value;
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
			this.setState({ recipes: (JSON.parse(data)).results });
		});

	};

	render() {
		return (
			<div className="App">
				<h1>Whats Cooking</h1>
				<SearchForm recipes={this.getRecipes} />
				{this.state.recipes.map((recipe) => {
					return <p key={recipe.id}>{recipe.title}</p>
				})};
			</div>
		);
	};
	
};

export default App;