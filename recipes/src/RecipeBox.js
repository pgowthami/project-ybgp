import React from 'react';
import './RecipeBox.css';
import { Link } from "react-router-dom";


const RecipeBox = props => {
	return <div key={props.id} className="recipeBoxContainer">
		<div id="recipe-title">{props.title}</div>
		<img id="recipe-image" src={props.image} alt={props.title} />
		<div id="recipe-cookingTime">Cooking time: {props.cookingTime} mins</div>
		<div id="recipe-servings">Servings: {props.servings}</div>
		<button className="button-viewRecipe">
			<Link name="link-viewRecipe" style={{ textDecoration: 'none', color: 'black'}} to={{
				pathname: `/recipe/${props.id}`,
				state: {
					recipeId: props.id,
					cookingTime: props.cookingTime,
					servings: props.servings,
					image: props.image,
					title: props.title,
					loggedIn: props.loggedIn,
					username: props.username,
					history: props.history,
					showBackButton: props.showBackButton
				},
				
			}}>View Recipe</Link>
		</button>
	</div>
};

export default RecipeBox;