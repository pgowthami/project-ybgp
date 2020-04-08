import React, { Component } from 'react';
import './App.css';
import './LoginPage.css';

class LoginPage extends Component {

	constructor(props) {
		super(props);
	};

	signup = () => {
		let username = document.getElementById('username').value;
		let password = document.getElementById('password').value;
		if (username !== '' && password !== '') {
			if (username.length > 10) {
				window.alert('Username must be less than 10 characters');
			}
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
				} else if (response.status === 409) {
					window.alert('Username is taken. Please choose another one.')
				} else {
					window.alert('An error occurred. Please try again.');
				}
			});
		}
	};

	signin = () => {
		let username = document.getElementById('username').value;
		let password = document.getElementById('password').value;
		if (username !== '' && password !== '') {
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
				} else if (response.status === 401) {
					window.alert('Incorrect password. Access denied.');
				} else if (response.status === 409) {
					window.alert('Username does not exisit. Please sign up first.')
				} else {
					window.alert('An error occurred. Please try again.');
				}
			});
		}
		
	};

	returnHome = () => {
		this.props.updateUser('');
		this.props.history.push('/');
	}


	render() {
		return (
			<div>
				<button className='btn' id='login-back' onClick={this.returnHome}>Go back</button>
				<div className='login-form'>
					<div className='login-info'>
						<div>Sign in or Sign up</div>
						<input type="text" className="login-field" id="username" placeholder='Username' />
						<input type="password" className="login-field" id="password" placeholder='Password'/>
					</div>
					<div className='login-buttons'>
						<button className='btn-login' id='sign-in' onClick={this.signin}>Sign in</button>
						<button className='btn-login' id='sign-up' onClick={this.signup}>Sign up</button>
					</div>
				</div>
			</div>
		);
	};

};

export default LoginPage;
		
