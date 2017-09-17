// [START] Variables
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Redirect, Switch } from 'react-router';
import { BrowserRouter } from 'react-router-dom'
import './index.css';
import firebase from 'firebase';
import App from './App';
import Search from './Search';
import HistoryComp from './History';

const app = document.getElementById('root');

// [END]

// Initialize Firebase
const config = {
    apiKey: "AIzaSyCFTKtPSbFTkfpdwW_V6petpE3xfceCAbU",
    authDomain: "qlouder-c2c18.firebaseapp.com",
    databaseURL: "https://qlouder-c2c18.firebaseio.com",
    storageBucket: "qlouder-c2c18.appspot.com",
    };
firebase.initializeApp(config);


      // Check authentication and determine routing
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                // If user is authenticated, do not let him route anywhere else except /search(all its subroutes)
                // and /history
                ReactDOM.render(
                    <BrowserRouter>
                        <div>
                            <Route exact path="/" component={App}/>
                            <Switch>
                                <Route path="/search" component={Search}/>
                                <Route path="/history" component={HistoryComp}/>
                                <Redirect from="*" to="/search"/>
                            </Switch>
                        </div>
                    </BrowserRouter>, app
                )
            } else {
                // If not authenticated, only home route which is '/', otherwise redirect
                ReactDOM.render(
                    <BrowserRouter>
                        <div>
                            <Route path="/" component={App}/>
                            <Redirect from="*" to="/"/>
                        </div>
                    </BrowserRouter>, app
                )
            }
        });