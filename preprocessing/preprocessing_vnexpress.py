import re
import json
from collections import defaultdict

json_file = open('./../crawler/crawled_data/vnexpress.json', 'r')
articles = json.load(json_file)
sentence_splitter = r"\. (?!Hồ Chí Minh)(?!HCM)|\:|\;"

article_dictionaries = []
for article in articles:
    content = str(article['sapo']) + ' ' + ' '.join(article['content'])
    sentences = re.split(sentence_splitter, content)
    article_dict = defaultdict()
    article_dict['time'] = article['published_time']
    article_dict['title'] = article['title']
    article_dict['order'] = []

    sentence_idx = 0
    for sentence in sentences:
        if len(sentence) > 10:
            article_dict['order'].append('sentence_{}'.format(sentence_idx))
            article_dict['sentence_{}'.format(sentence_idx)] = sentence.replace(
                '\u00a0', ' ').strip()
            sentence_idx += 1

    article_dictionaries.append(article_dict)

json_file.close()

output_json_file = open('./../crawler/crawled_data/preproccessed_vnexpress.json', 'w')
json.dump(article_dictionaries, output_json_file)
output_json_file.close()
