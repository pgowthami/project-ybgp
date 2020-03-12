import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
const App = () => {

	// this is run when the page first loads
	useEffect(() => {
		console.log("page refreshed");
	}, []);


	return (
		<div className="App">
			<h1>Whats Cooking</h1>
			<form>
				<input type="text" />
				<button type="submit">Go!</button>
			</form>	
		</div>

	);
};

export default App;