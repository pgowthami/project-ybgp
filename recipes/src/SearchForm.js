import React from 'react';


const SearchForm = props => {
	return (
		<form onSubmit={props.recipes}>
			<input type="text" id="ingredients"/>
			<button type="submit">Go!</button>
		</form>
	);

};
	


export default SearchForm;



