import { Button, TextField } from "@mui/material";
import React from "react";
import "./Login.scss"
import history from "../../history";

export default class Login extends React.Component {
    render() {
        return (
            <div className={`login-container`}>
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
                >
                    Đăng nhập
                </Button>
            </div>
        )
    }
}