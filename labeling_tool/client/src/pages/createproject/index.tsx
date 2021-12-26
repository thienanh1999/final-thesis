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
						Tạo dự án
					</Typography>
					<TextField
						fullWidth
						className={`tf-project-name tf`}
						required
						id={`tf-project-name`}
						label="Tên dự án"
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
						label="Mô tả chi tiết"
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
							label="Tham số b1"
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
							label="Tham số k"
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
							label="Số lượng câu được đánh dấu"
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
							label="Số lượng hàng tối thiểu trong bảng được đánh dấu"
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
							label="Số lượng hàng tối đa trong bảng được đánh dấu"
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
						Để tải dữ liệu cho dự án , vui lòng lựa chọn tệp tin JSON từ thiết bị của bạn và đảm bảo dữ liệu trong tệp tin là đúng định dạng.
					</Typography>
					<Typography
						variant="body1"
						component="p"
						sx={{
							color: "#605F5F",
							mb: 2,
						}}
					>
						Tham khảo thông tin về định dạng dữ liệu của hệ thống&nbsp;
						<span>
							<Link onClick={() => {
								window.open("/dataformatinfo")
							}} underline="hover">tại đây</Link>
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
								Tải lên dữ liệu
							</Button>

						</label>

						<Paper className={`pp-status`}>
							{
								(pickedFile && !!pickedFileName) ?
									pickedFileName : "Chưa có dữ liệu"
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
							Quay lại
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
										this.props.showSnackBar!("Khởi tạo dự án thành công!", 10000, SnackBarType.Success);
									} else {
										this.props.showSnackBar!("Khởi tạo dự án thất bại! " + res.data.message, 10000, SnackBarType.Error);
									}
								}).catch((err: any) => {
									console.log(err)
									if (!!err.errors && err.errors.es_id && Array.isArray(err.errors.es_id)) {
										this.setState({ prjEsIdErrMsg: err.errors.es_id[0] });
									}
									if (!!err.errors && err.errors.name && Array.isArray(err.errors.es_id)) {
										this.setState({ prjNameErrMsg: err.errors.name[0] });
									}
									this.props.showSnackBar!("Khởi tạo dự án thất bại! ", 10000, SnackBarType.Error);
								}).finally(() => this.props.hideTopLoading!())
							}}
						>
							Tạo dự án
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
			this.props.showSnackBar!("Tải lên tệp tin JSON thất bại. Vui lòng kiểm tra lại định dạng tệp tin.", 10000, SnackBarType.Error);
		}
	}
}

export default connect(null, mapDispatcherToProps)(CreateProject);
