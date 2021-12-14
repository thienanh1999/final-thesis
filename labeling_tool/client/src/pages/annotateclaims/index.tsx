import { Grid, Accordion, Button, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField, Typography, AccordionSummary, AccordionDetails, Box, Slider, Stack, Paper, Tab, List, ListItem, IconButton, ListItemAvatar, Avatar, ListItemText, Divider, InputLabel, Select, MenuItem, TableContainer, Table, TableRow, TableCell, TableBody, Link, Modal } from "@mui/material";
import React from "react";
import "./index.scss"
import * as generalActions from "../../redux/general/actions";
import * as snackBarActions from "../../redux/snackbar/actions";
import { connect } from "react-redux";
import { LabelType, SearchType, SnackBarType } from "./../../utils/enumerates";
import { RouteComponentProps } from "react-router";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import searchAPI from "../../api/searchAPI";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import DeleteIcon from '@mui/icons-material/Delete';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import projectAPI from "../../api/projectAPI";
import history from "../../history";


interface IAnnotateClaimsUrlParams {
    prjid?: string;
    esid?: string;
}
interface IAnnotateClaimsPropsFromDispatch {
    showTopLoading?: () => void;
    hideTopLoading?: () => void;
    showSnackBar?: (pMsg: string, pDuration: number, pType: SnackBarType) => void;
}
type IAnnotateClaimsProps = RouteComponentProps<IAnnotateClaimsUrlParams> & IAnnotateClaimsPropsFromDispatch;
const mapDispatcherToProps =
    (dispatch: any): IAnnotateClaimsPropsFromDispatch => {
        return {
            showSnackBar: (pMsg: string, pDuration: number, pType: SnackBarType) => dispatch(snackBarActions.showSnackBar(pMsg, pDuration, pType)),
            showTopLoading: () => dispatch(generalActions.showTopLoading()),
            hideTopLoading: () => dispatch(generalActions.hideTopLoading()),
        }
    }
interface IAnnotateClaimsPropsFromDispatch {
    showTopLoading?: () => void;
    hideTopLoading?: () => void;
    showSnackBar?: (pMsg: string, pDuration: number, pType: SnackBarType) => void;
}

interface IAnnotateClaimsState {
    searchContent: string;
    staticSearchCotent: string;
    currentSearchType: SearchType;
    staticSearchType: SearchType;
    searchedArticles: any[];
    noOfSearchRes: number;
    minScore: number | string | Array<number | string>;
    staticMinScore: number | string | Array<number | string>;
    currentTab: number;
    showResCnt: boolean;
    evidenceSets: EvidenceItem[][];
    label: LabelType;
    claimId: number;
    claimContent: string;
    currentSetIdx: number;
    page: number;
    loadingMore: boolean;
    showSkipModal: boolean;
}

enum EvidenceType {
    Sentence,
    TableCell
}

interface EvidenceItem {
    content: any;
    pos: string;
    type: EvidenceType;
    articleId: string;
    title: string;
    time: string;
}

