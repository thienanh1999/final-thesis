import { Button, TextField } from "@mui/material";
import React from "react";
import "./index.scss"
import history from "../../history";
import * as generalActions from "../../redux/general/actions";
import * as snackBarActions from "../../redux/snackbar/actions";
import { connect } from "react-redux";
import userAPI from "../../api/userAPI";
import { SnackBarType } from "../../utils/enumerates";
import Utils from "../../utils/utils";

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

	componentDidMount() {
		const userName = localStorage.getItem("userFullName");
		if (!!userName) {
			this.props.showSnackBar!(
				"Phiên đăng nhập đã hết, vui lòng đăng nhập lại để tiếp tục!",
				10000,
				SnackBarType.Info
			)
		}
	}

	render() {
		const { errMsg, emailErrMsg, passwordErrMsg, email, password } = this.state;
		const { showTopLoading, hideTopLoading, showSnackBar } = this.props;
		return (
			<div className={`login-container`}>
				<img
					className={`img-logo`}
					src="/fimo-logo-300x97.png"
					alt="fimo-logo"
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
						this.setState({
							errMsg: "",
							emailErrMsg: "",
							passwordErrMsg: ""
						})
						if (!Utils.passedEmailValidation(email)) {
							this.setState({
								emailErrMsg: "Vui lòng nhập đúng định dạng email!",
							});
						} else if (password.length < 6) {
							this.setState({
								passwordErrMsg: "Mật khẩu phải chứa tối thiểu 6 ký tự!",
							});
						} else {
							showTopLoading!();
							userAPI
								.login(email, password)
								.then(res => {
									if (res.status === 200) {
										localStorage.setItem("loggedIn", "1");
										localStorage.setItem("userFullName", res.data.email);
										localStorage.setItem("accessToken", res.data.access_token)
										localStorage.setItem("refreshToken", res.data.refresh_token)
										localStorage.setItem("userId", res.data.user_id)
										localStorage.setItem("accessExpires", res.data.access_expires)
										localStorage.setItem("refreshExpires", res.data.refresh_expires)
										localStorage.setItem("isAdmin", res.data.is_superuser)
										history.push(
											res.data.is_superuser ?
												"/admin/projectmanagement" :
												"/dashboard"
										);
										showSnackBar!(
											"Chúc mừng bạn đã đăng nhập thành công!",
											10000,
											SnackBarType.Success
										)
									} else {
										this.setState({ errMsg: "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!" });
									}
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
								})
								.finally(() => hideTopLoading!())
						}
					}}
				>
					Đăng nhập
				</Button>
			</div >
		)
	}
}
export default connect(null, mapDispatcherToProps)(Login);