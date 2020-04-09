import React, { Component } from 'react';
import './App.css';
import './LoginPage.css';

class UserAccount extends Component {

	constructor(props) {
		super(props);
	};

	changePassword = () => {
		let password1 = document.getElementById('password1').value;
		let password2 = document.getElementById('password2').value;
		if (password1 !== '' && password2 !== '') {
			const changePswd = fetch('/changePassword/', {
				method: "POST",
				body: JSON.stringify({ password1: password1, password2: password2 }),
				headers: {
					"Content-Type": "application/json"
				},
			});
			changePswd.then(response => {
				if (response.status === 200) {
					this.props.updateUser(this.props.username);
					this.props.history.push('/');
				} else if (response.status === 404) {
					window.alert('Passwords do not match. Please try again.');
				} else if (response.status === 409) {
					window.alert('Username does not exist. Something went wrong please try again.');
				} else {
					window.alert('An error occurred. Please try again.');
				}
			});

		}

	};

	returnHome = () => {
		this.props.updateUser(this.props.username);
		this.props.history.push('/');
	}


	render() {
		return (
			<div>
				<button className='btn' id='login-back' onClick={this.returnHome}>Go back</button>
				<div className='login-form'>
					<div className='login-info'>
						<div>Sign in or Sign up</div>
						<input type="password" className="login-field" id="password1" placeholder='Enter new password' />
						<input type="password" className="login-field" id="password2" placeholder='Enter password again' />
					</div>
					<div className='login-buttons'>
						<button className='btn-login' id='sign-in' onClick={this.changePassword}>Change Password</button>
					</div>
				</div>
			</div>
		);
	};

};

export default UserAccount;

