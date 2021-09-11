import scrapy


class VNExpressSpider(scrapy.Spider):
    name = 'vnexpress'
    # allowed_domains = ['vnexpress.net/covid-19/tin-tuc']
    start_urls = ['https://vnexpress.net/covid-19/tin-tuc/']
    # start_urls = ['https://vnexpress.net/covid-19/tin-tuc-p2']
    headers = {
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36'
    }

    def parse(self, response, **kwargs):
        hyper_links = []
        for res in response.xpath("//a[contains(@href, 'https://vnexpress.net/')]"):
            link = res.attrib['href']
            if not ('#box_comment_vne' in link or 'https://vnexpress.net/covid-19/covid-19-viet-nam' in link):
                hyper_links.append(link)
        hyper_links = list(set(hyper_links))
        for link in hyper_links:
            yield response.follow(
                url=link,
                headers=self.headers,
                callback=self.parse_article
            )

        next_page = response.css('a.next-page').attrib['href']
        if next_page is not None:
            yield response.follow(
                url=next_page,
                headers=self.headers,
                callback=self.parse
            )

    @staticmethod
    def parse_article(response):
        sapo = response.xpath('/html/body/section[4]/div/div[2]/p//text()').get()
        published_time = response.css('span.date::text')[0].get().replace('(GMT+7)', '')
        title = ''.join(response.css('h1.title-detail *::text').getall()).replace('\n', '')
        paragraphs = response.css('article.fck_detail *::text').getall()
        content = []
        for idx in range(len(paragraphs)):
            if paragraphs[idx] != '\n' and paragraphs[idx] != ' ':
                content.append(paragraphs[idx])
        # author = paragraphs[-3]
        # source = paragraphs[-1]

        yield {
            'title': title,
            'published_time': published_time,
            'sapo': sapo,
            'content': content,
            # 'author': author,
            # 'source': source
        }
