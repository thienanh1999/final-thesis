import { Button, TextField } from "@mui/material";
import React from "react";
import "./Login.scss"
import history from "../../history";
import axios from "axios";

export default class Login extends React.Component {
    render() {
        return (
            <div className={`login-container`}>
                <img
                    className={`img-logo`}
                    src='/fimo-logo-300x97.png'
                    alt='fimo-logo'
                />

                <h1>Đăng nhập</h1>
                <TextField
                    className={`tf-username`}
                    id={`tf-username`}
                    label="Email"
                    variant="outlined"
                />
                <TextField
                    className={`tf-password`}
                    id={`tf-username`}
                    label="Mật khẩu"
                    variant="outlined"
                />
                <p>
                    Chưa có tài khoản? <span
                        onClick={() => {
                            history.push("/register");
                        }}
                        className={`sp-register-hyperlink`}
                    >
                        Đăng ký
                    </span>
                </p>

                <Button
                    className={`bt-login`}
                    variant="contained"
                    onClick={() => {
                        axios.post(
                            "https://127.0.0.1:1337/api/auth/login",
                            {
                                "email": "anhvtt3@fimo.edu.vn",
                                "password": "thienanh1"
                            }
                        ).then((res) => console.log(res));
                    }}
                >
                    Đăng nhập
                </Button>
            </div>
        )
    }
}