class AnnotateClaims extends React.Component<IAnnotateClaimsProps, IAnnotateClaimsState> {
    public constructor(props: IAnnotateClaimsProps) {
        super(props);
        this.state = this.defaultState;
    }
    private defaultState = {
        staticMinScore: 25,
        staticSearchType: SearchType.SearchAllFields,
        staticSearchCotent: "",
        searchContent: "",
        claimContent: "",
        claimId: 0,
        currentSearchType: SearchType.SearchAllFields,
        searchedArticles: [],
        noOfSearchRes: 0,
        currentTab: -1,
        minScore: 25,
        showResCnt: false,
        evidenceSets: [],
        label: LabelType.NotEnoughInfo,
        currentSetIdx: -1,
        page: 0,
        loadingMore: false,
        showSkipModal: false,
    }
    private getClaim = () => {
        const prjId = this.props.match.params.prjid;
        const { showTopLoading, showSnackBar, hideTopLoading } = this.props;
        showTopLoading!();
        projectAPI.getClaim(prjId!).then(res => {
            if (res && res.status === 200 && !!res.data.claim_id) {
                this.setState({
                    ...this.defaultState,
                    evidenceSets: [],
                    claimId: res.data.claim_id,
                    claimContent: !!res.data.claim ? res.data.claim : "",
                });
            } else {
                history.push("/");
                showSnackBar!(
                    "Tất cả mệnh đề đều đã được xử lý! Bạn vui lòng tạo thêm mệnh đề để gán nhãn nha!",
                    10000,
                    SnackBarType.Info
                );
            }
        }).catch(_ => {
            history.push("/");
            showSnackBar!(
                "Tất cả mệnh đề đều đã được xử lý! Bạn vui lòng tạo thêm mệnh đề để gán nhãn nha!",
                10000,
                SnackBarType.Info
            );
        }).finally(() => {
            hideTopLoading!();
        })
    }
    public componentDidMount() {
        this.getClaim();
    }
    public render() {
        return <Stack direction={{ xs: 'column', sm: 'column', md: 'row', lg: 'row' }} sx={{ p: 2 }}>
            <Grid item xs={6} sx={{ minWidth: "400px" }}>
                <Paper sx={{ p: 2, mr: 2 }} >
                    <Stack spacing={2}>
                        {this.renderCurrentClaim()}
                        {this.renderEvidences()}
                        {this.renderSubmitForm()}
                    </Stack>
                </Paper>
            </Grid>
            <Grid item xs={6} sx={{ minWidth: "400px", maxHeight: "100%" }}>
                <Paper sx={{
                    p: 2,
                    maxHeight: "85vh",
                    overflowY: "scroll"
                }} >
                    <Stack spacing={2}>
                        {this.renderSearchSectionTitle()}
                        {this.renderSearchBox()}
                        {this.renderSearchTypeChoices()}
                        {this.renderMinimumScoreSettings()}
                        {this.renderSearchButton()}
                        {this.renderResultCount()}
                        {this.renderSearchResults()}
                        {this.renderLoadMoreBtn()}
                        {this.renderModal()}
                    </Stack>
                </Paper>
            </Grid>
        </Stack>
    }

    private renderSearchBox = () => {
        return <TextField
            fullWidth
            className={`tf-search`}
            id={`tf-search`}
            label="Nội dung tìm kiếm"
            value={this.state.searchContent}
            onChange={(ev) => {
                this.setState({
                    searchContent: ev.target.value,
                })
            }}
        />;
    }
    private renderLoadMoreBtn = () => {
        return (this.state.noOfSearchRes > this.state.page * 10) && <Box
            sx={{ textAlign: "center" }}
        >


            {this.state.loadingMore ? <span>...</span> : <Box><Link
                onClick={this.loadMoreArticles}
            >
                Tải thêm kết quả
            </Link></Box>}
        </Box>


    }

    private renderSearchTypeChoices = () => {
        return <FormControl sx={{ mt: 1, display: "block" }} component="fieldset">
            <FormLabel component="legend">Phạm vi tìm kiếm</FormLabel>
            <RadioGroup
                row
                aria-label="Phạm vi tìm kiếm"
                name="rbg-search-range"
                value={this.state.currentSearchType}
                onChange={this.onSearchRangeRadioGroupChanged}
            >
                <FormControlLabel
                    value={SearchType.SearchAllFields}
                    control={<Radio />}
                    label="Tất cả các trường"
                />
                <FormControlLabel
                    value={SearchType.SearchByTitle}
                    control={<Radio />}
                    label="Tiêu đề"
                />
            </RadioGroup>
        </FormControl>;
    }

    private renderMinimumScoreSettings = () => {
        const { minScore } = this.state;
        return <div>
            <FormLabel component="legend">Độ liên quan tối thiểu</FormLabel>
            <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
                <Typography variant="subtitle2" > 0 </Typography>
                <Slider
                    aria-label="Min score"
                    value={typeof minScore === 'number' ? minScore : 0}
                    onChange={(_, newVal) =>
                        this.setState({ minScore: newVal })}
                    valueLabelDisplay="on"
                    min={0}
                    max={50}
                />
                <Typography variant="subtitle2" > 50 </Typography>
            </Stack>
        </div>;
    }

