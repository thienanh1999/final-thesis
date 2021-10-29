
import React from "react";
import Dashboard from "./dashboard/Dashboard";
import Header from "./header/Header";
import "./index.scss";
// import Login from "./login/Login";


export default class Main extends React.Component {
    render() {
        return (
            <div className={`main-container`}>
                {/* <img src='/fimo-logo-300x97.png' alt='fimo-logo' /> */}
                <Header />
                <Dashboard />
            </div>
        )
    }
}