import { AppBar, Button, Toolbar, Typography } from "@mui/material";
import React from "react";
import "./Header.scss";
import AccountCircle from '@mui/icons-material/AccountCircle';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

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
    render() {
        return (
            <AppBar className={`header-container`} position="static">
                <Toolbar>
                    <div className={`div-logo-home`}>
                        <img className={`img-home`} src='/fimo-logo-300x97.png' alt='fimo-logo' />
                    </div>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        FIMO Labeling tool
                    </Typography>
                    <Button
                        color="inherit"
                        onClick={this.handleMenuOpen}
                    >
                        Nguyễn Thức Quang Hưng
                        <AccountCircle sx={{ ml: 3 }} />
                    </Button>
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
                </Menu>
            </AppBar>
        )
    }
}