import {
	Router,
	Route,
} from "react-router-dom";
import Main from './pages';
import Register from "./pages/register";
import history from './history';
import Dashborad from "./pages/dashboard";
import Login from "./pages/login";
import Header from "./pages/header";
import CreateProject from "./pages/createproject";
import ProjectDetail from "./pages/projectdetail";
import CreateClaims from "./pages/createclaims";
import AnnotateClaims from "./pages/annotateclaims";
import ProjectManagement from "./pages/admin/projectmanagement";
import UserManagement from "./pages/admin/usermanagement";
import UpdateProject from "./pages/admin/updateproject";
import { connect } from 'react-redux';
import { IRootState } from './redux';
import * as snackBarActions from './redux/snackbar/actions';
import React from "react";
import {
	LinearProgress,
	Typography,
	Modal,
	Box,
	Snackbar,
	Alert
} from "@mui/material";
import { SnackBarType } from "./utils/enumerates";
import { ISnackBarState, SnackBarActions } from "./redux/snackbar/types";
import { Dispatch } from "redux";
import Utils from "./utils/utils";
import "./index.scss";
import DataFormatInfoPage from "./pages/dataformat";

function mapDispatcherToProps(dispatch: Dispatch<SnackBarActions>): IAppPropsFromDispatch {
	return {
		showSnackBar: (pMsg: string, pDuration: number, pType: SnackBarType) => dispatch(snackBarActions.showSnackBar(pMsg, pDuration, pType)),
		hideSnackBar: () => dispatch(snackBarActions.hideSnackBar()),
	}
}
interface IAppPropsFromDispatch {
	showSnackBar?: (pMsg: string, pDuration: number, pType: SnackBarType) => void;
	hideSnackBar?: () => void;
}
function mapStateToProps({ general, snackBar }: IRootState): IAppPropsFromState {
	const { showTopLoading, currentRoute } = general;
	return {
		showTopLoading,
		snackBarState: snackBar,
		currentRoute
	};
}

interface IAppPropsFromState {
	showTopLoading?: boolean;
	snackBarState?: ISnackBarState
	currentRoute?: string;
}

type IAppProps = IAppPropsFromState & IAppPropsFromDispatch;

const modalStyle: any = {
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 400,
	bgcolor: 'background.paper',
	borderRadius: 2,
	boxShadow: 24,
	p: 4,
	textAlign: "center",
};

class App extends React.Component<IAppProps> {
	private onSnackBarClosed = () => {
		this.props.hideSnackBar!();
	}
	render() {
		return (
			<div className={`container`}>
				<Header
					inLoginScreen={this.props.currentRoute === "/login"}
					inRegisterScreen={this.props.currentRoute === "/register"}
				/>
				<Router history={history}>
					<Route exact path='/' component={Main} />
					<Route exact path='/register' component={Register} />
					<Route exact path='/dashboard' component={Dashborad} />
					<Route exact path='/login' component={Login} />
					<Route exact path='/createproject' component={CreateProject} />
					<Route exact path='/project/:prjid' component={ProjectDetail} />
					<Route exact path='/project/:prjid/:esid/createclaims' component={CreateClaims} />
					<Route exact path='/project/:prjid/:esid/annotateclaims' component={AnnotateClaims} />
					<Route exact path='/dataformatinfo' component={DataFormatInfoPage} />
					<Route exact path='/admin/projectmanagement' component={ProjectManagement} />
					<Route exact path='/admin/usermanagement' component={UserManagement} />
					<Route exact path='/admin/project/:prjid' component={UpdateProject} />
				</Router>
				<Modal
					open={!!this.props.showTopLoading}
					aria-labelledby="modal-modal-title"
					aria-describedby="modal-modal-description"
				>
					<Box sx={modalStyle}>
						<Typography
							id="modal-modal-title"
							variant="h6"
							component="h2"
							sx={{ mb: 3 }}
						>
							Xin chờ một chút ...
						</Typography>
						<LinearProgress />
					</Box>
				</Modal>
				<Snackbar
					open={!!this.props.snackBarState?.showSnackBar} autoHideDuration={
						!!this.props.snackBarState?.duration ?
							this.props.snackBarState.duration : 2000
					}
					onClose={this.onSnackBarClosed}>
					<Alert
						onClose={this.onSnackBarClosed}
						severity={Utils.convertSnackBarType(
							this.props.snackBarState?.type
						)}
						sx={{ width: '100%' }}
					>
						{this.props.snackBarState?.msg}
					</Alert>
				</Snackbar>
			</div >
		);
	}
}


export default connect(mapStateToProps, mapDispatcherToProps)(App);
