import React from 'react';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import userAPI from '../api/userAPI';
import { Box, CircularProgress, Link, Stack, Typography } from '@mui/material';
import projectAPI from '../api/projectAPI';
import { SnackBarType } from '../utils/enumerates';

interface IUploadMoreModalProps {
	showTopLoading?: () => void;
	hideTopLoading?: () => void;
	showSnackBar?: (pMsg: string, pDuration: number, pType: SnackBarType) => void;
	closeModal: () => void;
	reloadDetailPage: () => void;
	prjId: number;
	prjName: string;
}

interface IUploadMoreModalState {
	pickedFile: any;
	pickedFileName: string;
}

export default class UploadMoreModal extends React.Component<IUploadMoreModalProps, IUploadMoreModalState> {
	constructor(props: IUploadMoreModalProps) {
		super(props);
		this.state = {
			pickedFile: undefined,
			pickedFileName: "",
		}
	}

	render() {
		const { pickedFile, pickedFileName } = this.state;
		return <Box sx={{ width: "500px", height: "max-content", p: 1, textAlign: "start" }}>
			<Typography
				variant="h5"
				component="p"
				sx={{
					fontStyle: "bold",
					fontWeight: 500,
					color: "#605F5F",
					mb: 2,
				}}
			>
				Tải lên thêm dữ liệu
			</Typography>
			<Typography
				variant="body1"
				component="p"
				sx={{
					color: "#605F5F",
					mb: 2,
				}}
			>
				Để tải lên thêm dữ liệu cho dự án {this.props.prjName}, vui lòng lựa chọn tệp tin JSON từ thiết bị của bạn và đảm bảo dữ liệu trong tệp tin là đúng định dạng.
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
			<Stack direction={"row"} spacing={2}>
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
						// sx={{ background: "#03A9F5" }}
						variant="contained"
						component="span"
					>
						Chọn tệp tin từ thiết bị
					</Button>

				</label>
				<Paper sx={{
					p: "6px 10px",
					maxWidth: "250px",
					overflow: "hidden",
					textOverflow: "ellipsis"
				}} >
					{
						(pickedFile && !!pickedFileName) ?
							pickedFileName : "Chưa có dữ liệu"
					}
				</Paper>
			</Stack>
			<Stack sx={{ mt: 2 }} direction={"row-reverse"} spacing={2}>
				<Button
					variant="contained"
					component="span"
					onClick={() => {
						this.props.showTopLoading!();
						projectAPI.uploadMoreData(this.props.prjId.toString(), pickedFile)
							.then((res: any) => {
								console.log(res);
								this.props.showSnackBar!(
									"Tải lên thêm dữ liệu cho dự án thành công!",
									10000,
									SnackBarType.Success
								);
								this.props.reloadDetailPage();
								this.props.closeModal();
							}).catch((err: any) => {
								console.log(err);
								this.props.showSnackBar!(
									"Lỗi từ máy chủ, tải lên dữ liệu thất bại!",
									10000,
									SnackBarType.Error
								);
								this.props.hideTopLoading!();
							})
					}}
				>
					Tải lên dữ liệu
				</Button>
				<Button
					sx={{ background: "#BC6181" }}
					variant="contained"
					component="span"
					onClick={() => this.props.closeModal()}
				>
					Hủy bỏ
				</Button>
			</Stack>
		</Box >
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
			this.props.showSnackBar!(
				"Tải lên tệp tin JSON thất bại. Vui lòng kiểm tra lại định dạng tệp tin.",
				10000,
				SnackBarType.Error
			);
		}
	}
}
