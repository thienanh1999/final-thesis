import "./ProjectDetail.scss";
import React from "react";
import { Button, Paper, Typography, Link } from "@mui/material";
import LinearProgress from '@mui/material/LinearProgress';
import ListSubheader from '@mui/material/ListSubheader';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

interface IProjectDetailState {
    thirdTypeExpanded: boolean;
}

export default class ProjectDetail extends React.Component<{}, IProjectDetailState> {
    constructor(props: any) {
        super(props);
        this.state = {
            thirdTypeExpanded: false,
        }
    }
    render() {
        return (
            <div className={`project-detail-container`}>
                <Typography
                    variant="h3"
                    component="div"
                    sx={{
                        mt: "20px",
                        flexGrow: 1,
                        fontStyle: "bold"
                    }}
                >
                    Dự án 01
                </Typography>
                <div className={`section-list-container`}>
                    <Paper className={`section section-database`}>
                        <Typography
                            variant="h4"
                            component="div"
                            sx={{
                                fontStyle: "bold"
                            }}
                        >
                            Database
                        </Typography>
                        <p>Tiến độ</p>
                        <div>
                            <LinearProgress
                                className={`lp-db`}
                                variant="determinate"
                                value={1995 * 100 / 2756}
                            />
                            <p>1995 văn bản / 2756 văn bản</p>
                        </div>
                    </Paper>
                    <Paper className={`section section-member`}>
                        <Typography
                            variant="h4"
                            component="div"
                            sx={{
                                fontStyle: "bold"
                            }}
                        >
                            Thành viên dự án
                        </Typography>
                        <p>Số thành viên tham gia dự án: </p>
                        <Link>6 thành viên</Link>
                        <Button
                            className={`bt-add-member`}
                            variant="contained"
                        >
                            Thêm thành viên
                        </Button>
                    </Paper>
                    <Paper className={`section section-claim`}>
                        <Typography
                            variant="h4"
                            component="div"
                            sx={{
                                fontStyle: "bold"
                            }}
                        >
                            Mệnh đề
                        </Typography>
                        <List
                            sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
                            component="nav"
                            aria-labelledby="nested-list-subheader"
                            subheader={
                                <ListSubheader component="div" id="nested-list-subheader">
                                    Tổng số: 5406 mệnh đề
                                </ListSubheader>
                            }
                        >
                            <ListItemButton>
                                <ListItemText primary="Loại 1: 1802 mệnh đề" />
                            </ListItemButton>
                            <ListItemButton>
                                <ListItemText primary="Loại 2: 1802 mệnh đề" />
                            </ListItemButton>
                            <ListItemButton
                                onClick={() => {
                                    this.setState({
                                        thirdTypeExpanded: !this.state.thirdTypeExpanded
                                    });
                                }}
                            >
                                <ListItemText primary="Loại 3: 1802 mệnh đề" />
                                {this.state.thirdTypeExpanded ? <ExpandLess /> : <ExpandMore />}
                            </ListItemButton>
                            <Collapse
                                in={this.state.thirdTypeExpanded}
                                timeout="auto"
                                unmountOnExit
                            >
                                <List component="div" disablePadding>
                                    <ListItemButton sx={{ pl: 4 }}>
                                        <ListItemText primary="Chi tiết hóa: 272" />
                                    </ListItemButton>
                                    <ListItemButton sx={{ pl: 4 }}>
                                        <ListItemText primary="Khái quát hóa: 270" />
                                    </ListItemButton>
                                    <ListItemButton sx={{ pl: 4 }}>
                                        <ListItemText primary="Phủ định hóa: 500" />
                                    </ListItemButton>
                                    <ListItemButton sx={{ pl: 4 }}>
                                        <ListItemText primary="Viết lại câu: 457" />
                                    </ListItemButton>
                                    <ListItemButton sx={{ pl: 4 }}>
                                        <ListItemText primary="Thay thế từ: 303" />
                                    </ListItemButton>
                                </List>
                            </Collapse>
                        </List>
                        <Button
                            className={`bt-add-member`}
                            variant="contained"
                        >
                            Viết mệnh đề
                        </Button>
                    </Paper>
                    <Paper className={`section section-label`}>
                        <Typography
                            variant="h4"
                            component="div"
                            sx={{
                                fontStyle: "bold"
                            }}
                        >
                            Nhãn
                        </Typography>
                        <p>Tiến độ</p>
                        <div>
                            <LinearProgress
                                className={`lp-db`}
                                variant="determinate"
                                value={3612 * 100 / 5406}
                            />
                            <p>3612 văn bản / 5406 mệnh đề</p>
                        </div>
                        <List
                            sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
                            component="nav"
                            aria-labelledby="nested-list-subheader"
                            subheader={
                                <ListSubheader component="div" id="nested-list-subheader">
                                    Tổng số: 3496 nhãn
                                </ListSubheader>
                            }
                        >
                            <ListItemButton>
                                <ListItemText primary="SUPPORTED: 1650 nhãn" />
                            </ListItemButton>
                            <ListItemButton>
                                <ListItemText primary="REFUTED: 1802 nhãn" />
                            </ListItemButton>
                            <ListItemButton>
                                <ListItemText primary="NOT ENOUGH INFO: 1802 nhãn" />
                            </ListItemButton>
                        </List>
                        <Button
                            className={`bt-add-member`}
                            variant="contained"
                        >
                            Gán nhãn
                        </Button>
                    </Paper>
                </div>
            </div>
        )
    }
}