
import React from "react";
import "./index.scss";
import Login from "./login/Login";

export default class Main extends React.Component {
    render() {
        return (
            <div className={`main-container`}>
                <img src='/fimo-logo-300x97.png' alt='fimo-logo' />
                <Login />
            </div>
        )
    }
}