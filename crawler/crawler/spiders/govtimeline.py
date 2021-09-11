import scrapy


class GovtimelineSpider(scrapy.Spider):
    name = 'govtimeline'
    allowed_domains = ['covid19.gov.vn']
    start_urls = [
        'https://covid19.gov.vn/timelinebigstory/77be6f00-0ada-11ec-bb49-178244d0bacf/1.htm']

    def parse(self, response):
        for item in response.css('li.kbwscwl'):
            yield {
                'time': item.css('div.timeago *::text').get().strip(),
                'summary': '\n'.join(item.css('div.item-bigstory-tit *::text').getall()).strip(),
                'content': '\n'.join(item.css('div.kbwscwl-content *::text').getall()).strip(),
            }
        # next_page = int(response.request.url.split('/')[-1].split('.')[0]) + 1
        # yield response.follow(
        #     url='https://covid19.gov.vn/timelinebigstory/77be6f00-0ada-11ec-bb49-178244d0bacf/{}.htm'.format(next_page),
        #     callback=self.parse
        # )
