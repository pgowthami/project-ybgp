import React, { Component } from 'react';
import './App.css';

class LoginPage extends Component {

	constructor(props, { match }) {
		super(props);
	};

	componentDidMount = () => {
		console.log();
	}
	signup = () => {
		let username = document.getElementById('username').value;
		let password = document.getElementById('password').value;

		const signUp = fetch('/signup/', {
			method: "POST",
			body: JSON.stringify({ username: username, password: password }),
			headers: {
				"Content-Type": "application/json"
			},
			credentials: "same-origin"
		});
		signUp.then(response => {
			if (response.status === 200) {
				this.props.updateUser(username);
				this.props.history.push('/');
			} else {
				//alert
			}
		});
	};

	signin = () => {
		let username = document.getElementById('username').value;
		let password = document.getElementById('password').value;
		const signIn = fetch('/signin/', {
			method: "POST",
			body: JSON.stringify({ username: username, password: password }),
			headers: {
				"Content-Type": "application/json"
			},
			credentials: "same-origin"
		});
		signIn.then(response => {
			if (response.status === 200) {
				console.log(this.props);
				console.log(this.props.updateUser);
				this.props.updateUser(username);
				this.props.history.push('/');
			} else {
				//alert(login failed);
			}
			
		});
	};

	render() {
		return (
			<div>
				<input type="text" className="form-field" id="username" />
				<input type="password" className="form-field" id="password" />
				<button id='user-button' onClick={this.signin}>Sign in</button>
				<button id='user-button' onClick={this.signup}>Sign up</button>
			</div>
		);
	};

};

export default LoginPage;
		
