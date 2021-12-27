import "./index.scss";
import React from "react";
import { Button, Paper, Typography, Link, Modal, Box, Grid, Stack } from "@mui/material";
import LinearProgress from '@mui/material/LinearProgress';
import ListSubheader from '@mui/material/ListSubheader';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { RouteComponentProps } from 'react-router';
import projectAPI from "../../api/projectAPI";
import { SnackBarType } from "../../utils/enumerates";
import { connect } from "react-redux";
import * as generalActions from "../../redux/general/actions";
import * as snackBarActions from "../../redux/snackbar/actions";
import ProjectMemberModal from "../../modals/ProjectMemberModal";
import history from "../../history";
import { BooleanLiteral } from "typescript";
import UploadMoreModal from "../../modals/UploadMoreModal";

interface IProjectDetailState {
	thirdTypeExpanded: boolean;
	prjDetail: any;
	showMemberModal: boolean;
	showUploadMoreModal: boolean;
}

interface IProjectDetailUrlParams {
	prjid?: string;
}
interface IProjectDetailPropsFromDispatch {
	showTopLoading?: () => void;
	hideTopLoading?: () => void;
	showSnackBar?: (pMsg: string, pDuration: number, pType: SnackBarType) => void;
}

const mapDispatcherToProps =
	(dispatch: any): IProjectDetailPropsFromDispatch => {
		return {
			showSnackBar: (pMsg: string, pDuration: number, pType: SnackBarType) => dispatch(snackBarActions.showSnackBar(pMsg, pDuration, pType)),
			showTopLoading: () => dispatch(generalActions.showTopLoading()),
			hideTopLoading: () => dispatch(generalActions.hideTopLoading()),
		}
	}

