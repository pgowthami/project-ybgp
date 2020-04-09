import React from 'react';
import './SearchForm.css';

const SearchForm = props => {
	return (
		<form className="submit-form" onSubmit={props.recipes}>
			<input type="text" placeholder='Enter the main ingredient' className="form-field" id="ingredients"/>
			<button type="submit" className="button-enter">Go!</button>
		</form>
	);

};
	


export default SearchForm;



