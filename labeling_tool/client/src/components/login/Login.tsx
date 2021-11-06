import { Button, TextField } from "@mui/material";
import React from "react";
import "./Login.scss"
import history from "../../history";
import * as generalActions from './../../redux/general/actions';
import * as snackBarActions from './../../redux/snackbar/actions';
import { connect } from "react-redux";
import userAPI from "../../api/userAPI";
import { SnackBarType } from "../../utils/enumerates";

const mapDispatcherToProps =
    (dispatch: any): ILoginPropsFromDispatch => {
        return {
            showSnackBar: (pMsg: string, pDuration: number, pType: SnackBarType) => dispatch(snackBarActions.showSnackBar(pMsg, pDuration, pType)),
            showTopLoading: () => dispatch(generalActions.showTopLoading()),
            hideTopLoading: () => dispatch(generalActions.hideTopLoading()),
        }
    }
interface ILoginPropsFromDispatch {
    showTopLoading?: () => void;
    hideTopLoading?: () => void;
    showSnackBar?: (pMsg: string, pDuration: number, pType: SnackBarType) => void;
}

type ILoginProps = ILoginPropsFromDispatch;
interface ILoginState {
    email: string;
    password: string;
    emailErrMsg: string;
    passwordErrMsg: string;
    errMsg: string;
}
class Login extends React.Component<ILoginProps, ILoginState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            email: "",
            password: "",
            emailErrMsg: "",
            passwordErrMsg: "",
            errMsg: "",
        }
    }
    render() {
        const { errMsg, emailErrMsg, passwordErrMsg, email, password } = this.state;
        const { showTopLoading, hideTopLoading, showSnackBar } = this.props;
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
                    value={email}
                    error={!!emailErrMsg}
                    helperText={emailErrMsg}
                    onChange={(ev) => {
                        this.setState({
                            email: ev.target.value,
                            errMsg: "",
                            emailErrMsg: "",
                        })
                    }}
                />
                <TextField
                    className={`tf-password`}
                    id={`tf-username`}
                    label="Mật khẩu"
                    type="password"
                    value={password}
                    error={!!passwordErrMsg}
                    helperText={passwordErrMsg}
                    onChange={(ev) => {
                        this.setState({
                            password: ev.target.value,
                            errMsg: "",
                            passwordErrMsg: "",
                        })
                    }}
                />
                {!!errMsg && <p style={{ color: "#d32f2f" }}>{errMsg}</p>}
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
                        showTopLoading!();
                        userAPI
                            .login(email, password)
                            .then(res => {
                                if (res.data.result === 201) {
                                    localStorage.setItem('loggedIn', "1");
                                    localStorage.setItem('userFullName', res.data.email);
                                    history.push("/dashboard");
                                } else {
                                    this.setState({ errMsg: "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!" });
                                }
                                hideTopLoading!();
                                showSnackBar!(
                                    "Đăng nhập thành công!",
                                    2000,
                                    SnackBarType.Success
                                )
                            })
                            .catch(err => {
                                if (
                                    !!err
                                    && !!err.message
                                ) {
                                    if (typeof err.message === "string") {
                                        this.setState({ errMsg: err.message });
                                    }
                                    if (!!err.message.email) {
                                        if (typeof err.message.email === "string") {
                                            this.setState({ emailErrMsg: err.message.email });
                                        }
                                        if (
                                            typeof err.message.email === "object"
                                            && err.message.email.length > 0) {
                                            this.setState({ emailErrMsg: err.message.email[0] });
                                        }
                                    }
                                    if (!!err.message.password) {
                                        if (typeof err.message.password === "string") {
                                            this.setState({ passwordErrMsg: err.message.password });
                                        }
                                        if (
                                            typeof err.message.password === "object"
                                            && err.message.password.length > 0) {
                                            this.setState({ passwordErrMsg: err.message.password[0] });
                                        }
                                    }
                                } else {
                                    this.setState({ errMsg: "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!" });
                                }
                                hideTopLoading!();
                            })
                    }}
                >
                    Đăng nhập
                </Button>
            </div>
        )
    }
}
export default connect(null, mapDispatcherToProps)(Login);