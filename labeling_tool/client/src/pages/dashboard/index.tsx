import { Button, Typography, CircularProgress } from "@mui/material";
import React from "react";
import "./index.scss";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Link from '@mui/material/Link';
import history from "../../history";
import projectAPI from "../../api/projectAPI";
import * as generalActions from "../../redux/general/actions";
import { connect } from "react-redux";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
	[`&.${tableCellClasses.head}`]: {
		backgroundColor: "#1976d2",
		color: theme.palette.common.white,
	},
	[`&.${tableCellClasses.body}`]: {
		fontSize: 14,
	},
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
	'&:nth-of-type(odd)': {
		backgroundColor: theme.palette.action.hover,
	},
	// hide last border
	'&:last-child td, &:last-child th': {
		border: 0,
	},
}));

interface IDashboardState {
	projectList: any[];
	imgLoaded: boolean;
}

interface IDashboardPropsFromDispatch {
	showTopLoading?: () => void;
	hideTopLoading?: () => void;
}

const mapDispatcherToProps = (dispatch: any): IDashboardPropsFromDispatch => {
	return {
		showTopLoading: () => dispatch(generalActions.showTopLoading()),
		hideTopLoading: () => dispatch(generalActions.hideTopLoading()),
	}
}

type IDashboardProps = IDashboardPropsFromDispatch;

class Dashboard extends React.Component<IDashboardProps, IDashboardState> {
	public constructor(props: any) {
		super(props);
		this.state = {
			projectList: [],
			imgLoaded: false,
		}
	}

	public componentDidMount() {
		this.props.showTopLoading!();
		projectAPI.getAllProjects().then(res => {
			if (
				!!res &&
				!!res.data &&
				!!res.status &&
				res.status === 200 &&
				res.data.count > 0 &&
				!!res.data.projects
			) {
				this.setState({ projectList: res.data.projects })
			}
		}).finally(()=>this.props.hideTopLoading!());
	}
	
	public render() {
		return (
			this.state.projectList.length > 0 ? <div className={`dashboard-container`}>
				<Paper
					elevation={1} sx={{
						width: "80%",
						height: "80%",
						m: "20px auto",
						pr: 5, pl: 5, pt: 3, pb: 3,
						textAlign: "start",
						flexDirection: "column",
						display: "flex",
					}}
				>
					<Button
						sx={{
							width: "max-content",
							mb: 2,
						}}
						variant="contained"
						className={`btn-create-new-prj`}
						onClick={() => history.push("/createproject")}
					>
						Tạo dự án mới
					</Button>
					<Typography
						variant="h6"
						component="div"
						sx={{
							mb: 2,
							fontStyle: "bold",
							textAlign: "center",
							color: "#605F5F"
						}}
					>
						Danh sách dự án
					</Typography>
					<TableContainer component={Paper}>
						<Table aria-label="customized table">
							<TableHead>
								<StyledTableRow>
									<StyledTableCell>Tên dự án</StyledTableCell>
									<StyledTableCell align="center">ID</StyledTableCell>
									<StyledTableCell align="center">Quản lý dự án</StyledTableCell>
									<StyledTableCell align="center" sx={{ maxWidth: "300px", overflowX: "hidden", textOverflow: "ellipsis" }}>Mô tả</StyledTableCell>
									<StyledTableCell align="center">Elasticsearch Index</StyledTableCell>
								</StyledTableRow>
							</TableHead>
							<TableBody>
								{this.state.projectList.map((row) => (
									<StyledTableRow
										key={row.name}
										sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
									>
										<StyledTableCell component="th" scope="row">
											<Link
												href={`/project/${row.id}`}
												sx={{ cursor: "pointer" }}
											>
												{row.name}
											</Link>
										</StyledTableCell>
										<StyledTableCell align="center">{row.id}</StyledTableCell>
										<StyledTableCell align="center">{row.owner?.full_name}</StyledTableCell>
										<StyledTableCell align="center" sx={{ maxWidth: "300px", overflowX: "hidden", textOverflow: "ellipsis" }}>{row.description}</StyledTableCell>
										<StyledTableCell align="center">{row.es_id}</StyledTableCell>
									</StyledTableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				</Paper>
			</div > : <div className={`dashboard-empty-container`}>
				<Paper elevation={0} sx={{
					width: "700px",
					m: "100px auto",
					p: 5
				}}>
					{!this.state.imgLoaded && <CircularProgress />}
					<img
						style={this.state.imgLoaded ? {} : { display: 'none' }}
						onLoad={() => this.setState({ imgLoaded: true })}
						src="empty.png"
						alt="Không tìm thấy dự án nào!"
					/>
					{this.state.imgLoaded && <Typography
						variant="h6"
						component="div"
						sx={{
							mt: "20px",
							fontStyle: "bold",
							textAlign: "center",
							color: "#605F5F"
						}}
					>
						Hiện tại bạn đang không tham gia bất kỳ dự án nào<br></br>
						Vui lòng liên hệ các quản lý dự án để được thêm vào <br></br>
						hoặc tạo một dự án mới!
					</Typography>}
					{this.state.imgLoaded && <Button
						sx={{ mt: 4 }}
						variant="contained"
						className={`btn-create-new-prj`}
						onClick={() => history.push("/createproject")}
					>
						Tạo dự án mới
					</Button>}
				</Paper>

			</div>
		)
	}
}

export default connect(null, mapDispatcherToProps)(Dashboard);
