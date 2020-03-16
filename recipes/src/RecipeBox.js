import React from 'react';
import './RecipeBox.css';
import { Link } from "react-router-dom";


const RecipeBox = props => {
	return <div key={props.id} className="recipeBoxContainer">
		<div id="recipe-title">{props.title}</div>
		<img id="recipe-image" src={props.image} alt={props.title} />
		<div id="recipe-cookingTime">{props.cookingTime}</div>
		<div id="recipe-servings">{props.servings}</div>
		<button className="button-viewRecipe">
			<Link name="link-viewRecipe " to={{
				pathname: `/recipe/${props.id}`,
				state: {
					recipeId: props.id,
					cookingTime: props.cookingTime,
					servings: props.servings,
					image: props.image,
					title: props.title,
					loggedIn: props.loggedIn,
					username: props.username,
				},
				
			}}>View Recipe</Link>
		</button>
	</div>
};

export default RecipeBox;