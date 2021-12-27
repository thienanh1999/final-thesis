
import React from "react";
import history from "../history";
import "./index.scss";

export default class Main extends React.Component {
    componentDidMount() {
        const loggedIn = localStorage.getItem('loggedIn')
        const isAdmin = localStorage.getItem('isAdmin')
        if (loggedIn === "1") history.push(isAdmin === "true" ? "/admin/projectmanagement" : "/dashboard"); else history.push("/login")
    }
    render() {
        return (
            <div className={`main-container`}>
            </div>
        )
    }
}