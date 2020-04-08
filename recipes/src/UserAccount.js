import React, { Component } from 'react';
import './App.css';
import './LoginPage.css';

class UserAccount extends Component {

	constructor(props) {
		super(props);
	};

	changePassword = () => {

	}



	signin = () => {

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

