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
import Countdown, { zeroPad, calcTimeDelta, formatTimeDelta } from 'react-countdown';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';

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
	operationSets: OperationItem[][];
	currentSearchOperation: OperationItem[];
	label: LabelType;
	claimId: number;
	claimContent: string;
	page: number;
	loadingMore: boolean;
	showSkipModal: boolean;
	countingDown: boolean;
	date: number;
	currentSecond: number;
	lastActionSecond: number;
	showClickBackModal: boolean;
	showLongTimeNoActionModal: boolean;
	showEndTimeModal: boolean;
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

const renderer = ({ minutes, seconds }: { minutes: any; seconds: any; }) => {
	return <span>
		<Typography
			component={"span"}
			variant="h6"
			sx={{ color: "#605F5F", pt: "5px" }}
		>
			{zeroPad(minutes)}:{zeroPad(seconds)}
		</Typography>
	</span>;
};

class AnnotateClaims extends React.Component<IAnnotateClaimsProps, IAnnotateClaimsState> {
	private countDownRef: any;
	public constructor(props: IAnnotateClaimsProps) {
		super(props);
		this.state = this.defaultState;
		this.countDownRef = React.createRef();

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
		currentTab: 0,
		minScore: 25,
		showResCnt: false,
		evidenceSets: [[], [], []],
		operationSets: [[], [], []],
		currentSearchOperation: [],
		label: LabelType.NotEnoughInfo,
		page: 0,
		loadingMore: false,
		showSkipModal: false,
		showLongTimeNoActionModal: false,
		showClickBackModal: false,
		showEndTimeModal: false,
		countingDown: false,
		date: Date.now() + 600000,
		currentSecond: 600,
		lastActionSecond: 600,
	}

