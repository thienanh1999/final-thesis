import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import userAPI from '../api/userAPI';
import { Box, CircularProgress, Typography } from '@mui/material';
import projectAPI from '../api/projectAPI';

interface UserBasicInfo {
    id: number;
    name: string;
    email: string;
}

interface IProjectMemberModalProps {
    showTopLoading?: () => void;
    hideTopLoading?: () => void;
    closeModal: () => void;
    reloadDetailPage: () => void;
    prjMembers: UserBasicInfo[];
    ownerId: number;
    prjId: number;
}

interface IProjectMemberModalState {
    leftMembers: UserBasicInfo[];
    rightMembers: UserBasicInfo[];
    loading: boolean;
    leftChecked: number[];
    rightChecked: number[];
}

export default class ProjectMemberModal extends React.Component<IProjectMemberModalProps, IProjectMemberModalState> {
    constructor(props: IProjectMemberModalProps) {
        super(props);
        this.state = {
            leftMembers: [],
            rightMembers: props.prjMembers,
            loading: true,
            leftChecked: [],
            rightChecked: [],
        }
    }

    componentDidMount() {
        const { prjMembers } = this.props;
        userAPI
            .getAllUsers()
            .then(res => {
                if (res && res.data && res.data.result === 200 && res.data.users && Array.isArray(res.data.users) && res.data.users.length > 0) {
                    const notPrjMembers: UserBasicInfo[] = [];
                    let ok: boolean = false;
                    res.data.users.forEach((fetchedUser: any) => {
                        ok = true;
                        for (let i = 0; i < prjMembers.length; ++i) {
                            if (prjMembers[i].id === fetchedUser.id) {
                                ok = false;
                                break;
                            }
                        }
                        if (ok) {
                            notPrjMembers.push({
                                id: fetchedUser.id,
                                email: fetchedUser.email,
                                name: fetchedUser.full_name,
                            })
                        }
                    })
                    this.setState({
                        leftMembers: notPrjMembers
                    })
                }
            }).finally(() => this.setState({ loading: false }));
    }


    private onLeftUserToggled = (userId: number) => () => {
        const { leftChecked: checked } = this.state;
        const currentIndex = checked.indexOf(userId);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(userId);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        this.setState({ leftChecked: newChecked });
    };

    private onRightUserToggled = (userId: number, isOwner: boolean) => () => {
        if (!isOwner) {
            const { rightChecked: checked } = this.state;
            const currentIndex = checked.indexOf(userId);
            const newChecked = [...checked];

            if (currentIndex === -1) {
                newChecked.push(userId);
            } else {
                newChecked.splice(currentIndex, 1);
            }

            this.setState({ rightChecked: newChecked });
        }

    };

    private onAllRightClicked = () => {
        this.setState({
            rightMembers: this.state.rightMembers.concat(this.state.leftMembers),
            leftMembers: [],
        })
    };

    private handleCheckedRight = () => {
        const { leftChecked, leftMembers, rightMembers } = this.state;
        const leftCheckedUsers: UserBasicInfo[] = [];
        const leftUnCheckedUsers: UserBasicInfo[] = [];
        leftMembers.forEach(mem => {
            if (leftChecked.includes(mem.id)) leftCheckedUsers.push(mem)
            else leftUnCheckedUsers.push(mem);
        });
        this.setState({
            rightMembers: rightMembers.concat(leftCheckedUsers),
            leftMembers: leftUnCheckedUsers,
            leftChecked: [],
        })
    };

    private handleCheckedLeft = () => {
        const { leftMembers, rightChecked, rightMembers } = this.state;
        const rightCheckedUsers: UserBasicInfo[] = [];
        const rightUnCheckedUsers: UserBasicInfo[] = [];
        rightMembers.forEach(mem => {
            if (rightChecked.includes(mem.id)) rightCheckedUsers.push(mem)
            else rightUnCheckedUsers.push(mem);
        });
        this.setState({
            leftMembers: leftMembers.concat(rightCheckedUsers),
            rightMembers: rightUnCheckedUsers,
            rightChecked: [],
        })
    };

    // private onAllLeftClicked = () => {
    //     this.setState({
    //         leftMembers: this.state.leftMembers.concat(this.state.rightMembers),
    //         rightMembers: [],
    //     })
    // };

