import React from 'react';
import './SearchForm.css';

const SearchForm = props => {
	return (
		<form className="submit-form" onSubmit={props.recipes}>
			<input type="text" className="form-field" id="ingredients"/>
			<button type="submit" className="button-enter">Go!</button>
		</form>
	);

};
	


export default SearchForm;



