import { Button, Paper, TextField, Typography } from "@mui/material";
import React from "react";
import "./CreateProject.scss"

export default class CreateProject extends React.Component {
    render() {
        return (
            <div className={`createproject-container`}>
                <Typography
                    variant="h3"
                    component="div"
                    sx={{
                        m: "60px",
                        flexGrow: 1,
                        fontStyle: "bold"
                    }}
                >
                    Tạo dự án
                </Typography>
                <TextField
                    className={`tf-project-name tf`}
                    id={`tf-project-name`}
                    label="Tên dự án"
                    variant="outlined"
                />
                <div className={`div-upload`}>
                    <Button
                        className={`bt-upload`}
                        variant="contained"
                    >
                        Tải lên dữ liệu
                    </Button>
                    <Paper className={`pp-status`}>Chưa có dữ liệu</Paper>
                </div>
                <TextField
                    className={`tf-b1 tf`}
                    id={`tf-b1`}
                    label="Tham số b1"
                    variant="outlined"
                />
                <TextField
                    className={`tf-k tf`}
                    id={`tf-k`}
                    label="Tham số k"
                    variant="outlined"
                />
                <Button
                    className={`bt-create`}
                    variant="contained"
                >
                    Tạo dự án
                </Button>

            </div>
        )
    }
}