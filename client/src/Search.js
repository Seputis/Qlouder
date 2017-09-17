// [START] Variables
import React, { Component } from 'react';
import firebase from 'firebase';
import axios from 'axios';
import Pagination from "react-js-pagination";
import Navbar from './Navbar';
import $ from 'jquery';
// [END]

class Search extends Component {

    constructor(props) {
        super(props);

        this.state = {
            showPagination: false,
            queryArray: [],
            activePage: 1,
            finalArray: [],
            noShow: false,
            notFound: false,
            textValue: ''
        }
    }

    // When search button is pressed, let the show begin
    handleSearch(e) {
        // Turn on CSS loader
        this.setState({ noShow: true,
                        notFound: false,
                        showPagination: false })
        // Stop all the weird tricks
        e.preventDefault();
        // Check if there are specific parameter called 'name' in the URL
        $.urlParam = name => {
            var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
            if (results==null){
                return null;
            }
            else{
                return results[1].replace(/[^a-zA-Z ]/g, "") || 0;
            }
        }
        // The search text
        const searchText = this.state.textValue.replace(/\s/g, '').toLowerCase();
        //Add search text into double quotes for the bigQuery
        // const searchValue = "\"" + searchText + "\"";
        const searchValue = searchText;
        // Check if URL contains parameter "repo"
        const oldURLString = decodeURIComponent($.urlParam('repo'));
        // If so, remove it and make the URL clean
        if(oldURLString !== null) {
            var oldURL = window.location.href;
            var index = 0;
            var newURL = oldURL;
            index = oldURL.indexOf('?');
            if(index == -1){
                index = oldURL.indexOf('#');
            }
            if(index != -1){
                newURL = oldURL.substring(0, index);
            }
            var newURLString = newURL + '?repo='+searchValue+'';
        } else {
            var newURLString = window.location.href + '?repo='+searchValue+'';
        }
        // Push the url to the browser without refreshing the page
        window.history.pushState("", "", newURLString);
        // Axios library to make GET request to the server. Calling the server side endpoint for that URL
        // and send "searchvalue" parameter, so server can make the request to bigQuery
        axios.get('/search',{
            params: {
                repo: searchValue
            }
        })
        // When finished, give the response handle to almighty function
        .then((res) =>{
            this.handleEverything(res.data.queryArray)
        })
        // this.handleEverything([{repo_name: 'testas', watch_count: 500},
        //                         {repo_name: 'testas', watch_count: 500},
        //                         {repo_name: 'testas', watch_count: 500},
        //                         {repo_name: 'testas', watch_count: 500}])
    }

    // Pagination handler
    handlePageChange(pageNumber) {
        this.setState({activePage: pageNumber});
    }

    // Almighty function. Actually, it prepares the query to be displayed and stored to Firebase Database
    handleEverything(queryArray){
        // Reinitiate the final array
        this.setState({finalArray: []})
        // Array with all the repos I think its more precise to say
        var arrayOfQueries = [];
        // Reinitialising, no reason whatsoever
        var arrayQuery = queryArray;
        // These numbers will track how to store the object in such a way that it is divided into arrays with 10 repos
        var number = 1;
        var whichPage = 1;
        var numberForPagination = 1;
        for(var x in arrayQuery) {
            // If we are still on a track with 10 repos
            if(numberForPagination<= 10){
                const repoName = arrayQuery[x].repo_name;
                const watchCount = arrayQuery[x].watch_count;
                if(repoName) {
                    arrayOfQueries.push(arrayQuery[x])
                }
                number += 1;
                numberForPagination += 1;
            } else {
                // If more than 10 repos reached, lets take previous FINAL array, push these new 10 arrays and store it
                var prevArray = this.state.finalArray;
                prevArray.push({index: whichPage, array: arrayOfQueries})
                this.setState({ finalArray: prevArray })
                // Reinitialise some numbers
                whichPage += 1;
                numberForPagination = 2;
                arrayOfQueries = [];
                // Since we are still on 10*n + 1 repo, we need to do something with it as well
                const repoName = arrayQuery[x].repo_name;
                const watchCount = arrayQuery[x].watch_count;
                if(repoName) {
                    arrayOfQueries.push(arrayQuery[x])
                }
                number += 1;
            }
            // If the query ended, but we didn't reached 10, we need to save to state what's left
            if(arrayQuery.length - 1 == x) {
                var prevArray = this.state.finalArray;
                prevArray.push({index: whichPage, array: arrayOfQueries})
                this.setState({ finalArray: prevArray})
            }
        }
        // Create an object which will be send to Firebase Database
        var obj = {
            timestamp: Date.now(),
            query: arrayQuery
        }
        if(arrayQuery.length >0) {
            this.storeQueryInDatabase(obj);
            this.setState({ showPagination: true })
        } else {
            this.setState({ notFound: true })
        }
        // Disable CSS loader
        this.setState({ noShow: false });
    }

    // Store the object into Firebase Database
    storeQueryInDatabase(obj) {
        var userId = localStorage.getItem('uid');
        firebase.database().ref('queries/' + userId).push({obj});
    }


    handleTextChange(e) {
        this.setState({ textValue: e.target.value })
    }

  render() {
        // Variable to map and show actual repos(remember, we need always to have 10)
        var thisIsTheArray = [];
        // Loop and see which array has the same index as active Page
        for(var x in this.state.finalArray){
            if(this.state.activePage == this.state.finalArray[x].index) {
                    thisIsTheArray = this.state.finalArray[x].array;
            }
        }
        var totalItemsCount = 10 * this.state.finalArray.length - 1;

    return (
        <div> {this.state.noShow ? <div className="loader"></div> :
            <div>
                <Navbar />
                <div className="container">
                    <div className="search-wrap">
                        <form onSubmit={this.handleSearch.bind(this)}>
                            <label>Search for GitHub Repositories:</label>
                            <input type="text" id="search-text" value={this.state.textValue} onChange={this.handleTextChange.bind(this)} required className="form-control"/>
                            <input type="submit" id="search-handler" value="Search" className="btn btn-success"></input>
                        </form>
                    </div>
                    {this.state.notFound ? <h4>Unfortunately, we did not find any matches with your request.</h4> : null}
                    <div className="query-results">
                        {this.state.showPagination ?
                        <div>
                        <table className="table table-striped">
                            <thead>
                                <th>#</th>
                                <th>Repo Name</th>
                                <th>Watch Count</th>
                            </thead>
                            <tbody>
                               {
                                    thisIsTheArray.map((object, i) => {
                                        return <tr key={i}>
                                            <th scope="row">{this.state.activePage == 1 ? i+1 : ((this.state.activePage - 1) * 10) + 1 + i}</th>
                                            <td>{object.repo_name}</td>
                                            <td>{object.watch_count}</td>
                                        </tr>
                                    })
                                }
                            </tbody>
                        </table>
                        <Pagination activePage={this.state.activePage} 
                            itemsCountPerPage={10}
                            totalItemsCount={totalItemsCount}
                            pageRangeDisplayed={5}
                            onChange={this.handlePageChange.bind(this)}
                        /></div> : null}
                    </div>
                </div>         
            </div>
        }
        </div>
    );
  }
}

export default Search;
