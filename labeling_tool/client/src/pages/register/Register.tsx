import "./Register.scss"
import history from "../../history";
import { Button, TextField } from "@mui/material";
import React from "react";
import * as generalActions from "../../redux/general/actions";
import * as snackBarActions from "../../redux/snackbar/actions";
import { connect } from "react-redux";
import userAPI from "../../api/userAPI";
import { SnackBarType } from "../../utils/enumerates";

const mapDispatcherToProps =
    (dispatch: any): IRegisterPropsFromDispatch => {
        return {
            showSnackBar: (pMsg: string, pDuration: number, pType: SnackBarType) => dispatch(snackBarActions.showSnackBar(pMsg, pDuration, pType)),
            showTopLoading: () => dispatch(generalActions.showTopLoading()),
            hideTopLoading: () => dispatch(generalActions.hideTopLoading()),
        }
    }
interface IRegisterPropsFromDispatch {
    showTopLoading?: () => void;
    hideTopLoading?: () => void;
    showSnackBar?: (pMsg: string, pDuration: number, pType: SnackBarType) => void;
}
interface IRegisterState {
    email: string;
    password: string;
    fName: string;
    fNameErrMsg: string;
    emailErrMsg: string;
    passwordErrMsg: string;
    errMsg: string;
}
type IRegisterProps = IRegisterPropsFromDispatch;

class Register extends React.Component<IRegisterProps, IRegisterState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            email: "",
            password: "",
            emailErrMsg: "",
            passwordErrMsg: "",
            errMsg: "",
            fName: "",
            fNameErrMsg: "",
        }
    }
    render() {
        const { errMsg, emailErrMsg, passwordErrMsg, email, password } = this.state;
        return (
            <div className={`register-container`}>
                <img src='/fimo-logo-300x97.png' alt='fimo-logo' />
                <h1>Đăng ký</h1>
                <TextField
                    className={`tf-normal`}
                    id={`tf-username`}
                    value={email}
                    onChange={(ev) => {
                        this.setState({
                            email: ev.target.value,
                            errMsg: "",
                            emailErrMsg: "",
                        })
                    }}
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
                    type="password"
                    variant="outlined"
                />
                <TextField
                    className={`tf-password`}
                    id={`tf-username`}
                    label="Xác nhận mật khẩu"
                    type="password"
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
export default connect(null, mapDispatcherToProps)(Register);
