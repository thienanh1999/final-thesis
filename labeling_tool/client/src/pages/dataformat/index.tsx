import { Box } from "@mui/material";
import React from "react";

export default class DataFormatInfoPage extends React.Component {
	render() {
		return <Box>
			{/* Dữ liệu đầu vào là một tập tin JSON chứa thông tin của nhiều văn bản được lưu trữ dưới dạng một JSON Array.
			Mỗi văn bản là một JSON Object bao gồm 3 trường thông tin chính:
			•	_id: id của văn bảng trong project, đảm bảo là duy nhất
			•	title: tiêu đề của văn bản
			•	order: danh sách các thành phần của văn bản được sắp xếp theo thứ tự xuất hiện của chúng từ trên xuống dưới. Có thể là: table hoặc sentence
			Với mỗi thành phần được liệt kê trong trường order, định nghĩa chúng dưới dạng một trường thông tin của văn bản theo cấu trúc như sau:
			Với câu hay sentence:
			•	key: sentence_{"<số thứ tự của câu trong văn bản> (VD: sentence_0, sentence_1)"}
			•	value: nội dung của câu
			Với bảng hay table:
			•	key: table_{"<số thứ tự của bảng trong văn bản> (VD: table_0, table_1)"}
			•	value: mảng 2 chiều biểu thị cho các hàng và cột trong bảng, mỗi phần tử của mảng tương ứng với các ô trong bảng:
			o	id: id của ô ở trong bảng theo định dạng cell_{"<số hàng>_<số cột> hoặc header_cell_<số hàng>_<số cột> (VD: header_cell_0_0, cell_3_4)"}
			o	value: nội dung của ô dữ liệu
			o	is_header: True nếu là tiêu đề của bảng, ngược lại False
			o	row: số hàng
			o	col: số cột
			Ví dụ của một tập dữ liệu đầu vào:
			{
				`
				[{
					"title": "Tên văn bản",
            "_id": 1,
            "order": ["sentence_0", "sentence_1", "table_0"],
            "sentence_0": "Sentence 0 content",
            "sentence_1": "Sentence 1 content",
            "table_0": [
							[
								{
									"id": "header_cell_0_0",
									"value": "Header 1",
									"is_header": True,
									"row": 0,
									"col": 0
								},	
								{
									"id": "header_cell_0_1",
									"value": "Header 2",
									"is_header": True,
									"row": 0,
									"col": 1
								}
							],
							[
								{
									"id": "cell_1_0",
									"value": "Cell 1",
									"is_header": False,
									"row": 1,
									"col": 0
								},
								{
									"id": "cell_1_1",
									"value", "Cell 2",
									"is_header": False,
									"row": 1,
									"col": 1
								}
							]
            ]
					}]
					`
			} */}
			<img src="/info.png" alt="" style={{display: "inline"}} />
			<img src="/ex.png" alt="" style={{display: "inline", marginLeft:"20px", verticalAlign: "top"}}/>
		</Box>
	}
}