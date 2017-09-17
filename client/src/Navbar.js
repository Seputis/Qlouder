// [START] Variables
import React, { Component } from 'react';
import firebase from 'firebase';
// [END]

class Navbar extends Component {

    constructor(props) {
        super(props);

        this.state = {
            active: ''
        }
    }

    // Before Element mounted
    componentWillMount() {
        // Weird technique to check the first part(word) of URL after .com extension(after slash)
        const activeLink = window.location.pathname.replace(/^\/([^\/]*).*$/, '$1') + '-link';
        this.setState({active: activeLink})
    }

    // Logout from the app(auto redirect to home path)
    logout() {
        firebase.auth().signOut();
    }

    // Change classnames
    handleClick(e) {
        this.setState({ active: e.target.parentNode.id })
    }

    render() {
        return(
            <nav className="navbar navbar-default">
                <div className="container">
                    <div className="navbar-header">
                    <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
                        <span className="sr-only">Toggle navigation</span>
                        <span className="icon-bar"></span>
                        <span className="icon-bar"></span>
                        <span className="icon-bar"></span>
                    </button>
                    <a className="navbar-brand" href="/search">Qlouder</a>
                    </div>
                    <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                    <ul className="nav navbar-nav">
                        <li id="search-link" onClick={e => this.handleClick(e)} className={this.state.active == 'search-link' ? "active" : ''}><a href="/search">Search<span className="sr-only">(current)</span></a></li>
                        <li id="history-link" onClick={e => this.handleClick(e)} className={this.state.active == 'history-link' ? "active" : ''}><a href="/history">History</a></li>
                    </ul>
                    <ul className="nav navbar-nav navbar-right">
                        <li onClick={this.logout.bind(this)}><a href="#" id="logout">Logout</a></li>
                    </ul>
                    </div>
                </div>
            </nav>
        )
    }
}

export default Navbar;
           
           
           
           
           
