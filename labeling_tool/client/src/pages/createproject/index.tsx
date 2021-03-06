import { Box, Button, Link, Paper, Stack, TextField, Typography } from "@mui/material";
import React from "react";
import "./index.scss"
import * as generalActions from "../../redux/general/actions";
import * as snackBarActions from "../../redux/snackbar/actions";
import { SnackBarType } from "../../utils/enumerates";
import { connect } from "react-redux";
import projectAPI from "../../api/projectAPI";
import history from "../../history";

const mapDispatcherToProps =
	(dispatch: any): ICreateProjectPropsFromDispatch => {
		return {
			showSnackBar: (pMsg: string, pDuration: number, pType: SnackBarType) => dispatch(snackBarActions.showSnackBar(pMsg, pDuration, pType)),
			showTopLoading: () => dispatch(generalActions.showTopLoading()),
			hideTopLoading: () => dispatch(generalActions.hideTopLoading()),
		}
	}

interface ICreateProjectPropsFromDispatch {
	showTopLoading?: () => void;
	hideTopLoading?: () => void;
	showSnackBar?: (pMsg: string, pDuration: number, pType: SnackBarType) => void;
}

type ICreateProjectProps = ICreateProjectPropsFromDispatch;
interface ICreateProjectState {
	prjName: string;
	prjDesc: string;
	prjK: string;
	prjB1: string;
	prjEsId: string;
	prjSeqHL: string;
	prjMinTabRowHL: string;
	prjMaxTabRowHL: string;
	prjEsIdErrMsg: string;
	prjNameErrMsg: string;
	pickedFile: any;
	pickedFileName: string;
}

