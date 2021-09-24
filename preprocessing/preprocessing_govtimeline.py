import re
import json
from collections import defaultdict

json_file = open('./../crawler/crawled_data/govtimeline.json', 'r')
articles = json.load(json_file)
sentence_splitter = r"\.(?!\d)(?! Hồ Chí Minh)|\:"
table_splitter = r"\,|\ trong|\ tại"
import_cases_count_regex = r'(\d+)[^\d]+ca nhập cảnh'
internal_cases_count_regex = r'(\d+)[^\d]+ca ghi nhận trong nước'
community_cases_count_regex = r'(\d+)[^\d]+ca trong cộng đồng'

article_dictionaries = []
for article in articles:
    content = article['content']
    content = content.replace('\n', '')
    sentences = re.split(sentence_splitter, content)
    article_dict = defaultdict()
    article_dict['time'] = article['time']
    article_dict['title'] = article['summary']
    article_dict['order'] = []

    sentence_idx = 0
    for sentence in sentences:
        if 'nhận trong nước tại' in sentence:
            article_dict['order'].append('table_0')
            article_dict['table_0'] = defaultdict()
            article_dict['table_0']['table'] = []
            article_dict['table_0']['type'] = 'infobox'
            table_header_dict_0_0 = defaultdict()
            table_header_dict_0_0['id'] = 'header_cell_0_0_0'
            table_header_dict_0_0['value'] = 'Tỉnh/thành'
            table_header_dict_0_0['is_header'] = True
            table_header_dict_0_0['column_span'] = '1'
            table_header_dict_0_0['row_span'] = '1'
            table_header_dict_1_0 = defaultdict()
            table_header_dict_1_0['id'] = 'header_cell_0_0_1'
            table_header_dict_1_0['value'] = 'Số ca mắc mới'
            table_header_dict_1_0['is_header'] = True
            table_header_dict_1_0['column_span'] = '1'
            table_header_dict_1_0['row_span'] = '1'
            article_dict['table_0']['table'].append(
                [
                    table_header_dict_0_0,
                    table_header_dict_1_0,
                ]
            )
            provinces = re.split(table_splitter, sentence)
            province_idx = 0
            for province in provinces:
                if '(' in province:
                    prv = province.split('(')[0]
                    prv_cnt = province.split('(')[1].split(')')[0]
                    province_idx += 1
                    table_header_dict_0 = defaultdict()
                    table_header_dict_0['id'] = 'header_cell_0_{}_0'.format(
                        province_idx)
                    table_header_dict_0['value'] = prv
                    table_header_dict_0['is_header'] = True
                    table_header_dict_0['column_span'] = '1'
                    table_header_dict_0['row_span'] = '1'
                    table_header_dict_1 = defaultdict()
                    table_header_dict_1['id'] = 'cell_0_{}_1'.format(
                        province_idx)
                    table_header_dict_1['value'] = prv_cnt.replace('.', '')
                    table_header_dict_1['is_header'] = False
                    table_header_dict_1['column_span'] = '1'
                    table_header_dict_1['row_span'] = '1'
                    article_dict['table_0']['table'].append(
                        [
                            table_header_dict_0,
                            table_header_dict_1,
                        ]
                    )

        article_dict['order'].append('sentence_{}'.format(sentence_idx))
        article_dict['sentence_{}'.format(sentence_idx)] = sentence.replace(
            '\u00a0', '').strip()
        sentence_idx += 1

    table_1_count = 0
    if 'THÔNG BÁO VỀ' in article['summary'] and 'CA MẮC MỚI' in article['summary']:
        new_cases_count = article['summary'].replace('.', '').replace(
            'CA MẮC MỚI', '').replace('THÔNG BÁO VỀ', '').replace(' ', '')
        if new_cases_count.isdigit():
            article_dict['order'].append('table_1')
            article_dict['table_1'] = defaultdict()
            article_dict['table_1']['table'] = []
            article_dict['table_1']['type'] = 'infobox'
            table_header_dict_0_0 = defaultdict()
            table_header_dict_0_0['id'] = 'header_cell_0_0_0'
            table_header_dict_0_0['value'] = 'Tổng số ca mắc mới'
            table_header_dict_0_0['is_header'] = True
            table_header_dict_0_0['column_span'] = '1'
            table_header_dict_0_0['row_span'] = '1'
            table_header_dict_1_0 = defaultdict()
            table_header_dict_1_0['id'] = 'cell_0_0_1'
            table_header_dict_1_0['value'] = new_cases_count
            table_header_dict_1_0['is_header'] = False
            table_header_dict_1_0['column_span'] = '1'
            table_header_dict_1_0['row_span'] = '1'
            article_dict['table_1']['table'].append(
                [
                    table_header_dict_0_0,
                    table_header_dict_1_0,
                ]
            )
            table_1_count += 1
    for sentence in sentences:
        s = sentence.replace('.', '')
        import_cases_counts = re.findall(import_cases_count_regex, s)
        internal_cases_counts = re.findall(internal_cases_count_regex, s)
        community_cases_counts = re.findall(community_cases_count_regex, s)
        if len(import_cases_counts) > 0:
            if table_1_count == 0:
                article_dict['order'].append('table_1')
                article_dict['table_1'] = defaultdict()
                article_dict['table_1']['table'] = []
                article_dict['table_1']['type'] = 'infobox'
            table_header_dict_0_0 = defaultdict()
            table_header_dict_0_0['id'] = 'header_cell_0_{}_0'.format(table_1_count)
            table_header_dict_0_0['value'] = 'Số ca nhập cảnh'
            table_header_dict_0_0['is_header'] = True
            table_header_dict_0_0['column_span'] = '1'
            table_header_dict_0_0['row_span'] = '1'
            table_header_dict_1_0 = defaultdict()
            table_header_dict_1_0['id'] = 'cell_0_{}_1'.format(table_1_count)
            table_header_dict_1_0['value'] = import_cases_counts[0]
            table_header_dict_1_0['is_header'] = False
            table_header_dict_1_0['column_span'] = '1'
            table_header_dict_1_0['row_span'] = '1'
            article_dict['table_1']['table'].append(
                [
                    table_header_dict_0_0,
                    table_header_dict_1_0,
                ]
            )
            table_1_count += 1
        if len(internal_cases_counts) > 0:
            if table_1_count == 0:
                article_dict['order'].append('table_1')
                article_dict['table_1'] = defaultdict()
                article_dict['table_1']['table'] = []
                article_dict['table_1']['type'] = 'infobox'
            table_header_dict_0_0 = defaultdict()
            table_header_dict_0_0['id'] = 'header_cell_0_{}_0'.format(table_1_count)
            table_header_dict_0_0['value'] = 'Số ca trong nước'
            table_header_dict_0_0['is_header'] = True
            table_header_dict_0_0['column_span'] = '1'
            table_header_dict_0_0['row_span'] = '1'
            table_header_dict_1_0 = defaultdict()
            table_header_dict_1_0['id'] = 'cell_0_{}_1'.format(table_1_count)
            table_header_dict_1_0['value'] = internal_cases_counts[0]
            table_header_dict_1_0['is_header'] = False
            table_header_dict_1_0['column_span'] = '1'
            table_header_dict_1_0['row_span'] = '1'
            article_dict['table_1']['table'].append(
                [
                    table_header_dict_0_0,
                    table_header_dict_1_0,
                ]
            )
            table_1_count += 1
        if len(community_cases_counts) > 0:
            if table_1_count == 0:
                article_dict['order'].append('table_1')
                article_dict['table_1'] = defaultdict()
                article_dict['table_1']['table'] = []
                article_dict['table_1']['type'] = 'infobox'
            table_header_dict_0_0 = defaultdict()
            table_header_dict_0_0['id'] = 'header_cell_0_{}_0'.format(table_1_count)
            table_header_dict_0_0['value'] = 'Số ca trong cộng đồng'
            table_header_dict_0_0['is_header'] = True
            table_header_dict_0_0['column_span'] = '1'
            table_header_dict_0_0['row_span'] = '1'
            table_header_dict_1_0 = defaultdict()
            table_header_dict_1_0['id'] = 'cell_0_{}_1'.format(table_1_count)
            table_header_dict_1_0['value'] = community_cases_counts[0]
            table_header_dict_1_0['is_header'] = False
            table_header_dict_1_0['column_span'] = '1'
            table_header_dict_1_0['row_span'] = '1'
            article_dict['table_1']['table'].append(
                [
                    table_header_dict_0_0,
                    table_header_dict_1_0,
                ]
            )
            table_1_count += 1

    article_dictionaries.append(article_dict)

json_file.close()

output_json_file = open('../crawler/crawled_data/preproccessed_govtimeline.json', 'w')
json.dump(article_dictionaries, output_json_file)
output_json_file.close()
