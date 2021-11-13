import "./Register.scss"
import history from "../../history";
import { Button, TextField } from "@mui/material";
import React from "react";

export default class Register extends React.Component {
    render() {
        return (
            <div className={`register-container`}>
                <img src='/fimo-logo-300x97.png' alt='fimo-logo' />
                <h1>Đăng ký</h1>
                <TextField
                    className={`tf-normal`}
                    id={`tf-username`}
                    label="Email"
                    variant="outlined"
                />
                <TextField
                    className={`tf-normal`}
                    id={`tf-full-name`} 
                    label="Họ và tên"
                    variant="outlined"
                />
                <TextField
                    className={`tf-normal`}
                    id={`tf-phone`}
                    label="Số điện thoại"
                    variant="outlined"
                />
                <TextField
                    className={`tf-password`}
                    id={`tf-username`}
                    label="Mật khẩu"
                    variant="outlined"
                />
                <TextField
                    className={`tf-password`}
                    id={`tf-username`}
                    label="Xác nhận mật khẩu"
                    variant="outlined"
                />
                <p>
                    Đã có tài khoản? <span
                        onClick={() => {
                            history.push("/login");
                        }}
                        className={`sp-login-hyperlink`}
                    >
                        Đăng nhập
                    </span>
                </p>
                <Button
                    className={`bt-login`}
                    variant="contained"
                >
                    Đăng ký tài khoản
                </Button>
            </div>
        )
    }
}