    private renderSearchButton = () => {
        const esId = this.props.match.params.esid;
        const {
            searchContent,
            currentSearchType,
            currentSetIdx,
            evidenceSets,
        } = this.state;
        const minScore = typeof this.state.minScore === 'number' ?
            this.state.minScore : 0;
        const {
            showTopLoading,
            hideTopLoading,
        } = this.props;
        return <Box sx={{ pt: 2 }}>
            <Button
                sx={{ width: 150, p: 1 }}
                className={`bt-search`}
                variant="contained"
                onClick={() => {
                    if (!!searchContent) {
                        showTopLoading!();
                        searchAPI.advanceSearch(
                            esId!,
                            searchContent,
                            currentSearchType,
                            minScore,
                            0
                        ).then(res => {
                            if (
                                res &&
                                res.data &&
                                res.data.hits &&
                                res.data.hits.hits &&
                                Array.isArray(res.data.hits.hits)
                            ) {
                                this.setState({
                                    searchedArticles: res.data.hits.hits,
                                    noOfSearchRes: res.data.hits.total.value,
                                    showResCnt: true,
                                    page: 0,
                                    staticSearchCotent: searchContent,
                                    staticMinScore: minScore,
                                    staticSearchType: currentSearchType,
                                });
                            }
                        }).finally(() => {
                            hideTopLoading!();
                            if (evidenceSets.length >= currentSetIdx) {
                                this.setState({
                                    currentSetIdx: currentSetIdx + 1
                                })
                            }
                        });
                    } else {
                        this.props.showSnackBar!("Vui lòng nhập nội dung tìm kiếm!", 3000, SnackBarType.Warning);
                    }
                }}
            >
                Tìm kiếm
            </Button>
        </Box>;
    }

    private loadMoreArticles = () => {
        const esId = this.props.match.params.esid;
        const {
            staticSearchType,
            staticSearchCotent,
            searchedArticles,
            page,
        } = this.state;
        const staticMinScore = typeof this.state.staticMinScore === 'number' ?
            this.state.staticMinScore : 0;
        this.setState({ loadingMore: true });
        searchAPI.advanceSearch(
            esId!,
            staticSearchCotent,
            staticSearchType,
            staticMinScore,
            page + 1,
        ).then(res => {
            if (
                res &&
                res.data &&
                res.data.hits &&
                res.data.hits.hits &&
                Array.isArray(res.data.hits.hits)
            ) {
                res.data.hits.hits.forEach((atc: any) => searchedArticles.push(atc));
                this.setState({
                    searchedArticles: searchedArticles,
                    page: page + 1,
                });
            }
        }).finally(() => {
            this.setState({ loadingMore: false });
        });
    }
    private renderSearchSectionTitle = () => {
        return <Typography
            variant="h6"
        >
            Công cụ tìm kiếm
        </Typography>
    }
    private renderResultCount = () => {
        const { showResCnt, noOfSearchRes } = this.state;
        return !!showResCnt && <span> {`${noOfSearchRes} Kết quả`} </span>
    }