class CreateProject extends React.Component<ICreateProjectProps, ICreateProjectState> {
	constructor(props: ICreateProjectProps) {
		super(props);
		this.state = {
			prjName: "",
			prjDesc: "",
			prjK: "",
			prjB1: "",
			prjEsId: "",
			prjSeqHL: "",
			prjMinTabRowHL: "",
			prjMaxTabRowHL: "",
			prjNameErrMsg: "",
			prjEsIdErrMsg: "",
			pickedFile: undefined,
			pickedFileName: "",
		}
	}
	render() {
		const {
			prjName,
			prjDesc,
			prjK,
			prjB1,
			prjEsId,
			prjSeqHL,
			prjMinTabRowHL,
			prjMaxTabRowHL,
			prjEsIdErrMsg,
			prjNameErrMsg,
			pickedFile,
			pickedFileName,
		} = this.state;
		return (
			<div className={`createproject-container`}>
				<Paper elevation={1} sx={{
					width: "80%",
					height: "80%",
					m: "20px auto",
					pr: 5, pl: 5, pt: 3, pb: 3,
					textAlign: "start",
					flexDirection: "column",
					display: "flex",
				}}>
					<Typography
						variant="h5"
						component="div"
						sx={{
							mb: 2,
							flexGrow: 1,
							color: "#605F5F",
							fontStyle: "bold",
							fontWeight: 500
						}}
					>
						T???o d??? ??n
					</Typography>
					<TextField
						fullWidth
						className={`tf-project-name tf`}
						required
						id={`tf-project-name`}
						label="T??n d??? ??n"
						variant="outlined"
						value={prjName}
						onChange={(newVal) => this.setState({ prjName: newVal.target.value })}
						error={!!prjNameErrMsg}
						helperText={prjNameErrMsg}
					/>
					<TextField
						fullWidth
						multiline
						rows={3}
						sx={{ mt: 2, mb: 2 }}
						className={`tf-desc tf`}
						id={`tf-desc`}
						label="M?? t??? chi ti???t"
						variant="outlined"
						value={prjDesc}
						onChange={(newVal) => this.setState({ prjDesc: newVal.target.value })}
					/>
					<Stack direction={"row"}>

						<TextField
							sx={{ mb: 2, mr: 2, width: "145px" }}
							type="number"
							required
							className={`tf-b1 tf`}
							id={`tf-b1`}
							label="Tham s??? b1"
							variant="outlined"
							value={prjB1}
							onChange={(newVal) => this.setState({ prjB1: newVal.target.value })}
						/>
						<TextField
							sx={{ mb: 2, mr: 2, width: "135px" }}
							required
							className={`tf-k tf`}
							type="number"
							id={`tf-k`}
							label="Tham s??? k"
							variant="outlined"
							value={prjK}
							onChange={(newVal) => this.setState({ prjK: newVal.target.value })}
						/>
						<TextField
							sx={{ mb: 2, mr: 2, width: "200px" }}
							required
							className={`tf-es-id tf`}
							id={`tf-es-id`}
							label="Elasticsearch Index"
							variant="outlined"
							value={prjEsId}
							error={!!prjEsIdErrMsg}
							helperText={prjEsIdErrMsg}
							onChange={(newVal) => this.setState({ prjEsId: newVal.target.value })}
						/>
						<TextField
							sx={{ mb: 2, mr: 2, width: "265px" }}
							required
							className={`tf-highlighted-sentence tf`}
							id={`tf-highlighted-sentence`}
							type="number"
							label="S??? l?????ng c??u ???????c ????nh d???u"
							variant="outlined"
							onChange={(newVal) => this.setState({ prjSeqHL: newVal.target.value })}
							value={prjSeqHL}
						/>
					</Stack>
					<Stack direction={"row"}>
						<TextField
							sx={{ mb: 2, mr: 2, width: "420px" }}
							required
							className={`tf-highlighted-table tf`}
							id={`tf-highlighted-table`}
							type="number"
							label="S??? l?????ng h??ng t???i thi???u trong b???ng ???????c ????nh d???u"
							value={prjMinTabRowHL}
							variant="outlined"
							onChange={(newVal) => this.setState({ prjMinTabRowHL: newVal.target.value })}
						/>
						<TextField
							sx={{ mb: 2, mr: 2, width: "405px" }}
							required
							className={`tf-highlighted-table tf`}
							id={`tf-highlighted-table`}
							type="number"
							label="S??? l?????ng h??ng t???i ??a trong b???ng ???????c ????nh d???u"
							value={prjMaxTabRowHL}
							variant="outlined"
							onChange={(newVal) => this.setState({ prjMaxTabRowHL: newVal.target.value })}
						/>
					</Stack>
					<Typography
						variant="body1"
						component="p"
						sx={{
							color: "#605F5F",
							mb: 2,
							mt:2
						}}
					>
						????? t???i d??? li???u cho d??? ??n , vui l??ng l???a ch???n t???p tin JSON t??? thi???t b??? c???a b???n v?? ?????m b???o d??? li???u trong t???p tin l?? ????ng ?????nh d???ng.
					</Typography>
					<Typography
						variant="body1"
						component="p"
						sx={{
							color: "#605F5F",
							mb: 2,
						}}
					>
						Tham kh???o th??ng tin v??? ?????nh d???ng d??? li???u c???a h??? th???ng&nbsp;
						<span>
							<Link onClick={() => {
								window.open("/dataformatinfo")
							}} underline="hover">t???i ????y</Link>
						</span>
					</Typography>
					<div className={`div-upload`}>

						<label htmlFor="input-upload">
							<input
								accept=".json"
								id="input-upload"
								name="input-upload"
								style={{ display: 'none' }}
								type="file"
								onChange={this.onUploadFileChanged}
							/>
							<Button
								sx={{ background: "#03A9F5" }}
								// color={"success"}
								className={`bt-upload`}
								variant="contained"
								component="span"
							>
								T???i l??n d??? li???u
							</Button>

						</label>

						<Paper className={`pp-status`}>
							{
								(pickedFile && !!pickedFileName) ?
									pickedFileName : "Ch??a c?? d??? li???u"
							}
						</Paper>
					</div>
					<Box sx={{ flexGrow: 10, display: 'block' }} />
					<Stack direction={"row"}>
						<Button
							sx={{ mr: 2 }}
							color={"success"}
							className={`bt-create`}
							variant="contained"
							onClick={() => { history.push("/dashboard"); }}
						>
							Quay l???i
						</Button>
						<Button
							className={`bt-create`}
							variant="contained"
							onClick={() => {
								//TODO: validation
								this.props.showTopLoading!();
								projectAPI.createPrj(
									prjName,
									prjDesc,
									prjK,
									prjB1,
									prjSeqHL,
									prjMinTabRowHL,
									prjMaxTabRowHL,
									prjEsId,
									pickedFile
								).then((res: any) => {
									console.log(res)
									if (res.status === 201) {
										history.push("/");
										this.props.showSnackBar!("Kh???i t???o d??? ??n th??nh c??ng!", 10000, SnackBarType.Success);
									} else {
										this.props.showSnackBar!("Kh???i t???o d??? ??n th???t b???i! " + res.data.message, 10000, SnackBarType.Error);
									}
								}).catch((err: any) => {
									console.log(err)
									if (!!err.errors && err.errors.es_id && Array.isArray(err.errors.es_id)) {
										this.setState({ prjEsIdErrMsg: err.errors.es_id[0] });
									}
									if (!!err.errors && err.errors.name && Array.isArray(err.errors.es_id)) {
										this.setState({ prjNameErrMsg: err.errors.name[0] });
									}
									this.props.showSnackBar!("Kh???i t???o d??? ??n th???t b???i! ", 10000, SnackBarType.Error);
								}).finally(() => this.props.hideTopLoading!())
							}}
						>
							T???o d??? ??n
						</Button>
					</Stack>
				</Paper>
			</div>
		)
	}
	private onUploadFileChanged = (ev: any) => {
		if (
			ev &&
			ev.target &&
			ev.target.files &&
			ev.target.files.length > 0 &&
			ev.target.files[0].name.includes(".json")
		) {
			this.setState({
				pickedFile: ev.target.files[0],
				pickedFileName: ev.target.files[0].name
			});
		} else {
			this.props.showSnackBar!("T???i l??n t???p tin JSON th???t b???i. Vui l??ng ki???m tra l???i ?????nh d???ng t???p tin.", 10000, SnackBarType.Error);
		}
	}
}

export default connect(null, mapDispatcherToProps)(CreateProject);
