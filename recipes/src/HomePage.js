import React from 'react';
import RecipeBox from './RecipeBox.js';
import './HomePage.css';

const HomePage = props => {
	return (
		<div className='homepage-display'>
			<div id='user-favourites'>
				<div className='homepage-headings'>Your Recent Favourites!</div>
				<div id='favourite-message'></div>
				{props.userFavourites.map((recipe) => {
					return <RecipeBox key={recipe.recipeId}
						id={recipe.recipeId}
						title={recipe.title}
						cookingTime={recipe.readyInMinutes}
						servings={recipe.servings}
						image={props.baseUrl + recipe.recipeId + '-312x231.jpg'}
						loggedIn={props.loggedIn}
						username={props.username}
						history={JSON.stringify(props.history)}
						showBackButton={false} />
				})}
			</div>
			<div id='user-suggestions'>
				<div className='homepage-headings'>Try these top-rated recipes!</div>
				{props.userSuggestions.map((recipe) => {
					return <RecipeBox key={recipe.recipeId}
						id={recipe.recipeId}
						title={recipe.title}
						cookingTime={recipe.readyInMinutes}
						servings={recipe.servings}
						image={props.baseUrl + recipe.recipeId + '-312x231.jpg'}
						loggedIn={props.loggedIn}
						username={props.username}
						history={JSON.stringify(props.history)}
						showBackButton={false} />
				})}
			</div>
		</div>
	);
};



export default HomePage;


