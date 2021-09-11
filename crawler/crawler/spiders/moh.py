import scrapy


class MohSpider(scrapy.Spider):
    name = 'moh'
    allowed_domains = ['ncov.moh.gov.vn']
    start_urls = ['https://ncov.moh.gov.vn/vi/web/guest/tin-tuc']
    headers = {
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36'
    }

    def parse(self, response, **kwargs):
        for article in response.xpath(
                "//div[@class='portlet-body']//a[contains(@href, 'https://ncov.moh.gov.vn/vi/web/guest/-/')]"):
            if article.attrib['href'] is not None:
                yield response.follow(article.attrib['href'], callback=self.parse_article)

        next_page = response.xpath("//a[contains(@href, 'https://ncov.moh.gov.vn/vi/web/guest/tin')]")[-1] \
            .attrib['href']

        if next_page is not None:
            yield response.follow(
                url=next_page,
                headers=self.headers,
                callback=self.parse
            )

    @staticmethod
    def parse_article(response):
        title = ''.join(response.css('h5 *::text').getall()).replace('\n', '')
        published_time = response.css('span.text-ngayxam-page::text')[0].get().replace('(', '').replace(')', '')
        sapo = response.css('strong.text-muted-ncov *::text').get()
        paragraphs = response.xpath('//div[@id=$val]//p//text()', val='content-detail').getall()
        content = []
        for idx in range(len(paragraphs) - 3):
            content.append(paragraphs[idx])
        author = paragraphs[-3]
        source = paragraphs[-1]

        yield {
            'title': title,
            'published_time': published_time,
            'sapo': sapo,
            'content': content,
            'author': author,
            'source': source
        }