    private renderSearchResults = () => {
        const { searchedArticles, minScore, evidenceSets, currentSetIdx } = this.state;
        return searchedArticles.map((article: any, atcIdx: number) => {
            if (
                article &&
                article._source &&
                article._source.order &&
                searchedArticles[atcIdx]._score > minScore
            ) {
                return <Accordion sx={{ mt: 1 }}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        id={`article-no-${atcIdx}`}
                    >
                        <Box sx={{ flexDirection: 'column' }}>
                            <Typography variant="subtitle2" >
                                {!!article._source.title ? article._source.title : "Không có tiêu đề"}
                            </Typography>
                            <Typography variant="caption" >
                                {!!article._source.time ? article._source.time : "Không rõ thời gian"}
                            </Typography>
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                        {this.getArticleContent(atcIdx).map((currentArticle) => {
                            return currentArticle.type === EvidenceType.Sentence ? <p
                                className={`tg-sentence`}
                                style={{ padding: "5px" }}
                                onClick={() => {
                                    if (evidenceSets.length <= currentSetIdx) {
                                        evidenceSets.push([currentArticle]);
                                        this.setState({
                                            evidenceSets: evidenceSets,
                                            currentTab: this.state.currentTab + 1
                                        });
                                    } else {
                                        evidenceSets[currentSetIdx].push(currentArticle);
                                        this.setState({
                                            evidenceSets: evidenceSets
                                        })
                                    }
                                }}
                            >
                                <Typography variant="caption"  >
                                    {currentArticle.content}
                                </Typography>
                            </p> : <TableContainer component={Paper}>
                                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                    <TableBody>
                                        {(!!currentArticle && !!currentArticle.content && !!currentArticle.content.table && Array.isArray(currentArticle.content.table)) && currentArticle.content.table.map((row: any, rowIdx: number) => (
                                            <TableRow
                                                key={`table-row-${rowIdx}`}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                {(!!row && Array.isArray(row)) && row.map((cell, colIdx) => <TableCell
                                                    className={`tg-sentence`}
                                                    style={{ padding: "5px" }}
                                                    onClick={() => this.onTableCellClicked(
                                                        atcIdx,
                                                        currentArticle.articleId,
                                                        cell.id,
                                                        currentArticle.pos,
                                                        rowIdx,
                                                        colIdx,
                                                        cell.is_header,
                                                        cell.value
                                                    )}
                                                >
                                                    <Typography variant={(!!cell.id && cell.id.includes("header")) ? `subtitle2` : `caption`} >
                                                        {cell.value}
                                                    </Typography>
                                                </TableCell>)}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        })}
                    </AccordionDetails>
                </Accordion>
            } else return <></>;
        })
    }

    private renderModal = () => {
        const modalStyle: any = {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            textAlign: "center",
        };

        return <Modal
            open={this.state.showSkipModal}
            onClose={() => this.setState({ showSkipModal: false })}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={modalStyle}>
                <Typography sx={{ mb: 3 }}>
                    Bạn có chắc chắn muốn bỏ qua mệnh đề hiện tại?
                </Typography>
                <Button
                    sx={{ mr: 3 }}
                    variant="contained"
                    color="error"
                    onClick={() => this.setState({ showSkipModal: false })}
                >
                    Hủy bỏ
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        this.props.showTopLoading!();
                        projectAPI.skipClaim(
                            parseInt(this.props.match.params.prjid!),
                            this.state.claimId
                        ).then(res => {
                            if (res.status === 201) {
                                this.props.showSnackBar!(
                                    "Bỏ qua mệnh đề thành công!",
                                    5000,
                                    SnackBarType.Info
                                );
                                this.getClaim();
                            } else {
                                this.props.showSnackBar!(
                                    "Bỏ qua mệnh đề thất bại!",
                                    5000,
                                    SnackBarType.Error
                                );
                                this.props.hideTopLoading!();
                            }
                        }).catch(() => {
                            this.props.showSnackBar!(
                                "Bỏ qua mệnh đề thất bại!",
                                5000,
                                SnackBarType.Error
                            );
                            this.props.hideTopLoading!();
                        })
                    }}
                >
                    Bỏ qua
                </Button>
            </Box>
        </Modal>
    }
    private onTableCellClicked = (
        atcIdx: number, atcEsId: string, cellPos: string, tablePos: string,
        rowIdx: number, colIdx: number, isHeader: boolean, content: string,
    ) => {
        const { searchedArticles, evidenceSets, currentSetIdx } = this.state;
        if (evidenceSets.length <= currentSetIdx) {
            if (isHeader) {
                evidenceSets.push([{
                    content: content,
                    articleId: atcEsId,
                    pos: cellPos,
                    type: EvidenceType.TableCell,
                    title: searchedArticles[atcIdx]._source.title ?
                        searchedArticles[atcIdx]._source.title : "Không có tiêu đề",
                    time: searchedArticles[atcIdx]._source.time ?
                        searchedArticles[atcIdx]._source.title : "Không rõ thời gian"
                }]);
            } else {
                const firstEleOfRow = searchedArticles[atcIdx]._source[tablePos].table[rowIdx][0];
                const firstEleOfCol = searchedArticles[atcIdx]._source[tablePos].table[0][colIdx];
                const tempSet = [];
                if (firstEleOfRow.is_header) {
                    tempSet.push({
                        content: firstEleOfRow.value,
                        articleId: atcEsId,
                        pos: firstEleOfRow.id,
                        type: EvidenceType.TableCell,
                        title: searchedArticles[atcIdx]._source.title ?
                            searchedArticles[atcIdx]._source.title : "Không có tiêu đề",
                        time: searchedArticles[atcIdx]._source.time ?
                            searchedArticles[atcIdx]._source.title : "Không rõ thời gian"
                    });
                }
                if (firstEleOfCol.is_header) {
                    tempSet.push({
                        content: firstEleOfCol.value,
                        articleId: atcEsId,
                        pos: firstEleOfCol.id,
                        type: EvidenceType.TableCell,
                        title: searchedArticles[atcIdx]._source.title ?
                            searchedArticles[atcIdx]._source.title : "Không có tiêu đề",
                        time: searchedArticles[atcIdx]._source.time ?
                            searchedArticles[atcIdx]._source.title : "Không rõ thời gian"
                    });
                }
                tempSet.push({
                    content: content,
                    articleId: atcEsId,
                    pos: cellPos,
                    type: EvidenceType.TableCell,
                    title: searchedArticles[atcIdx]._source.title ?
                        searchedArticles[atcIdx]._source.title : "Không có tiêu đề",
                    time: searchedArticles[atcIdx]._source.time ?
                        searchedArticles[atcIdx]._source.title : "Không rõ thời gian"
                });
                evidenceSets.push(tempSet);
            }
            this.setState({
                evidenceSets: evidenceSets,
                currentTab: this.state.currentTab + 1
            });
        } else {
            if (isHeader) {
                evidenceSets[currentSetIdx].push({
                    content: content,
                    articleId: atcEsId,
                    pos: cellPos,
                    type: EvidenceType.TableCell,
                    title: searchedArticles[atcIdx]._source.title ?
                        searchedArticles[atcIdx]._source.title : "Không có tiêu đề",
                    time: searchedArticles[atcIdx]._source.time ?
                        searchedArticles[atcIdx]._source.title : "Không rõ thời gian"
                });
            } else {
                const firstEleOfRow = searchedArticles[atcIdx]._source[tablePos].table[rowIdx][0];
                const firstEleOfCol = searchedArticles[atcIdx]._source[tablePos].table[0][colIdx];
                if (firstEleOfRow.is_header) {
                    evidenceSets[currentSetIdx].push({
                        content: firstEleOfRow.value,
                        articleId: atcEsId,
                        pos: firstEleOfRow.id,
                        type: EvidenceType.TableCell,
                        title: searchedArticles[atcIdx]._source.title ?
                            searchedArticles[atcIdx]._source.title : "Không có tiêu đề",
                        time: searchedArticles[atcIdx]._source.time ?
                            searchedArticles[atcIdx]._source.title : "Không rõ thời gian"
                    });
                }
                if (firstEleOfCol.is_header) {
                    evidenceSets[currentSetIdx].push({
                        content: firstEleOfCol.value,
                        articleId: atcEsId,
                        pos: firstEleOfCol.id,
                        type: EvidenceType.TableCell,
                        title: searchedArticles[atcIdx]._source.title ?
                            searchedArticles[atcIdx]._source.title : "Không có tiêu đề",
                        time: searchedArticles[atcIdx]._source.time ?
                            searchedArticles[atcIdx]._source.title : "Không rõ thời gian"
                    });
                }
                evidenceSets[currentSetIdx].push({
                    content: content,
                    articleId: atcEsId,
                    pos: cellPos,
                    type: EvidenceType.TableCell,
                    title: searchedArticles[atcIdx]._source.title ?
                        searchedArticles[atcIdx]._source.title : "Không có tiêu đề",
                    time: searchedArticles[atcIdx]._source.time ?
                        searchedArticles[atcIdx]._source.title : "Không rõ thời gian"
                });
            }
            this.setState({
                evidenceSets: evidenceSets
            })
        }
    }
    private renderCurrentClaim = () => {
        return <React.Fragment>
            <Typography
                variant="h6"
            >
                Mệnh đề hiện tại
            </Typography>
            <Paper elevation={1} sx={{ p: 1 }}>
                <Typography
                    variant="body2"
                >
                    {this.state.claimContent}
                </Typography>
            </Paper>
        </React.Fragment>
    }

    private annotateClaim = () => {
        const { evidenceSets, claimId, label } = this.state;
        const { showTopLoading, hideTopLoading, showSnackBar } = this.props;
        if (evidenceSets.length) {
            const prjId = this.props.match.params.prjid;
            const evidence: number[][][] = [];
            evidenceSets.forEach(set => {
                const reqBodySet: number[][] = [];
                set.forEach(evd => {
                    const reqBodyEvd = evd.type === EvidenceType.Sentence ? [
                        parseInt(evd.articleId),
                        parseInt(evd.pos.split("_")[1])
                    ] : [
                        parseInt(evd.articleId),
                        parseInt(evd.pos.split("_")[1]),
                        parseInt(evd.pos.split("_")[2]),
                        parseInt(evd.pos.split("_")[3]),
                    ]
                    reqBodySet.push(reqBodyEvd);
                })
            })
            showTopLoading!();
            projectAPI.annotateClaim(
                parseInt(prjId!),
                claimId,
                label,
                evidence
            ).then(res => {
                showSnackBar!(
                    "Chúc mừng bạn đã gán nhãn thành công!",
                    5000,
                    SnackBarType.Success
                );
                this.getClaim();
            }).catch(() => hideTopLoading!())

        } else {
            showSnackBar!(
                "Vui lòng đưa ra ít nhất một chứng cứ để có thể gán nhãn!",
                5000,
                SnackBarType.Error
            );
        }
    }
    private renderSubmitForm = () => {
        return <Stack sx={{ mt: 2 }} direction={{ xs: 'column', sm: 'column', md: 'column', lg: "column", xl: "row" }} spacing={2} >
            <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Nhãn</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={this.state.label}
                    label="Nhãn"
                    onChange={(e) => this.setState({ label: e.target.value as LabelType })}
                >
                    <MenuItem value={LabelType.Support}>Support</MenuItem>
                    <MenuItem value={LabelType.Refute}>Refute</MenuItem>
                    <MenuItem value={LabelType.NotEnoughInfo}>Not enough info</MenuItem>
                </Select>
            </FormControl>
            <Button
                variant="contained"
                color="success"
                sx={{ minWidth: 200 }}
                onClick={this.annotateClaim}
            >
                Gán nhãn
            </Button>
            <Button
                onClick={() => this.setState({ showSkipModal: true })}
                variant="contained"
                sx={{ minWidth: 200 }}
            >
                Bỏ qua
            </Button>
        </Stack >
    }

    private renderEvidences = () => {
        const { currentTab, evidenceSets } = this.state;
        return <React.Fragment>
            <Typography
                variant="h6"
            >
                Chứng cứ
            </Typography>
            {!(evidenceSets.length > 0) ? "Chưa có chứng cứ" : <TabContext value={currentTab.toString()} >
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <TabList onChange={(_, newVal) => this.setState({ currentTab: parseInt(newVal) })} aria-label="lab API tabs example">
                        {
                            evidenceSets.map((_, idx) => {
                                return <Tab
                                    label={`Tập ${idx + 1}`}
                                    value={(idx).toString()}
                                />;
                            })}
                    </TabList>
                </Box>
                {evidenceSets.map((evidenceSet, setIdx) => {
                    return <TabPanel sx={{ pt: 0, pb: 0, pr: 1, pl: 1 }} value={(setIdx).toString()}>
                        {!(evidenceSets.length > setIdx) ? <p >Chưa có chứng cứ</p> : <React.Fragment>
                            {evidenceSet.map((evidence, evdIdx) => {
                                return <React.Fragment>

                                    <List dense>
                                        <ListItem
                                            secondaryAction={
                                                <IconButton
                                                    edge="end"
                                                    aria-label="delete"
                                                    onClick={() => {
                                                        if (evidenceSet.length === 1) {
                                                            evidenceSets.splice(setIdx, 1)
                                                            this.setState({
                                                                evidenceSets: evidenceSets,
                                                                currentTab: this.state.currentTab - 1
                                                            })
                                                        } else {
                                                            evidenceSets[setIdx].splice(evdIdx, 1);
                                                            this.setState({
                                                                evidenceSets: evidenceSets
                                                            });
                                                        }
                                                    }}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            }
                                        >
                                            <ListItemAvatar>
                                                <Avatar>
                                                    <TextSnippetIcon />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={evidence.content}
                                                secondary={
                                                    <Box>
                                                        <Typography variant="caption" >
                                                            Tiêu đề:&nbsp;{!!evidence.title ? evidence.title : "Không có tiêu đề"}
                                                            &nbsp;-&nbsp;
                                                            {!!evidence.time ? evidence.time : "Không rõ thời gian"}
                                                        </Typography>
                                                        <Box>
                                                            <Typography variant="caption"  >
                                                                ID bài báo: {evidence.articleId}.
                                                                &nbsp;
                                                            </Typography>
                                                            <Typography variant="caption"  >
                                                                Vị trí trong bài báo: {evidence.pos}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                    </List>
                                    <Divider />
                                </React.Fragment>
                            })}
                        </React.Fragment>}
                    </TabPanel>
                })}
            </TabContext>}
        </React.Fragment>
    }

    private getArticleContent = (idx: number): EvidenceItem[] => {
        const { searchedArticles } = this.state;
        const returnVal: any[] = [];
        searchedArticles[idx]._source.order.forEach((fieldName: string) => {
            returnVal.push({
                content: searchedArticles[idx]._source[fieldName],
                pos: fieldName,
                articleId: searchedArticles[idx]._id,
                title: searchedArticles[idx]._source.title,
                time: searchedArticles[idx]._source.time,
                type: fieldName.includes("sentence") ? EvidenceType.Sentence :
                    EvidenceType.TableCell,
            });
        });
        return returnVal;
    }

    private onSearchRangeRadioGroupChanged = (ev: any) => {
        this.setState({ currentSearchType: ev.target.value });
    }
}

export default connect(null, mapDispatcherToProps)(AnnotateClaims);