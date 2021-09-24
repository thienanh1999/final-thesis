import constants
import json
import datetime
from collections import defaultdict
from elasticsearch import Elasticsearch, helpers

res = []
with open(constants.GOVTIMELINE_PATH) as govtimeline_file, open(constants.GOVNEWS_PATH) as govnews_file, open(
        constants.VNEXPRESS_PATH) as vnexpress_file:
    govtimeline_articles = json.load(govtimeline_file)
    govnews_articles = json.load(govnews_file)
    vnexpress_article = json.load(vnexpress_file)

    for gt_atc in govtimeline_articles:
        gt_atc_dict = defaultdict()
        gt_atc_dict['time'] = gt_atc['time'].split(' ')[1]
        gt_atc_dict['title'] = gt_atc['summary']
        gt_atc_dict['content'] = gt_atc['content']
        res.append(gt_atc_dict)
    for gn_atc in govnews_articles:
        content = str(gn_atc['sapo']) + ' ' + ' '.join(gn_atc['content'])
        gn_atc_dict = defaultdict()
        gn_atc_dict['time'] = gn_atc['published_time'].split(' ')[1]
        gn_atc_dict['title'] = gn_atc['title']
        gn_atc_dict['content'] = content
        res.append(gn_atc_dict)
    for ve_atc in vnexpress_article:
        content = str(ve_atc['sapo']) + ' ' + ' '.join(ve_atc['content'])
        # time = datetime.datetime.strptime(ve_atc['published_time'].split(' ')[1], '%-d/%-m/%Y').strptime('%d/%m/%Y')
        ve_atc_dict = defaultdict()
        ve_atc_dict['time'] = ve_atc['published_time'].split(' ')[1]
        ve_atc_dict['title'] = ve_atc['title']
        ve_atc_dict['content'] = content
        res.append(ve_atc_dict)

client = Elasticsearch('localhost:9200')
try:
    print('Indexing')
    resp = helpers.bulk(
        client,
        res,
        index='fulltext_covid19',
    )
    print("helpers.bulk() RESPONSE:", resp)
    print("helpers.bulk() RESPONSE:", json.dumps(resp, indent=4))

except Exception as err:
    print("helpers.bulk() ERROR:", err)

