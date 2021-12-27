import { AppBar, Button, Toolbar, Typography } from "@mui/material";
import React from "react";
import "./index.scss";
import AccountCircle from '@mui/icons-material/AccountCircle';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import history from "../../history";

interface IHeaderState {
	anchorEl: any;
	menuIsOpen: boolean;
}
export default class Header extends React.Component<{ inLoginScreen: boolean, inRegisterScreen: boolean }, IHeaderState> {
	constructor(props: any) {
		super(props);
		this.state = {
			anchorEl: null,
			menuIsOpen: false,
		}
	}
	private handleMenuOpen = (event: any) => {
		this.setState({ anchorEl: event.currentTarget, menuIsOpen: true });
	};
	private handleMenuClose = () => {
		this.setState({ anchorEl: null, menuIsOpen: false });
	};
	private handleLogout = () => {
		this.setState({ anchorEl: null, menuIsOpen: false });
		localStorage.setItem("loggedIn", "0");
		localStorage.setItem("userFullName", "");
		localStorage.setItem("accessToken", "")
		localStorage.setItem("refreshToken", "")
		localStorage.setItem("userId", "")
		localStorage.setItem("accessExpires", "")
		localStorage.setItem("refreshExpires", "")
		history.push("/login")
	};
	render() {
		const { inLoginScreen, inRegisterScreen } = this.props;
		return (
			<AppBar className={`header-container`} position="static">
				<Toolbar>
					<div className={`div-logo-home`} onClick={() => history.push("/")}>
						<img className={`img-home`} src='/fimo-logo-300x97.png' alt='fimo-logo' />
					</div>
					<Typography variant="h6" component="div" sx={{ flexGrow: 1, display: { xs: 'none', sm: 'none', md: 'block' } }}>
						FIMO Labeling tool
					</Typography>
					<Typography component="div" sx={{ flexGrow: 1, display: { xs: 'block', sm: 'block', md: 'none' } }}>
					</Typography>
					{(localStorage.getItem('loggedIn') === "1" && !inLoginScreen && !inRegisterScreen) && <Button
						color="inherit"
						onClick={this.handleMenuOpen}
					>
						{localStorage.getItem('userFullName')}
						<AccountCircle sx={{ ml: 3 }} />
					</Button>}
					{(localStorage.getItem('loggedIn') !== "1" || inLoginScreen || inRegisterScreen) && <Button
						color="inherit"
						onClick={() => { history.push(inLoginScreen ? "/register" : "/login") }}
					>
						{inLoginScreen ? `Đăng ký` : `Đăng nhập`}
					</Button>}
				</Toolbar>
				<Menu
					anchorEl={this.state.anchorEl}
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'right',
					}}
					id={`profile-menu`}
					keepMounted
					transformOrigin={{
						vertical: 'top',
						horizontal: 'right',
					}}
					open={this.state.menuIsOpen}
					onClose={this.handleMenuClose}
				>
					<MenuItem onClick={this.handleMenuClose}>Đổi mật khẩu</MenuItem>
					<MenuItem onClick={this.handleLogout}>Đăng xuất</MenuItem>
				</Menu>
			</AppBar>
		)
	}
}