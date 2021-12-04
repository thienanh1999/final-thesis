import { Box, Button, FormHelperText, Paper, Stack, Tab, TextField, Typography } from "@mui/material";
import React from "react";
import "./index.scss"
import * as generalActions from "../../redux/general/actions";
import * as snackBarActions from "../../redux/snackbar/actions";
import { connect } from "react-redux";
import { Claim3Type, SnackBarType } from "../../utils/enumerates";
import { RouteComponentProps } from "react-router";
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import SearchTab from "./components/SearchTab";
import projectAPI from "../../api/projectAPI";

interface ICreateClaimsUrlParams {
    prjid?: string;
    esid?: string;
}
interface ICreateClaimsPropsFromDispatch {
    showTopLoading?: () => void;
    hideTopLoading?: () => void;
    showSnackBar?: (pMsg: string, pDuration: number, pType: SnackBarType) => void;
}
type ICreateClaimsProps = RouteComponentProps<ICreateClaimsUrlParams> & ICreateClaimsPropsFromDispatch;
const mapDispatcherToProps =
    (dispatch: any): ICreateClaimsPropsFromDispatch => {
        return {
            showSnackBar: (pMsg: string, pDuration: number, pType: SnackBarType) => dispatch(snackBarActions.showSnackBar(pMsg, pDuration, pType)),
            showTopLoading: () => dispatch(generalActions.showTopLoading()),
            hideTopLoading: () => dispatch(generalActions.hideTopLoading()),
        }
    }
interface ICreateClaimsPropsFromDispatch {
    showTopLoading?: () => void;
    hideTopLoading?: () => void;
    showSnackBar?: (pMsg: string, pDuration: number, pType: SnackBarType) => void;
}

interface ICreateClaimsState {
    currentArticle?: any;
    currentTab: string;
    highlighted: string[];
    type3DropdownValue: Claim3Type;
    errMsgC1: string;
    errMsgC2: string;
    errMsgC3: string;
    errMsgC3Type: string;
    errMsg: string;
    c1: string;
    c2: string;
    c3: string;
    docId: number;
}

class CreateClaims extends React.Component<ICreateClaimsProps, ICreateClaimsState> {
    constructor(props: ICreateClaimsProps) {
        super(props);
        this.state = {
            currentArticle: {},
            currentTab: "1",
            errMsgC1: "",
            errMsgC2: "",
            errMsgC3: "",
            errMsgC3Type: "",
            errMsg: "",
            c1: "",
            c2: "",
            c3: "",
            docId: 0,
            highlighted: [],
            type3DropdownValue: Claim3Type.None,
        }
    }

    componentDidMount() {
        this.getNewHighLight();
    }

