from elasticsearch import Elasticsearch, helpers
import json


def bulk_index(es_client, index, json_file_path):
    json_file = open(json_file_path, 'r')
    data = json.load(json_file)

    try:
        print('Indexing {}'.format(json_file_path))
        resp = helpers.bulk(
            es_client,
            data,
            index=index,
        )
        print("helpers.bulk() RESPONSE:", resp)
        print("helpers.bulk() RESPONSE:", json.dumps(resp, indent=4))

    except Exception as err:
        print("helpers.bulk() ERROR:", err)

    json_file.close()


client = Elasticsearch('localhost:9200')

govnews_path = '/home/athen/final-thesis/crawler/crawled_data/preproccessed_govnews.json'
govtimeline_path = '/home/athen/final-thesis/crawler/crawled_data/preproccessed_govtimeline.json'
vnexpress_path = '/home/athen/final-thesis/crawler/crawled_data/preproccessed_vnexpress.json'

es_index = 'articles_covid19'
client.indices.create(
    index=es_index,
    body={
      'settings': {
        'number_of_shards': 2,
        'number_of_replicas': 2,
        'analysis': {
          'analyzer': "vi_analyzer"
        }
      }
    },
    ignore=400
)
bulk_index(client, es_index, govtimeline_path)
bulk_index(client, es_index, govnews_path)
bulk_index(client, es_index, vnexpress_path)
