import { AppBar, Button, Toolbar, Typography } from "@mui/material";
import React from "react";
import "./Header.scss";
import AccountCircle from '@mui/icons-material/AccountCircle';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import history from "../../history";

interface IHeaderState {
    anchorEl: any;
    menuIsOpen: boolean;
}
export default class Header extends React.Component<{}, IHeaderState> {
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
        return (
            <AppBar className={`header-container`} position="static">
                <Toolbar>
                    <div className={`div-logo-home`} onClick={() => history.push("/")}>
                        <img className={`img-home`} src='/fimo-logo-300x97.png' alt='fimo-logo' />
                    </div>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        FIMO Labeling tool
                    </Typography>
                    {localStorage.getItem('loggedIn') === "1" && <Button
                        color="inherit"
                        onClick={this.handleMenuOpen}
                    >
                        {localStorage.getItem('userFullName')}
                        <AccountCircle sx={{ ml: 3 }} />
                    </Button>}
                    {localStorage.getItem('loggedIn') !== "1" && <Button
                        color="inherit"
                        onClick={() => { history.push("/login") }}
                    >
                        Đăng nhập
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
                    <MenuItem onClick={this.handleMenuClose}>Cập nhật thông tin cá nhân</MenuItem>
                    <MenuItem onClick={this.handleMenuClose}>Đổi mật khẩu</MenuItem>
                    <MenuItem onClick={this.handleLogout}>Đăng xuất</MenuItem>
                </Menu>
            </AppBar>
        )
    }
}