    render() {
        const prjId = this.props.match.params.prjid;
        const { currentTab, type3DropdownValue, errMsgC1, errMsgC2, errMsgC3, errMsgC3Type, c1, c2, c3, docId, errMsg } = this.state;
        const { showTopLoading, hideTopLoading, showSnackBar } = this.props;
        return (
            <Box
                className={`create-claims-container`}
                sx={{
                    typography: 'body1',
                    pr: "5vw",
                    pl: "5vw",
                }}
            >
                <Typography
                    variant="h4"
                    component="div"
                    sx={{
                        mt: "20px",
                        flexGrow: 1,
                        fontStyle: "bold",
                        textAlign: "center"
                    }}
                >
                    Tạo mệnh đề mới
                </Typography>
                <Box >
                    <TabContext
                        value={currentTab}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <TabList onChange={(_, newVal) => this.setState({ currentTab: newVal })} aria-label="lab API tabs example">
                                <Tab label="Viết mệnh đề" value="1" />
                                <Tab label="Tìm kiếm bài báo" value="2" />
                            </TabList>
                        </Box>
                        <TabPanel value="1">
                            <Paper
                                sx={{
                                    mt: 2,
                                    p: 1,
                                    boxShadow: "-2px 0px 2px 1px #888888",
                                    borderRight: "1px solid #888888",
                                    maxHeight: "40vh",
                                    overflowY: "scroll"
                                }}
                            >
                                {this.getArticleContent().map(sentence => {
                                    return <p className={sentence.isHighlighted ? "highlighted" : ""}>
                                        {sentence.content}
                                    </p>
                                })}
                            </Paper>
                            <TextField
                                fullWidth
                                sx={{ mt: 2 }}
                                className={`tf-search`}
                                id={`tf-search`}
                                label="Mệnh đề chỉ sử dụng trích đoạn"
                                value={c1}
                                onChange={(ev) => {
                                    this.setState({
                                        c1: ev.target.value,
                                        errMsgC1: "",
                                        errMsg: "",
                                    })
                                }}
                                error={!!errMsgC1}
                                helperText={errMsgC1}
                            />
                            <TextField
                                fullWidth
                                sx={{ mt: 2 }}
                                className={`tf-search`}
                                id={`tf-search`}
                                label="Mệnh đề sử dụng thêm thông tin bên ngoài"
                                value={c2}
                                onChange={(ev) => {
                                    this.setState({
                                        c2: ev.target.value,
                                        errMsg: "",
                                        errMsgC2: "",
                                    })
                                }}
                                error={!!errMsgC2}
                                helperText={errMsgC2}
                            />
                            <TextField
                                sx={{ mt: 2 }}
                                fullWidth
                                className={`tf-search`}
                                id={`tf-search`}
                                label="Mệnh đề biến đổi"
                                value={c3}
                                error={!!errMsgC3}
                                helperText={errMsgC3}
                                onChange={(ev) => {
                                    this.setState({
                                        errMsgC3: "",
                                        errMsg: "",
                                        c3: ev.target.value,
                                    })
                                    if (ev.target.value === "") {
                                        this.setState({
                                            errMsgC3Type: ""
                                        });
                                    }
                                }}
                            />
                            <Stack sx={{ mt: 2 }} direction={{ xs: 'column', sm: 'column', md: 'row' }} spacing={2} >
                                <FormControl
                                    error={!!errMsgC3Type}
                                    sx={{
                                        minWidth: 200,
                                    }}
                                >
                                    <InputLabel id="demo-simple-select-label">Phương pháp biến đổi</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        value={type3DropdownValue}
                                        label="Phương pháp biến đổi"
                                        onChange={(newVal) => this.setState({
                                            type3DropdownValue: newVal.target.value as Claim3Type,
                                            errMsgC3Type: ""
                                        })}
                                    >
                                        <MenuItem value={Claim3Type.MoreSpecific}>
                                            Chi tiết hóa
                                        </MenuItem>
                                        <MenuItem value={Claim3Type.Generalization}>
                                            Khái quát hóa
                                        </MenuItem>
                                        <MenuItem value={Claim3Type.Negation}>
                                            Phủ định hóa
                                        </MenuItem>
                                        <MenuItem value={Claim3Type.Paraphrasing}>
                                            Viết lại câu
                                        </MenuItem>
                                        <MenuItem value={Claim3Type.EntitySubstitution}>
                                            Thay thế đại từ
                                        </MenuItem>
                                    </Select>
                                    <FormHelperText>{errMsgC3Type}</FormHelperText>
                                </FormControl>
                                <Button
                                    sx={{
                                        minWidth: 200,
                                        maxHeight: 55,
                                    }}
                                    className={`bt-submit`}
                                    color="success"
                                    variant="contained"
                                    onClick={() => {
                                        if (this.validateClaims()) {
                                            showTopLoading!();
                                            projectAPI.submitClaims(
                                                parseInt(prjId!),
                                                docId,
                                                c1,
                                                c2,
                                                c3,
                                                type3DropdownValue
                                            ).then(res => {
                                                console.log(res)
                                                if (res.status === 201) {
                                                    showSnackBar!(
                                                        "Tạo mệnh đề thành công!",
                                                        10000,
                                                        SnackBarType.Success
                                                    );
                                                    this.getNewHighLight();
                                                } else {
                                                    showSnackBar!(
                                                        "Tạo mệnh đề thất bại!",
                                                        10000,
                                                        SnackBarType.Error
                                                    );
                                                    hideTopLoading!()
                                                }
                                            }).catch(_ => {
                                                showSnackBar!(
                                                    "Tạo mệnh đề thất bại!",
                                                    10000,
                                                    SnackBarType.Error
                                                );
                                                hideTopLoading!()
                                            });
                                        }
                                    }}
                                >
                                    Lưu mệnh đề
                                </Button>
                                <Button
                                    sx={{
                                        minWidth: 200,
                                        maxHeight: 55,
                                    }}
                                    className={`bt-submit`}
                                    variant="contained"
                                    onClick={() => {
                                        this.getNewHighLight();
                                        showSnackBar!(
                                            "Chúc mừng! Bạn đã bỏ qua bài báo vừa rồi!",
                                            10000,
                                            SnackBarType.Success
                                        );
                                        this.getNewHighLight();
                                    }}
                                >
                                    Bỏ qua
                                </Button>
                            </Stack>
                            {!!errMsg && <span style={{ color: "#d32f2f" }}>{errMsg}</span>}

                        </TabPanel>
                        <TabPanel value="2">
                            <SearchTab esId={this.props.match.params.esid} />
                        </TabPanel>
                    </TabContext>
                </Box>
            </Box >
        )
    }

