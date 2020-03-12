import React from 'react';


const SearchForm = props => (
	<form onSubmit={props.getRecipes}>
		<input type="text" />
		<button type="submit">Go!</button>
	</form>	
);

export default SearchForm;



