import "./index.scss"
import history from "../../history";
import { Button, FormControl, InputLabel, MenuItem, Select, Stack, TextField } from "@mui/material";
import React from "react";
import * as generalActions from "../../redux/general/actions";
import * as snackBarActions from "../../redux/snackbar/actions";
import { connect } from "react-redux";
import userAPI from "../../api/userAPI";
import { GenderType, SnackBarType } from "../../utils/enumerates";
import Utils from "../../utils/utils";

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
			phoneErrMsg, emailErrMsg, fNameErrMsg, passwordErrMsg
		} = this.state;
		return (
			<div className={`register-container`}>
				<img src='/fimo-logo-300x97.png' alt='fimo-logo' />
				<h1>????ng k??</h1>
				<TextField
					className={`tf-normal`}
					id={`tf-username`}
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
					label="Email"
					variant="outlined"
				/>
				<TextField
					className={`tf-normal`}
					id={`tf-full-name`}
					label="H??? v?? t??n"
					value={fName}
					error={!!fNameErrMsg}
					helperText={fNameErrMsg}
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
						id={`tf-phone`}
						error={!!phoneErrMsg}
						helperText={phoneErrMsg}
						label="S??? ??i???n tho???i"
						variant="outlined"
						value={phone}
						onChange={(ev) => this.setState({
							phone: ev.target.value,
							errMsg: "",
							phoneErrMsg: ""
						})}
					/>
					<FormControl sx={{ width: "100px", ml: 2 }}>
						<InputLabel id="label-select-gender">Gi???i t??nh</InputLabel>
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
							<MenuItem value={GenderType.Female}>N???</MenuItem>
							<MenuItem value={GenderType.NonBinary}>Kh??c</MenuItem>
						</Select>
					</FormControl>
				</Stack>


				<TextField
					className={`tf-password`}
					id={`tf-username`}
					label="M???t kh???u"
					type="password"
					variant="outlined"
					error={!!passwordErrMsg}
					helperText={passwordErrMsg}
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
					label="Nh???p l???i m???t kh???u"
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
					???? c?? t??i kho???n? <span
						onClick={() => {
							history.push("/login");
						}}
						className={`sp-login-hyperlink`}
					>
						????ng nh???p
					</span>
				</p>
				<Button
					className={`bt-login`}
					variant="contained"
					onClick={() => {
						if (this.passedFormValidation()) {
							this.props.showTopLoading!();
							userAPI.register(email, fName, password, phone, gender).then((res: any) => {
								console.log(res)
								if (res.data && res.status === 201) {
									history.push("/login");
									this.props.showSnackBar!("Ch??c m???ng! B???n ???? ????ng k?? th??nh c??ng", 10000, SnackBarType.Success);
								} else {
									this.setState({ errMsg: "Email ho???c s??? ??i???n tho???i n??y ???? t???n t???i!" });
								}
							}).catch((_: any) => {
								this.setState({ errMsg: "Email ho???c s??? ??i???n tho???i n??y ???? t???n t???i!" })
							}).finally(() => this.props.hideTopLoading!())
						}
					}}
				>
					????ng k?? t??i kho???n
				</Button>
			</div >
		)
	}

	private passedFormValidation = (): boolean => {
		const { email, fName, phone, password, confirmPassword } = this.state;

		let passed = true;

		if (password.length < 6) {
			passed = false;
			this.setState({
				passwordErrMsg: "M???t kh???u ph???i d??i ??t nh???t 6 k?? t???",
			});
		} else if (password !== confirmPassword) {
			passed = false;
			this.setState({
				confirmPasswordErrMsg: "M???t kh???u x??c nh???n kh??ng tr??ng kh???p!"
			})
		}

		if (!Utils.passedEmailValidation(email)) {
			passed = false;
			this.setState({
				emailErrMsg: "Vui l??ng nh???p ????ng ?????nh d???ng email!",
			})
		}

		if (fName.length < 6) {
			passed = false;
			this.setState({
				fNameErrMsg: "Vui l??ng nh???p h??? t??n ?????y ????? t???i thi???u 6 k?? t???"
			})
		}

		if (phone.length < 10) {
			passed = false;
			this.setState({
				phoneErrMsg: "Vui l??ng nh???p ????ng s??? ??i???n tho???i, t???i thi???u 10 ch??? s???"
			})
		}

		return passed;
	}
}
export default connect(null, mapDispatcherToProps)(Register);
