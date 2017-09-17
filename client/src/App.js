// [START] Variables
import React, { Component } from 'react';
import firebase from 'firebase';
// [END]

class App extends Component {

    // Function for logging in (Google only)
    login() {
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider).then((res) => {
            var userinfo = res.user;
            if (typeof(Storage) !== "undefined") {
                localStorage.setItem("uid", userinfo.uid);
            } else {
                console.log('nope');
            }
        });
    }

    render() {
        return (
            <div className="login-wrap">
                <div className="login-form-wrap">
                    <div className="login-form-text">
                        <h1>Assignment for Qlouder</h1>
                        <h6>Please log in with your Google Account</h6>
                    </div>
                    <button id="login-handler" onClick={this.login.bind(this)} className="btn btn-success">Login</button>
                </div>
            </div>
        );
    }
}

export default App;
