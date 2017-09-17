// [START] Variables
import React, { Component } from 'react';
import firebase from 'firebase';
import moment from 'moment';
import Pagination from "react-js-pagination";
import Navbar from './Navbar';
// [END]

class Search extends Component {

    constructor(props) {
        super(props);
        // Initialise state with all future variables, arrays etc.
        this.state = {
            arrayOfQueries: [],
            currentArray: [],
            finalArray: [],
            activePage: 1,
            showPagination: false,
            noShow: false,
            showTable: false,
            showText: false,
            activeTimestamp: ''
        }
    }

    // Function changing the active page number in the state
    handlePageChange(pageNumber) {
        this.setState({activePage: pageNumber});
    }

    // Before compenent mount(react lifecycle)
    componentWillMount() {
        // Turn on the CSS loader
        this.setState({noShow: true})
        // All the Queries from Firebase Database will be stored here 
        var arrayOfQueries = [];
        // Since I will go deeper into firebase function, I will lose my "this" context, that's why
        // creating variable "self" to be able to reference to REACT
        var self = this;
        var userId = localStorage.getItem('uid');
        return firebase.database().ref('/queries/' + userId).once('value').then(function(snapshot) {
            // Basically storing all the queries to our created array. Also adding timestamp
            const currentDatabase = snapshot.val();
            for(var x in currentDatabase) {
                var time = moment(currentDatabase[x].obj.timestamp).format("dddd, MMMM Do YYYY, h:mm:ss a");
                var query = currentDatabase[x].obj.query;
                arrayOfQueries.push({ timestamp: time, query: query })
            }
            // Callback for setting the state with all the queries. "Self" is used nicely here
            self.callback(arrayOfQueries);
        });
    }

    displayQuery(e) {
        // Taking queries from state
        var arrayOfQueries = this.state.arrayOfQueries;
        // This will be the specific query we want to show
        var selectedQuery = [];
        // Identifying timestamp and will be looping through all the queries to find the ONE
        var identifier = e.target.innerHTML;
        for(var x in arrayOfQueries) {
            if(arrayOfQueries[x].timestamp == identifier) {
                // When found, set THE array into the state
                this.setState({ currentArray: arrayOfQueries[x].query,
                                activeTimestamp: identifier,
                                showText: false })
                selectedQuery = arrayOfQueries[x].query
            }
        }
        // Callback to another function
        this.prepareForPagination(selectedQuery)
    }

    // State with all the queries from database
    callback(arrayOfQueries) {
        this.setState({ arrayOfQueries: arrayOfQueries })
        if(arrayOfQueries.length > 0) {
            this.setState({ showText: true })
        }
        this.setState({noShow: false})
    }

    // This function will prepare THE query to be displayed properly AND being able to play with pagination
    prepareForPagination(selectedQuery){
        // When pressed on another timestamp, let's reinitialise finalArray and make pagination from the beginning
        this.setState({ activePage: 1, finalArray: []})
        // ArrayOfTen meaning that this array will be shown depending on the activePage number(pagination)
        var arrayOfTen = [];
        // Just changing the variable to arrayQuery, no reason whatsoever
        var arrayQuery = selectedQuery;
        // These numbers will track how to store the object in such a way that it is divided into arrays with 10 repos
        var whichPage = 1;
        var numberForPagination = 1;
        for(var x in arrayQuery) {
            // If we are still on a track with 10 repos
            if(numberForPagination<= 10){
                const repoName = arrayQuery[x].repo_name;
                const watchCount = arrayQuery[x].watch_count;
                if(repoName) {
                    arrayOfTen.push(arrayQuery[x])
                }
                numberForPagination += 1;
            } else {
                // If more than 10 repos reached, lets take previous FINAL array, push these new 10 arrays and store it
                var prevArray = this.state.finalArray;
                prevArray.push({index: whichPage, array: arrayOfTen})
                this.setState({ finalArray: prevArray })
                // Reinitialise some numbers
                whichPage += 1;
                numberForPagination = 2;
                arrayOfTen = [];
                // Since we are still on 10*n + 1 repo, we need to do something with it as well
                const repoName = arrayQuery[x].repo_name;
                const watchCount = arrayQuery[x].watch_count;
            
                if(repoName) {
                    arrayOfTen.push(arrayQuery[x])
                }
            }
            // If the query ended, but we didn't reached 10, we need to save to state what's left
            if(arrayQuery.length - 1 == x){
                var prevArray = this.state.finalArray;
                prevArray.push({index: whichPage, array: arrayOfTen})
                this.setState({ finalArray: prevArray,
                                showPagination: true,
                                showTable: true })
            }
        }
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
        // This is for total pagination pages to show
        var totalItemsCount = this.state.currentArray.length - 1;                  

    return (
        <div>
            {this.state.noShow ? <div className="loader"></div> :
            <div>
                <Navbar />
                <div className="container">
                    <div className="row">
                        <div className="col-sm-6">
                            <h3>Queries History</h3>
                            <div className="timestamps-wrap">
                                {   this.state.arrayOfQueries.length == 0 ? <h6>No queries stored in database.</h6> :
                                    this.state.arrayOfQueries.map((anObjectMapped, i) => {
                                        return <div className={this.state.activeTimestamp == anObjectMapped.timestamp ? "active btn btn-default timestamp" : "btn btn-default timestamp"} onClick={e => this.displayQuery(e)} key={i}>{anObjectMapped.timestamp}</div>
                                    })
                                }
                            </div>
                        </div>
                        <div className="query-results col-sm-6">
                            { this.state.showTable ? 
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
                            : null }
                            { this.state.showText ? <h5 className="text-instead-table">Press one of your past queries.</h5> : null}
                            { this.state.showPagination ? 
                            <Pagination 
                                activePage={this.state.activePage} 
                                itemsCountPerPage={10}
                                totalItemsCount={totalItemsCount}
                                pageRangeDisplayed={5}
                                onChange={this.handlePageChange.bind(this)}
                            /> : null }
                        </div>
                    </div>
                </div> 
            </div> 
            }
        </div>
    );
    }
}

export default Search;