	private getClaim = () => {
		const prjId = this.props.match.params.prjid;
		const { showTopLoading, showSnackBar, hideTopLoading } = this.props;
		showTopLoading!();
		projectAPI.getClaim(prjId!).then(res => {
			if (res && res.status === 200 && !!res.data.claim_id) {
				this.countDownRef.current.stop();
				this.setState({
					...this.defaultState,
					claimId: res.data.claim_id,
					claimContent: !!res.data.claim ? res.data.claim : "",
					evidenceSets: [[], [], []],
					operationSets: [[], [], []],
					currentSearchOperation: [],
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

	private triggerAction = () => {
		this.setState({
			lastActionSecond: this.state.currentSecond
		})
	}

	private renderCountDown = () => {
		return <Box>
			<Typography
				variant="h6"
				sx={{ mb: 2 }}
			>
				Đếm ngược
			</Typography>
			<Button
				disabled={this.state.currentSecond === 600}
				variant="contained"
				color="success"
				onClick={() => {
					if (this.countDownRef && this.countDownRef.current) {
						this.countDownRef.current.stop();
						this.setState({
							...this.defaultState,
							claimId: this.state.claimId,
							claimContent: this.state.claimContent,
							evidenceSets: [[], [], []],
							operationSets: [[], [], []],
							currentSearchOperation: [],
						});
					}

				}}
				sx={{
					display: "inline",
					width: "max-content",
					fontSize: "3px",
					mr: 2,
				}}
			>
				<StopIcon />
			</Button>
			<Button
				variant="contained"
				onClick={() => {
					if (this.state.countingDown) this.countDownRef.current.pause();
					else this.countDownRef.current.start()
					this.setState({ countingDown: !this.state.countingDown });
				}}
				sx={{
					display: "inline",
					width: "max-content",
					fontSize: "3px",
					mr: 2,
				}}
			>
				{!this.state.countingDown ?
					<PlayArrowIcon /> :
					<PauseIcon />
				}
			</Button>
			<Countdown
				onTick={({ total }) => {
					if (this.state.lastActionSecond - (total / 1000) === 60) {
						if (this.countDownRef && this.countDownRef.current) {
							this.setState({
								showLongTimeNoActionModal: true,
								countingDown: false,
								lastActionSecond: total / 1000,
							});
							this.countDownRef.current.pause();
						}
					}
					this.setState({ currentSecond: total / 1000 });
				}}
				ref={this.countDownRef}
				autoStart={false}
				date={this.state.date}
				renderer={renderer}
				onComplete={()=>this.setState({showEndTimeModal: true})}
			/>

		</Box>
	}

	public render() {
		return <Stack direction={{ xs: 'column', sm: 'column', md: 'row', lg: 'row' }} sx={{ p: 2 }}>
			<Grid item xs={6} sx={{ minWidth: "400px" }}>
				<Paper sx={{ p: 2, mr: 2 }} >
					<Stack spacing={2}>
						{this.renderCountDown()}
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
					overflowY: "auto"
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
						{this.renderSkipModal()}
						{this.renderNoActionModal()}
						{this.renderEndTimeModal()}
						{this.renderClickBackModal()}
					</Stack>
				</Paper>
			</Grid>
		</Stack>
	}

	private renderSearchBox = () => {
		return <TextField
			disabled={!this.state.countingDown}

			fullWidth
			className={`tf-search`}
			id={`tf-search`}
			label="Nội dung tìm kiếm"
			value={this.state.searchContent}
			onChange={(ev) => {
				this.triggerAction();
				this.setState({
					searchContent: ev.target.value,
				})
			}}
		/>;
	}
	private renderLoadMoreBtn = () => {
		return (this.state.noOfSearchRes > this.state.searchedArticles.length) && <Box
			sx={{ textAlign: "center" }}
		>
			{(this.state.loadingMore || !this.state.countingDown) ? <span>...</span> : <Box><Link
				onClick={this.state.countingDown ? this.loadMoreArticles : () => { }}
			>
				Tải thêm kết quả
			</Link></Box>}
		</Box>
	}

	private renderSearchTypeChoices = () => {
		return <FormControl sx={{ mt: 1, display: "block" }}
			disabled={!this.state.countingDown}

			component="fieldset">
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
					disabled={!this.state.countingDown}

					aria-label="Min score"
					value={typeof minScore === 'number' ? minScore : 0}
					onChange={(_, newVal) => {
						this.triggerAction();
						this.setState({ minScore: newVal })
					}}
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
		} = this.state;
		const minScore = typeof this.state.minScore === 'number' ?
			this.state.minScore : 0;
		const {
			showTopLoading,
			hideTopLoading,
		} = this.props;
		return <Box sx={{ pt: 2 }}>
			<Button
				disabled={!this.state.countingDown}
				sx={{ width: 150, p: 1 }}
				className={`bt-search`}
				variant="contained"
				onClick={() => {
					this.triggerAction();
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
									currentSearchOperation: [
										...this.state.currentSearchOperation,
										{
											operation: "search",
											value: [searchContent],
											time: 600 - this.state.currentSecond,
										}
									]
								});
							}
						}).finally(() => {
							hideTopLoading!();
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
		this.triggerAction();
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
		const { searchedArticles, minScore, evidenceSets, currentTab, operationSets, currentSearchOperation } = this.state;
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
								className={`${this.state.countingDown ? "tg-sentence" : ""}`}
								style={{ padding: "5px" }}
								onClick={() => {
									if (this.state.countingDown) {
										if (!evidenceSets[currentTab].find((evid: EvidenceItem) => evid.articleId === currentArticle.articleId && evid.pos === currentArticle.pos)) {
											if (!operationSets[currentTab].length) {
												operationSets[currentTab].push({
													operation: "start",
													value: ["start"],
													time: 0,
												})
												currentSearchOperation.forEach((op: OperationItem) =>
													operationSets[currentTab].push(op));

											} else {
												currentSearchOperation.forEach((op: OperationItem) => {
													if (!operationSets[currentTab].includes(op)) {
														operationSets[currentTab].push(op);
													}
												})
											}
											operationSets[currentTab].push({
												operation: "highlight",
												value: [
													parseInt(currentArticle.articleId),
													parseInt(currentArticle.pos.split('_')[1])
												],
												time: this.state.currentSecond,
											})
											evidenceSets[currentTab].push(currentArticle);
											this.setState({
												evidenceSets: evidenceSets,
												operationSets: operationSets,
											});
										}

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
													className={`${this.state.countingDown ? "tg-sentence" : ""}`}
													style={{ padding: "5px" }}
													onClick={() => {
														if (this.state.countingDown) {
															if (!evidenceSets[currentTab].find((evid: EvidenceItem) => evid.articleId === currentArticle.articleId && evid.pos === cell.id)) {
																this.onTableCellClicked(
																	atcIdx,
																	currentArticle.articleId,
																	cell.id,
																	currentArticle.pos,
																	rowIdx,
																	colIdx,
																	cell.is_header,
																	cell.value
																)
															}
														}
													}}
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

	private renderSkipModal = () => {
		const modalStyle: any = {
			position: 'absolute',
			top: '50%',
			left: '50%',
			transform: 'translate(-50%, -50%)',
			bgcolor: 'background.paper',
			borderRadius: 2,
			boxShadow: 24,
			p: 3,
			textAlign: "start",
		};

		return <Modal
			open={this.state.showSkipModal}
			aria-labelledby="modal-modal-title"
			aria-describedby="modal-modal-description"
		>
			<Box sx={modalStyle}>
				<Typography
					variant="h5"
					component="p"
					sx={{
						fontStyle: "bold",
						fontWeight: 500,
						mb: 2,
					}}
				>
					Bỏ qua mệnh đề
				</Typography>
				<Typography sx={{ mb: 3 }}>
					Bạn có chắc chắn muốn bỏ qua mệnh đề hiện tại?
				</Typography>
				<Stack spacing={2} direction={"row-reverse"}>

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
										SnackBarType.Success
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
					<Button
						sx={{ background: "#BC6181" }}
						variant="contained"
						onClick={() => this.setState({ showSkipModal: false })}
					>
						Hủy bỏ
					</Button>
				</Stack>

			</Box>
		</Modal>
	}
	private renderNoActionModal = () => {
		const modalStyle: any = {
			position: 'absolute',
			top: '50%',
			left: '50%',
			transform: 'translate(-50%, -50%)',
			bgcolor: 'background.paper',
			borderRadius: 2,
			boxShadow: 24,
			p: 3,
			textAlign: "start",
		};

		return <Modal
			open={this.state.showLongTimeNoActionModal}
			aria-labelledby="modal-modal-title"
			aria-describedby="modal-modal-description"
		>
			<Box sx={modalStyle}>
				<Typography
					variant="h5"
					component="p"
					sx={{
						fontStyle: "bold",
						fontWeight: 500,
						mb: 2,
					}}
				>
					Tạm dừng hoạt động
				</Typography>
				<Typography sx={{ mb: 3 }}>
					Bạn đã dừng hoạt động quá 1 phút, hệ thống tạm<br></br> thời ngừng đếm ngược.
				</Typography>
				<Stack spacing={2} direction={"row-reverse"}>
					<Button
						variant="contained"
						onClick={() => {
							if (this.countDownRef && this.countDownRef.current) {
								this.countDownRef.current.start();
								this.setState({ countingDown: true, showLongTimeNoActionModal: false });
							}
						}}
					>
						Tiếp tục
					</Button>
					<Button
						variant="contained"
						sx={{ background: "#BC6181" }}
						onClick={() => {
							if (this.countDownRef && this.countDownRef.current) {
								this.countDownRef.current.stop();
								this.setState({
									...this.defaultState,
									claimId: this.state.claimId,
									claimContent: this.state.claimContent,
									evidenceSets: [[], [], []],
									operationSets: [[], [], []],
									currentSearchOperation: [],
								});
							}
						}}
					>
						Đặt lại
					</Button>

				</Stack>

			</Box>
		</Modal>
	}
	private renderEndTimeModal = () => {
		const modalStyle: any = {
			position: 'absolute',
			top: '50%',
			left: '50%',
			transform: 'translate(-50%, -50%)',
			bgcolor: 'background.paper',
			borderRadius: 2,
			boxShadow: 24,
			p: 3,
			textAlign: "start",
		};

		return <Modal
			open={this.state.showEndTimeModal}
			aria-labelledby="modal-modal-title"
			aria-describedby="modal-modal-description"
		>
			<Box sx={modalStyle}>
				<Typography
					variant="h5"
					component="p"
					sx={{
						fontStyle: "bold",
						fontWeight: 500,
						mb: 2,
					}}
				>
					Hết thời gian gán nhãn
				</Typography>
				<Typography sx={{ mb: 3 }}>
					10 phút gán nhãn đã trôi qua, bạn có muốn hệ thống <br></br>
					sẽ tự động gán nhãn NOT ENOUGH INFO cho mệnh đề?

				</Typography>
				<Stack spacing={2} direction={"row-reverse"}>
					<Button
						variant="contained"
						onClick={() => {
							this.annotateClaim(true);
						}}
					>
						Gán nhãn NOT ENOUGH INFO
					</Button>
					<Button
						variant="contained"
						sx={{ background: "#BC6181" }}
						onClick={() => {
							if (this.countDownRef && this.countDownRef.current) {
								this.countDownRef.current.stop();
								this.setState({
									...this.defaultState,
									claimId: this.state.claimId,
									claimContent: this.state.claimContent,
									evidenceSets: [[], [], []],
									operationSets: [[], [], []],
									currentSearchOperation: [],
								});
							}
						}}
					>
						Đặt lại
					</Button>

				</Stack>

			</Box>
		</Modal>
	}
	private renderClickBackModal = () => {
		const modalStyle: any = {
			position: 'absolute',
			top: '50%',
			left: '50%',
			transform: 'translate(-50%, -50%)',
			bgcolor: 'background.paper',
			borderRadius: 2,
			boxShadow: 24,
			p: 3,
			textAlign: "start",
		};
		const prjId = this.props.match.params.prjid;

		return <Modal
			open={this.state.showClickBackModal}
			aria-labelledby="modal-modal-title"
			aria-describedby="modal-modal-description"
		>
			<Box sx={modalStyle}>
				<Typography
					variant="h5"
					component="p"
					sx={{
						fontStyle: "bold",
						fontWeight: 500,
						mb: 2,
					}}
				>
					Quay lại
				</Typography>
				<Typography sx={{ mb: 3 }}>
					Bạn đang trong quá trình gán nhãn, quay lại<br></br>
					bây giờ mọi chứng cứ sẽ không được lưu lại!
				</Typography>
				<Stack spacing={2} direction={"row-reverse"}>
					<Button
						variant="contained"
						onClick={() => {
							if (this.countDownRef && this.countDownRef.current) {
								this.countDownRef.current.start();
								this.setState({ countingDown: true, showClickBackModal: false });
							}
						}}
					>
						Tiếp tục
					</Button>
					<Button
						variant="contained"
						sx={{ background: "#BC6181" }}
						onClick={() => {
							history.push(`/project/${prjId}/`)
						}}
					>
						Quay lại
					</Button>

				</Stack>

			</Box>
		</Modal>
	}

	private onTableCellClicked = (
		atcIdx: number, atcEsId: string, cellPos: string, tablePos: string,
		rowIdx: number, colIdx: number, isHeader: boolean, content: string,
	) => {
		const { searchedArticles, evidenceSets, currentTab, operationSets, currentSearchOperation } = this.state;
		if (this.state.countingDown) {
			if (!operationSets[currentTab].length) {
				operationSets[currentTab].push({
					operation: "start",
					value: ["start"],
					time: 0,
				})
				currentSearchOperation.forEach((op: OperationItem) =>
					operationSets[currentTab].push(op));

			} else {
				currentSearchOperation.forEach((op: OperationItem) => {
					if (!operationSets[currentTab].includes(op)) {
						operationSets[currentTab].push(op);
					}
				})
			}

			if (isHeader) {
				operationSets[currentTab].push({
					operation: "highlight",
					value: [
						parseInt(atcEsId),
						parseInt(cellPos.split('_')[cellPos[0] === 'h' ? 2 : 1]),
						parseInt(cellPos.split('_')[cellPos[0] === 'h' ? 3 : 2]),
						parseInt(cellPos.split('_')[cellPos[0] === 'h' ? 4 : 3])
					],
					time: this.state.currentSecond,
				});
				evidenceSets[currentTab].push({
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
					operationSets[currentTab].push({
						operation: "highlight",
						value: [
							parseInt(atcEsId),
							parseInt(firstEleOfRow.id.split('_')[firstEleOfRow.id[0] === 'h' ? 2 : 1]),
							parseInt(firstEleOfRow.id.split('_')[firstEleOfRow.id[0] === 'h' ? 3 : 2]),
							parseInt(firstEleOfRow.id.split('_')[firstEleOfRow.id[0] === 'h' ? 4 : 3])
						],
						time: this.state.currentSecond,
					});
					evidenceSets[currentTab].push({
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
					operationSets[currentTab].push({
						operation: "highlight",
						value: [
							parseInt(atcEsId),
							parseInt(firstEleOfCol.id.split('_')[firstEleOfCol.id[0] === 'h' ? 2 : 1]),
							parseInt(firstEleOfCol.id.split('_')[firstEleOfCol.id[0] === 'h' ? 3 : 2]),
							parseInt(firstEleOfCol.id.split('_')[firstEleOfCol.id[0] === 'h' ? 4 : 3])
						],
						time: this.state.currentSecond,
					});
					evidenceSets[currentTab].push({
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
				operationSets[currentTab].push({
					operation: "highlight",
					value: [
						parseInt(atcEsId),
						parseInt(cellPos.split('_')[1]),
						parseInt(cellPos.split('_')[2]),
						parseInt(cellPos.split('_')[3])
					],
					time: this.state.currentSecond,
				});
				evidenceSets[currentTab].push({
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
				evidenceSets: evidenceSets,
				operationSets: operationSets,
			});
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

	private annotateClaim = (endTime: boolean) => {
		const { evidenceSets, claimId, label, operationSets } = this.state;
		const { showTopLoading, hideTopLoading, showSnackBar } = this.props;
		if (evidenceSets[0].length || evidenceSets[1].length || evidenceSets[2].length) {
			showTopLoading!();
			const prjId = this.props.match.params.prjid;
			const evidence: number[][][] = [];
			evidenceSets.forEach(set => {
				if (set.length) {
					const reqBodySet: number[][] = [];
					set.forEach(evd => {
						const reqBodyEvd = evd.type === EvidenceType.Sentence ? [
							parseInt(evd.articleId),
							parseInt(evd.pos.split("_")[1])
						] : [
							parseInt(evd.articleId),
							parseInt(evd.pos.split("_")[evd.pos[0] === 'h' ? 2 : 1]),
							parseInt(evd.pos.split("_")[evd.pos[0] === 'h' ? 3 : 2]),
							parseInt(evd.pos.split("_")[evd.pos[0] === 'h' ? 4 : 3]),
						]
						reqBodySet.push(reqBodyEvd);
					})
					evidence.push(reqBodySet);
				}
			})
			projectAPI.annotateClaim(
				parseInt(prjId!),
				claimId,
				endTime ? LabelType.NotEnoughInfo : label,
				evidence,
				operationSets.filter(set => set.length > 0)
			).then(res => {
				if (res.status === 201) {
					showSnackBar!(
						"Chúc mừng bạn đã gán nhãn thành công!",
						5000,
						SnackBarType.Success
					);
					this.getClaim();
				} else {
					showSnackBar!(
						"Gán nhãn thất bại!",
						5000,
						SnackBarType.Error
					);
				}
			}).catch(() => {
				showSnackBar!(
					"Gán nhãn thất bại!",
					5000,
					SnackBarType.Error
				);
				hideTopLoading!();
				this.getClaim();
			})
		} else {
			showSnackBar!(
				"Vui lòng đưa ra ít nhất một chứng cứ để có thể gán nhãn!",
				5000,
				SnackBarType.Error
			);
		}
	}
	private renderSubmitForm = () => {
		const prjId = this.props.match.params.prjid;
		return <Stack sx={{ mt: 2 }} direction={{ xs: 'column', sm: 'column', md: 'column', lg: "row", xl: "row" }} spacing={2} >
			<FormControl
				sx={{ width: "200px" }}
				disabled={!this.state.countingDown}
			>
				<InputLabel id="demo-simple-select-label">Nhãn</InputLabel>
				<Select
					labelId="demo-simple-select-label"
					id="demo-simple-select"
					value={this.state.label}
					label="Nhãn"
					onChange={(e) => {
						this.triggerAction();
						this.setState({ label: e.target.value as LabelType })
					}}
				>
					<MenuItem value={LabelType.Support}>Support</MenuItem>
					<MenuItem value={LabelType.Refute}>Refute</MenuItem>
					<MenuItem value={LabelType.NotEnoughInfo}>Not enough info</MenuItem>
				</Select>
			</FormControl>
			<Button
				variant="contained"
				color="success"
				sx={{ width: "200px" }}
				onClick={() => {
					if (this.state.currentSecond === 600)
						history.push(`/project/${prjId}/`)
					else {
						this.setState({showClickBackModal: true});
					}
				}}
			>
				Quay lại
			</Button>
			<Button
				disabled={!this.state.countingDown}
				onClick={() => this.setState({ showSkipModal: true })}
				variant="contained"
				sx={{ width: "200px", background: "#BC6181" }}
			>
				Bỏ qua
			</Button>
			<Button
				disabled={!this.state.countingDown}
				variant="contained"
				sx={{ width: "200px" }}
				onClick={() => this.annotateClaim(false)}
			>
				Gán nhãn
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
			<TabContext value={currentTab.toString()} >
				<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
					<TabList onChange={(_, newVal) => {
						this.triggerAction();
						this.setState({ currentTab: parseInt(newVal) })
					}} aria-label="lab API tabs example">
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
						<React.Fragment>
							{!evidenceSet.length ? <p >Chưa có chứng cứ</p> :
								evidenceSet.map((evidence, evdIdx) => {
									return <React.Fragment>

										<List dense>
											<ListItem
												secondaryAction={
													<IconButton
														disabled={!this.state.countingDown}
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
						</React.Fragment>
					</TabPanel>
				})}
			</TabContext>
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
		this.triggerAction();
		this.setState({ currentSearchType: ev.target.value });
	}
}

export default connect(null, mapDispatcherToProps)(AnnotateClaims);