    private customList = (items: UserBasicInfo[], isLeft: boolean) => (
        <Paper sx={{ width: 400, height: 300, overflow: 'auto' }}>
            <Typography
                variant='subtitle2'
                sx={{ mt: 2 }}
            >
                {isLeft ? "Thành viên khác" : "Thành viên trong dự án"}
            </Typography>
            <List dense component="div" role="list">
                {items.map((userInfo: UserBasicInfo) => {
                    const labelId = `transfer-list-item-${userInfo.id}-label`;

                    return (
                        <ListItem
                            key={userInfo.id}
                            role="listitem"
                            button
                            onClick={isLeft ?
                                this.onLeftUserToggled(userInfo.id) :
                                this.onRightUserToggled(userInfo.id, this.props.ownerId === userInfo.id)
                            }
                        >
                            <ListItemIcon>
                                <Checkbox
                                    checked={isLeft ?
                                        this.state.leftChecked.indexOf(userInfo.id) !== -1 :
                                        this.state.rightChecked.indexOf(userInfo.id) !== -1
                                    }
                                    tabIndex={-1}
                                    disableRipple
                                    disabled={this.props.ownerId === userInfo.id}
                                    inputProps={{
                                        'aria-labelledby': labelId,
                                    }}
                                />
                            </ListItemIcon>
                            <ListItemText
                                id={labelId}
                                primary={`${userInfo.name}${this.props.ownerId === userInfo.id ? " (Trưởng dự án)" : ""}`}
                                secondary={userInfo.email}
                            />
                        </ListItem>
                    );
                })}
                <ListItem />
            </List>
        </Paper>
    );

    render() {
        const { loading, leftMembers, rightMembers, leftChecked, rightChecked } = this.state;
        return !loading ?
            <Box>
                <Typography

                    variant='h6'

                    sx={{ mb: 2 }}>
                    Quản lý thành viên dự án
                </Typography>
                <Grid container spacing={2} justifyContent="center" alignItems="center" >
                    <Grid item>{this.customList(leftMembers, true)}</Grid>
                    <Grid item>
                        <Grid container direction="column" alignItems="center">
                            <Button
                                sx={{ my: 0.5 }}
                                variant="outlined"
                                size="small"
                                onClick={this.onAllRightClicked}
                                disabled={leftMembers.length === 0}
                                aria-label="move all right"
                            >
                                ≫
                            </Button>
                            <Button
                                sx={{ my: 0.5 }}
                                variant="outlined"
                                size="small"
                                onClick={this.handleCheckedRight}
                                disabled={leftChecked.length === 0}
                                aria-label="move selected right"
                            >
                                &gt;
                            </Button>
                            <Button
                                sx={{ my: 0.5 }}
                                variant="outlined"
                                size="small"
                                onClick={this.handleCheckedLeft}
                                disabled={rightChecked.length === 0}
                                aria-label="move selected left"
                            >
                                &lt;
                            </Button>
                            {/* <Button
                            sx={{ my: 0.5 }}
                            variant="outlined"
                            size="small"
                            onClick={this.onAllLeftClicked}
                            disabled={rightMembers.length === 0}
                            aria-label="move all left"
                        >
                            ≪
                        </Button> */}
                        </Grid>
                    </Grid>
                    <Grid item>{this.customList(rightMembers, false)}</Grid>
                </Grid>
                <Button
                    variant="contained"
                    color="success"
                    onClick={this.props.closeModal}
                    sx={{ mt: 2, mr: 2 }}>
                    Hủy bỏ
                </Button>
                <Button
                    variant="contained"
                    color="info"
                    onClick={async () => {
                        const { rightMembers } = this.state;
                        const { prjMembers } = this.props;
                        this.props.showTopLoading!();
                        const addedUserIds = rightMembers.filter(m => !prjMembers.map(p => p.id).includes(m.id)).map(k => k.id);
                        const removedUserIds = prjMembers.filter(m => !rightMembers.map(p => p.id).includes(m.id)).map(k => k.id);
                        if (addedUserIds.length) {
                            await projectAPI.addMembers(this.props.prjId, addedUserIds)
                        }
                        if (removedUserIds.length) {
                            await projectAPI.removeMembers(this.props.prjId, removedUserIds)
                        }
                        this.props.reloadDetailPage();
                        this.props.closeModal();
                    }}
                    sx={{ mt: 2 }}>
                    Lưu
                </Button>
            </Box>
            :
            <CircularProgress />
    }
}