    private getNewHighLight = () => {
        const prjId = this.props.match.params.prjid;
        const { showTopLoading, hideTopLoading } = this.props;
        showTopLoading!();
        projectAPI.getHighLights(prjId!).then((res: any) => {
            if (
                !!res &&
                !!res.data &&
                !!res.data.document_data &&
                !!res.data.highlight &&
                !!res.data.document_id &&
                Array.isArray(res.data.highlight)
            ) {
                this.setState({
                    currentArticle: res.data.document_data,
                    highlighted: res.data.highlight,
                    docId: res.data.document_id,
                    errMsgC1: "",
                    errMsgC2: "",
                    errMsgC3: "",
                    errMsgC3Type: "",
                    errMsg: "",
                    c1: "",
                    c2: "",
                    c3: "",
                    type3DropdownValue: Claim3Type.None,
                });
            }
            hideTopLoading!();
        })
    }
    private getArticleContent = (): { content: string; isHighlighted: boolean }[] => {
        const { currentArticle, highlighted } = this.state;
        const returnVal: { content: string; isHighlighted: boolean }[] = [];
        if (
            currentArticle &&
            currentArticle.order &&
            Array.isArray(currentArticle.order)
        ) {
            currentArticle.order.forEach((fieldName: string) => {
                if (fieldName.includes("sen"))
                    returnVal.push({
                        content: currentArticle[fieldName],
                        isHighlighted: highlighted.includes(fieldName),
                    });
            });
        }
        return returnVal;
    }

    private validateClaims = () => {
        const { c1, c2, c3, type3DropdownValue } = this.state;
        let ok = true;
        if (c1 === "" && c2 === "" && c3 === "") {
            ok = false;
            this.setState({
                errMsg: "Vui lòng viết 1 trong 3 loại mệnh đề"
            });
        }
        if (c1 !== "" && c1.length < 30) {
            ok = false;
            this.setState({
                errMsgC1: "Mệnh đề phải dài ít nhất 30 ký tự",
            })
        }
        if (c2 !== "" && c2.length < 30) {
            ok = false;
            this.setState({
                errMsgC2: "Mệnh đề phải dài ít nhất 30 ký tự",
            })
        }
        if (c3 !== "" && c3.length < 30) {
            ok = false;
            this.setState({
                errMsgC3: "Mệnh đề phải dài ít nhất 30 ký tự",
            })
        }
        if (c3 !== "" && type3DropdownValue === Claim3Type.None) {
            ok = false;
            this.setState({
                errMsgC3Type: "Vui lòng lựa chọn 1 giá trị",
            })
        }
        return ok;
    }
}

export default connect(null, mapDispatcherToProps)(CreateClaims);