type IProjectDetailProps = RouteComponentProps<IProjectDetailUrlParams> & IProjectDetailPropsFromDispatch;
class ProjectDetail extends React.Component<IProjectDetailProps, IProjectDetailState> {
	constructor(props: IProjectDetailProps) {
		super(props);
		this.state = {
			thirdTypeExpanded: false,
			prjDetail: {},
			showMemberModal: false,
			showUploadMoreModal: false,
		}
	}
	public componentDidMount() {
		this.initData();
	}
	private initData = () => {
		const prjId = this.props.match.params.prjid;
		if (!!prjId) {
			this.props.showTopLoading!();
			projectAPI
				.getPrjDetail(prjId)
				.then((res: any) => {
					if (res && res.data && res.status && res.status === 200) {
						this.setState({ prjDetail: res.data });
					} else {
						this.props.showSnackBar!(
							"Xảy ra lỗi khi lấy dữ liệu dự án!" + res.statusText,
							10000,
							SnackBarType.Error
						);
					}
				})
				.catch(err => {
					this.props.showSnackBar!(
						"Xảy ra lỗi khi lấy dữ liệu dự án!" + err.statusText,
						10000,
						SnackBarType.Error
					);
				})
				.finally(() => this.props.hideTopLoading!())
		}
	}
	render() {
		const { prjDetail } = this.state;
		console.log(prjDetail)
		return (
			<Box sx={{ p: "20px" }} className={`project-detail-container`}>
				<Stack
					sx={{ position: "fixed", width: "100%", height: "calc(100% - 104px)" }}
					direction="row"
					spacing={0}
				>
					<Paper elevation={1} sx={{
						width: "calc(50% - 70px)",
						p: "20px",
						textAlign: "start",
						flexDirection: "column",
						display: "flex",
					}}>
						<Box sx={{ flexGrow: 10, pr: "20px", overflowY: "auto" }}>
							<Typography
								variant="h5"
								component="p"
								sx={{
									fontStyle: "bold",
									fontWeight: 500,
								}}
							>
								{prjDetail.project_name}
							</Typography>
							<Typography
								variant="body1"
								component="p"
								sx={{ mt: 2, fontWeight: 500 }}
							>
								Mô tả
							</Typography>
							<Typography
								variant="body1"
								component="p"
								sx={{ mt: 1 }}
							>
								{prjDetail.project_description}
							</Typography>
							<Typography
								variant="body1"
								component="p"
								sx={{ mt: 2, mb: 2, fontWeight: 500 }}
							>
								Tiến độ
							</Typography>
							<div>
								<LinearProgress
									className={`lp-db`}
									variant="determinate"
									value={prjDetail?.document?.processed * 100 / prjDetail?.document?.total}
								/>
								<p>{`${prjDetail?.document?.processed} văn bản / ${prjDetail?.document?.total} văn bản`}</p>
							</div>
							<Stack spacing={2} direction={"row"}>
								<Button
									sx={{ mb: 2, width: "max-content" }}
									variant="contained"
									onClick={() => {
										this.setState({ showUploadMoreModal: true });
									}}
								>
									Tải lên thêm dữ liệu
								</Button>
								<Button
									sx={{ mb: 2, width: "max-content", height: "max-content" }}
									variant="contained"
									color="success"
									onClick={() => {
										this.downloadFile();
									}}
								>
									Xuất dữ liệu
								</Button>
							</Stack>

							<Typography
								variant="body1"
								component="p"
								sx={{ fontWeight: 500 }}
							>
								Cấu hình
							</Typography>
							<Typography
								variant="body1"
								component="p"
								sx={{ mt: 1 }}
							>
								{`Elasticsearch Index: ${prjDetail.es_id}`} <br></br>
								{`Chỉ số k: ${(!!prjDetail && !!prjDetail.config && !!prjDetail.config.k) ? prjDetail.config.k : ''}; `}
								{`Chỉ số b1: ${(!!prjDetail && !!prjDetail.config && !!prjDetail.config.b1) ? prjDetail.config.b1 : ''}`} <br></br>
								{`Số lượng câu được đánh dấu: ${(!!prjDetail && !!prjDetail.config && !!prjDetail.config.highlight.num_sequence_highlight) ? prjDetail.config.highlight.num_sequence_highlight : ''}`} <br></br>
								{`Số lượng hàng tối đa trong bảng được đánh dấu: ${(!!prjDetail && !!prjDetail.config && !!prjDetail.config.highlight.min_table_row_highlight) ? prjDetail.config.highlight.min_table_row_highlight : ''}`} <br></br>
								{`Số lượng hàng tối đa trong bảng được đánh dấu: ${(!!prjDetail && !!prjDetail.config && !!prjDetail.config.highlight.max_table_row_highlight) ? prjDetail.config.highlight.max_table_row_highlight : ''}`} <br></br>
							</Typography>
							<Typography
								variant="body1"
								component="p"
								sx={{ fontWeight: 500, mt: 2 }}
							>
								Thành viên dự án
							</Typography>
							<Typography
								variant="body1"
								component="p"
								sx={{ mt: 1 }}
							>
								Số thành viên tham gia dự án: <span>{(this.state.prjDetail && this.state.prjDetail.project_owner && this.state.prjDetail.project_owner.email && this.state.prjDetail.project_owner.email === localStorage.getItem('userFullName')) ?
									<Link
										onClick={() => {
											this.setState({ showMemberModal: true });
										}}
										sx={{
											cursor: "pointer",
										}}
									>
										{`${prjDetail.project_member?.length} thành viên`}
									</Link> : `${prjDetail.project_member?.length} thành viên`}
								</span>
							</Typography>

							{(this.state.prjDetail && this.state.prjDetail.project_owner && this.state.prjDetail.project_owner.email && this.state.prjDetail.project_owner.email === localStorage.getItem('userFullName')) && <Button
								sx={{ mt: 2, width: "max-content" }}
								variant="contained"
								onClick={() => {
									this.setState({ showMemberModal: true });
								}}
							>
								Quản lý thành viên
							</Button>}
						</Box>


						<Button
							color="success"
							sx={{ mt: 2, width: "max-content" }}
							variant="contained"
							onClick={() => { history.push("/dashboard") }}
						>
							Quay lại
						</Button>
					</Paper>
					<Box sx={{
						width: "calc(50% - 30px)",
						ml: "20px",
						display: "block",
						height: "100%"
					}}>
						<Paper elevation={1} sx={{
							p: "20px",
							height: "calc(50% - 50px)",
							textAlign: "start",
							flexDirection: "column",
							display: "flex",
						}}>
							<Box sx={{ flexGrow: 10, pr: "20px", overflowY: "auto" }}>
								<Typography
									variant="h4"
									component="div"
									sx={{
										fontStyle: "bold",
									}}
								>
									Mệnh đề
								</Typography>
								{(!!prjDetail?.claim?.total) ? <Box>
									<Typography
										variant="body1"
										component="p"
										sx={{
											mt: 2, fontWeight: 500,
											color: "rgba(0, 0, 0, 0.6)"
										}}
									>
										{`Tổng số: ${prjDetail.claim?.total} mệnh đề`}

									</Typography>
									<Typography
										variant="body1"
										component="p"
										sx={{ mt: 1 }}
									>
										{`Loại 1: ${prjDetail.claim?.type_1} mệnh đề;`}
									</Typography>
									<Typography
										variant="body1"
										component="p"
										sx={{ mt: 1 }}
									>
										{`Loại 2: ${prjDetail.claim?.type_2} mệnh đề`}
									</Typography>
									<Typography
										variant="body1"
										component="p"
										sx={{ mt: 1 }}
									>
										{`Loại 3: ${prjDetail.claim?.type_3?.total} mệnh đề, trong đó:`} <br></br>
										&nbsp;&nbsp;&nbsp;&nbsp;-&nbsp; {`${prjDetail.claim?.type_3?.more_specific} mệnh đề chi tiết hóa`} <br></br>
										&nbsp;&nbsp;&nbsp;&nbsp;-&nbsp; {`${prjDetail.claim?.type_3?.generalization} mệnh đề khái quát hóa`} <br></br>
										&nbsp;&nbsp;&nbsp;&nbsp;-&nbsp; {`${prjDetail.claim?.type_3?.negation} mệnh đề phủ định hóa`} <br></br>
										&nbsp;&nbsp;&nbsp;&nbsp;-&nbsp; {` ${prjDetail.claim?.type_3?.paraphrasing} mệnh đề viết lại câu`} <br></br>
										&nbsp;&nbsp;&nbsp;&nbsp;-&nbsp; {` ${prjDetail.claim?.type_3?.entity_substitution} mệnh đề thay thế từ`}
									</Typography>
								</Box> : <Typography
									variant="body1"
									component="p"
									sx={{ mt: 2 }}
								>
									Hiện tại chưa có mệnh đề nào được tạo
								</Typography>}
							</Box>

							<Button
								sx={{ width: "max-content" }}
								variant="contained"
								onClick={() => history.push(`/project/${prjDetail.project_id}/${prjDetail.es_id}/createclaims`)}
							>
								Viết mệnh đề
							</Button>
						</Paper>
						<Paper elevation={1} sx={{
							mt: "20px",
							p: "20px",
							height: "calc(50% - 50px)",
							textAlign: "start",
							flexDirection: "column",
							display: "flex",
						}}>
							<Box sx={{ flexGrow: 10, pr: "20px", overflowY: "auto" }}>

								<Typography
									variant="h4"
									component="div"
									sx={{
										fontStyle: "bold"
									}}
								>
									Nhãn
								</Typography>


								{!!prjDetail.claim?.total ?
									<Box>
										<Typography
											variant="body1"
											component="p"
											sx={{
												mt: 2, mb: 2, fontWeight: 500,
											}}
										>
											{`Tiến độ`}

										</Typography>
										<div>
											<LinearProgress
												className={`lp-db`}
												variant="determinate"
												value={prjDetail.label?.total_verified_claim / prjDetail.claim?.total}
											/>
											<p>{`${prjDetail.label?.total_verified_claim} nhãn / ${prjDetail.claim?.total} mệnh đề`}</p>
										</div>
										<Typography
											variant="body1"
											component="p"
											sx={{
												mt: 2, mb: 2, fontWeight: 500,
											}}
										>
											{`Chi tiết`}
										</Typography>
										<Typography
											variant="body1"
											component="p"
										>
											{`Tổng số: ${prjDetail.label?.total_verified_claim} nhãn`}
										</Typography>
										<Typography
											sx={{ mt: 2 }}
											variant="body1"
											component="p"
										>
											{`SUPPORTED: ${prjDetail.label?.supported} nhãn;`}&nbsp;&nbsp;&nbsp;&nbsp;{`REFUTED: ${prjDetail.label?.refuted} nhãn;`}&nbsp;&nbsp;&nbsp;&nbsp;{`NOT ENOUGH INFO: ${prjDetail.label?.nei} nhãn;`}
										</Typography>
									</Box> :
									<Typography
										variant="body1"
										component="p"
										sx={{ mt: 2 }}
									>
										Hiện tại chưa có mệnh đề nào được tạo
									</Typography>
								}
							</Box>
							{!!prjDetail.claim?.total && <Button
								sx={{ width: "max-content" }}
								onClick={() => history.push(`/project/${prjDetail.project_id}/${prjDetail.es_id}/annotateclaims`)}
								variant="contained"
							>
								Gán nhãn
							</Button>}
						</Paper>
					</Box>
				</Stack>

				<Modal
					open={this.state.showMemberModal}
					aria-labelledby="modal-modal-title"
					aria-describedby="modal-modal-description"
				>
					<Box sx={modalStyle}>
						<ProjectMemberModal
							reloadDetailPage={this.initData}
							closeModal={() => this.setState({ showMemberModal: false })}
							prjMembers={
								(prjDetail.project_member) ?
									prjDetail.project_member.map((item: any) => {
										return {
											id: item.id,
											email: item.email,
											name: item.full_name,
										}
									}) : []
							}
							showTopLoading={this.props.showTopLoading}
							hideTopLoading={this.props.hideTopLoading}
							ownerId={(prjDetail.project_owner && prjDetail.project_owner.id) ? prjDetail.project_owner.id : -1}
							prjId={parseInt(this.props.match.params.prjid!)}
						/>
					</Box>
				</Modal>
				<Modal
					open={this.state.showUploadMoreModal}
					aria-labelledby="modal-modal-title"
					aria-describedby="modal-modal-description"
				>
					<Box sx={modalStyle}>
						<UploadMoreModal
							prjName={this.state.prjDetail.project_name}
							reloadDetailPage={this.initData}
							closeModal={() => this.setState({ showUploadMoreModal: false })}
							showTopLoading={this.props.showTopLoading}
							hideTopLoading={this.props.hideTopLoading}
							showSnackBar={this.props.showSnackBar}
							prjId={parseInt(this.props.match.params.prjid!)}
						/>
					</Box>
				</Modal>
			</Box >
		)
	}
	private downloadFile = () => {
		this.props.showTopLoading!();
		projectAPI.exportData(this.props.match.params.prjid!).then(res => {
			this.export(res.data.dataset)
		}).catch(() => {
			this.props.hideTopLoading!();
			this.props.showSnackBar!("Xuất dữ liệu thất bại!", 10000, SnackBarType.Error);
		})
	}

	private export = async (myData: any) => {
		const fileName = this.state.prjDetail.es_id;
		const json = JSON.stringify(myData);
		const blob = new Blob([json], { type: 'application/json' });
		const href = await URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = href;
		link.download = fileName + ".json";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		this.props.hideTopLoading!();
	}
}



const modalStyle: any = {
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	bgcolor: 'background.paper',
	borderRadius: 2,
	boxShadow: 24,
	p: 2,
	textAlign: "center",
};
export default connect(null, mapDispatcherToProps)(ProjectDetail);