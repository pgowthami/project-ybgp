import React, { Component } from 'react';
import { Link } from "react-router-dom";
import './App.css';


class Recipe extends Component {
	recipeId= '';
	state = {
		instructions: [],
		ingredients: [],
		loggedIn:false,
		username:''
	};

	componentDidMount = () => {
		this.recipeId = this.props.location.state.recipeId;

		this.setState({loggedIn: this.props.location.state.loggedIn});
		this.setState({ username: this.props.location.state.username});

		this.getIngredients();
		this.getInstructions();
		
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

	// To-do
	signOut = () => {
		//return <Redirect to='/' push={true} />;
		/*
		this.props.location.state.loggedIn = false;
		this.props.location.state.username = '';
		*/
		console.log(JSON.parse(this.props.location.state.history));
		let history = (JSON.parse(this.props.location.state.history));
		console.log(history);
		//history.push('/');
		
	}

	render() {
		return (
			<div className="App">
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
				<h2>{this.props.location.state.title}</h2>
				<img src={this.props.location.state.image} alt={this.props.location.state.title}/>
				<h3>Cooking time: {this.props.location.state.cookingTime}</h3>
				<h3>Servings: {this.props.location.state.servings}</h3>
				<h3>Ingredients</h3>
					<ol>
						{this.state.ingredients.map((ingredient, index) => {
							return <li key={index}>{ingredient.originalString}</li>
						})}
					</ol>
				<h3>Instructions</h3>
					<ol>
						{this.state.instructions.map((step, index) => {
							return <li key={index}>{step['step']}</li>
						})}
					</ol>
				</div>

		);
    };
};


export default Recipe;
