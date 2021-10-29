import { Button } from "@mui/material";
import React from "react";
import "./Dashboard.scss";

export default class Dashboard extends React.Component {
    render() {
        return (
            <div className={`dashboard-container`}>
                <Button
                    variant="contained"
                    className={`btn-create-new-prj`}
                >
                    Tạo dự án mới
                </Button>
                
            </div>
        )
    }
}