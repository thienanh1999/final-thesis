import "./index.scss";
import React from "react";
import { Button, Paper, Typography, Link, Modal, Box } from "@mui/material";
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
interface IProjectDetailState {
    thirdTypeExpanded: boolean;
    prjDetail: any;
    showMemberModal: boolean;
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
                    {prjDetail?.project_name}
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
                                value={prjDetail?.document?.processed * 100 / prjDetail?.document?.total}
                            />
                            <p>{`${prjDetail?.document?.processed} văn bản / ${prjDetail?.document?.total} văn bản`}</p>
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
                        <Link
                            onClick={() => {
                                this.setState({ showMemberModal: true });
                            }}
                            sx={{
                                cursor: "pointer",
                            }}
                        >
                            {`${prjDetail.project_member?.length} thành viên`}
                        </Link>
                        <Button
                            className={`bt-add-member`}
                            variant="contained"
                            onClick={() => {
                                this.setState({ showMemberModal: true });
                            }}
                        >
                            Quản lý thành viên
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
                        {(!!prjDetail?.claim?.total) ? <List
                            sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
                            component="nav"
                            aria-labelledby="nested-list-subheader"
                            subheader={
                                <ListSubheader component="div" id="nested-list-subheader">
                                    {`Tổng số: ${prjDetail.claim?.total} mệnh đề`}
                                </ListSubheader>
                            }
                        >
                            <ListItemButton>
                                <ListItemText primary={`Loại 1: ${prjDetail.claim?.type_1} mệnh đề`} />
                            </ListItemButton>
                            <ListItemButton>
                                <ListItemText primary={`Loại 2: ${prjDetail.claim?.type_2} mệnh đề`} />
                            </ListItemButton>
                            <ListItemButton
                                onClick={() => {
                                    this.setState({
                                        thirdTypeExpanded: !this.state.thirdTypeExpanded
                                    });
                                }}
                            >
                                <ListItemText primary={`Loại 3: ${prjDetail.claim?.type_3?.total} mệnh đề`} />
                                {this.state.thirdTypeExpanded ? <ExpandLess /> : <ExpandMore />}
                            </ListItemButton>
                            <Collapse
                                in={this.state.thirdTypeExpanded}
                                timeout="auto"
                                unmountOnExit
                            >
                                <List component="div" disablePadding>
                                    <ListItemButton sx={{ pl: 4 }}>
                                        <ListItemText primary={`Chi tiết hóa: ${prjDetail.claim?.type_3?.more_specific}`} />
                                    </ListItemButton>
                                    <ListItemButton sx={{ pl: 4 }}>
                                        <ListItemText primary={`Khái quát hóa: ${prjDetail.claim?.type_3?.generalization}`} />
                                    </ListItemButton>
                                    <ListItemButton sx={{ pl: 4 }}>
                                        <ListItemText primary={`Phủ định hóa: ${prjDetail.claim?.type_3?.negation}`} />
                                    </ListItemButton>
                                    <ListItemButton sx={{ pl: 4 }}>
                                        <ListItemText primary={`Viết lại câu: ${prjDetail.claim?.type_3?.paraphrasing}`} />
                                    </ListItemButton>
                                    <ListItemButton sx={{ pl: 4 }}>
                                        <ListItemText primary={`Thay thế từ: ${prjDetail.claim?.type_3?.entity_substitution}`} />
                                    </ListItemButton>
                                </List>
                            </Collapse>
                        </List> : <Typography
                            variant="h5"
                            component="div"
                            sx={{
                                m: 5,
                                fontStyle: "bold"
                            }}
                        >
                            Hiện tại chưa có mệnh đề nào được tạo
                        </Typography>}
                        <Button
                            className={`bt-add-member`}
                            variant="contained"
                            onClick={() => history.push(`/project/${prjDetail.project_id}/${prjDetail.es_id}/createclaims`)}
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
                        {!!prjDetail.claim?.total ?
                            <div>
                                <p>Tiến độ</p>
                                <div>
                                    <LinearProgress
                                        className={`lp-db`}
                                        variant="determinate"
                                        value={prjDetail.label?.total_verified_claim / prjDetail.claim?.total}
                                    />
                                    <p>{`${prjDetail.label?.total_verified_claim} nhãn / ${prjDetail.claim?.total} mệnh đề`}</p>
                                </div>
                                <List
                                    sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
                                    component="nav"
                                    aria-labelledby="nested-list-subheader"
                                    subheader={
                                        <ListSubheader component="div" id="nested-list-subheader">
                                            {`Tổng số: ${prjDetail.label?.total_verified_claim} nhãn`}
                                        </ListSubheader>
                                    }
                                >
                                    <ListItemButton>
                                        <ListItemText primary={`SUPPORTED: ${prjDetail.label?.supported} nhãn`} />
                                    </ListItemButton>
                                    <ListItemButton>
                                        <ListItemText primary={`REFUTED: ${prjDetail.label?.refuted} nhãn`} />
                                    </ListItemButton>
                                    <ListItemButton>
                                        <ListItemText primary={`NOT ENOUGH INFO: ${prjDetail.label?.nei} nhãn`} />
                                    </ListItemButton>
                                </List>
                            </div> :
                            <Typography
                                variant="h5"
                                component="div"
                                sx={{
                                    m: 5,
                                    fontStyle: "bold"
                                }}
                            >
                                Hiện tại chưa có nhãn nào được gán
                            </Typography>
                        }
                        <Button
                            className={`bt-add-member`}
                            onClick={() => history.push(`/project/${prjDetail.project_id}/${prjDetail.es_id}/annotateclaims`)}
                            variant="contained"
                        >
                            Gán nhãn
                        </Button>
                    </Paper>
                </div>
                <Modal
                    open={this.state.showMemberModal}
                    onClose={() => this.setState({ showMemberModal: false })}
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
            </div >
        )
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