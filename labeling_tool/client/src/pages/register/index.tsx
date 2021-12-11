import "./index.scss"
import history from "../../history";
import { Button, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField } from "@mui/material";
import React from "react";
import * as generalActions from "../../redux/general/actions";
import * as snackBarActions from "../../redux/snackbar/actions";
import { connect } from "react-redux";
import userAPI from "../../api/userAPI";
import { GenderType, SnackBarType } from "../../utils/enumerates";

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
    confirmPassword: string;
    confirmPasswordErrMsg: string;
    gender: GenderType;
    phone: string;
    phoneErrMsg: string;
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
            phoneErrMsg: "",
            errMsg: "",
            fName: "",
            fNameErrMsg: "",
            confirmPassword: "",
            confirmPasswordErrMsg: "",
            gender: GenderType.Male,
            phone: "",
        }
    }
    render() {
        const {
            email, password, fName, confirmPassword,
            errMsg, confirmPasswordErrMsg, gender, phone,
            phoneErrMsg
        } = this.state;
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
                    value={fName}
                    onChange={(ev) => {
                        this.setState({
                            fName: ev.target.value,
                            errMsg: "",
                            fNameErrMsg: "",
                        })
                    }}
                    variant="outlined"
                />
                <Stack direction={"row"}>
                    <TextField
                        sx={{ width: "300px" }}
                        // className={`tf-normal`}
                        id={`tf-phone`}
                        label="Số điện thoại"
                        variant="outlined"
                        value={phone}
                        onChange={(ev) => this.setState({
                            phone: ev.target.value,
                            errMsg: "",
                            phoneErrMsg: ""
                        })}
                    />
                    <FormControl sx={{ width: "100px", ml: 2 }}>
                        <InputLabel id="label-select-gender">Giới tính</InputLabel>
                        <Select
                            labelId="select-gender"
                            id="select-gender"
                            value={gender}
                            label="gender"
                            onChange={(ev) => {
                                this.setState({
                                    gender: ev.target.value as GenderType,
                                });
                            }}
                        >
                            <MenuItem value={GenderType.Male}>Nam</MenuItem>
                            <MenuItem value={GenderType.Female}>Nữ</MenuItem>
                            <MenuItem value={GenderType.NonBinary}>Khác</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>


                <TextField
                    className={`tf-password`}
                    id={`tf-username`}
                    label="Mật khẩu"
                    type="password"
                    variant="outlined"
                    value={password}
                    onChange={(ev) => {
                        this.setState({
                            password: ev.target.value,
                            errMsg: "",
                            passwordErrMsg: "",
                        })
                    }}
                />
                <TextField
                    className={`tf-password`}
                    id={`tf-username`}
                    label="Xác nhận mật khẩu"
                    type="password"
                    variant="outlined"
                    value={confirmPassword}
                    error={!!confirmPasswordErrMsg}
                    helperText={confirmPasswordErrMsg}
                    onChange={(ev) => {
                        this.setState({
                            confirmPassword: ev.target.value,
                            errMsg: "",
                            confirmPasswordErrMsg: "",
                        })
                    }}
                />
                {!!errMsg && <p style={{ color: "#d32f2f" }}>{errMsg}</p>}
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
                    onClick={() => {
                        if (password !== confirmPassword) {
                            this.setState({ confirmPasswordErrMsg: "Mật khẩu không trùng khớp, vui lòng kiểm tra lại!" })
                        } else {
                            this.props.showTopLoading!();
                            userAPI.register(email, fName, password, phone, gender).then((res: any) => {
                                console.log(res)
                                if (res.data && res.status === 201) {
                                    history.push("/login");
                                    this.props.showSnackBar!("Chúc mừng! Bạn đã đăng ký thành công", 10000, SnackBarType.Success);
                                } else {
                                    this.setState({ errMsg: res.data.message });
                                }
                            }).catch((err: any) => {
                                this.setState({ errMsg: err.message })
                            }).finally(() => this.props.hideTopLoading!())
                        }
                    }}
                >
                    Đăng ký tài khoản
                </Button>
            </div >
        )
    }
}
export default connect(null, mapDispatcherToProps)(Register);
