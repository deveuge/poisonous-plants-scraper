const useProxy = require('puppeteer-page-proxy');
const { Cluster } = require('puppeteer-cluster');

const scraperObject = {
    urlList: 'https://www.rover.com/blog/poisonous-plants',
    urlInfo: 'https://garden.org/plants/search/text/?q=',

    async scraperList(browser){
        let page = await browser.newPage();

        console.log(`> Navigating to ${this.urlList}...`);
        await page.goto(this.urlList);

        let scrapedData = [];
        async function scrape() {
            let pageData = await scrapeCurrentPage(page);
            for(data in pageData) {
                scrapedData.push(pageData[data]);
            }
            
            try{
                await page.click('.paginate_button.next:not(.disabled)');   
                await page.click('.scroll-to-top');
                await page.waitForTimeout(1000);
                return scrape(); // Call this function recursively
            } catch(err){
                // No more pages
            }
        }
        
        await scrape();

        await page.close();
        return scrapedData;
    },
    
    async scraperInfo(browser, scrapedData){ 
        const cluster = await Cluster.launch({
            concurrency: Cluster.CONCURRENCY_CONTEXT,
            maxConcurrency: 4,
        });

        await cluster.task(async ({ page, data }) => {
            const { browser, url, index } = data;
            scrapedData[index] = await scrapePlantInfo(browser, url, scrapedData[index]);
        });

        for (let i = 0; i < scrapedData.length; i++) {
            cluster.queue({ browser: browser, url: this.urlInfo, index: i });
        }

        await cluster.idle();
        await cluster.close();

        return scrapedData;
    }
}

async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

async function scrapeCurrentPage(page) {
    // Wait for the required DOM to be rendered
    await page.waitForSelector('.poisonous-plants-list');
    await autoScroll(page);
    
    // Get the data
    let data = await page.$$eval('.poisonous-plants-list > tbody > tr', row => {
        
        let extractRowData = function (el, i, arr) {
            let dataObject = {};
            dataObject.icon = el.querySelector('.plant-image > img').src;
            dataObject.name = {
                common: el.querySelector('.tile-title').textContent.replace("’", "'"),
                scientific: el.querySelector('.scientific-name').textContent.replace("’", "'")
            }
            dataObject.type = el.querySelector('.type > img').title;
            let symptomArray = [];
            let symptomList = el.querySelector('.symptoms-list-wrap.before > .symptom-list');
            [...symptomList.children].forEach(child => {
                symptomArray.push(child.textContent);
            });
            dataObject.symptoms = symptomArray;
            let toxicityLevel = el.querySelector('.toxicity > img').title.split('-');
            dataObject.toxicity = {
                level: toxicityLevel[toxicityLevel.length - 1],
                dogs: el.querySelector('.toxic_to_dogs > img').src.endsWith("on.svg"),
                cats: el.querySelector('.toxic_to_cats > img').src.endsWith("on.svg")
            }

            return dataObject;
        }

        // Extract the data
        return row.map(extractRowData);
    });

    return data;
}

async function scrapePlantInfo(browser, url, element) {
    let page = await browser.newPage();
    await page.authenticate({
        username: 'scraperapi',
        password: 'PROXY_PASSWORD',
    });
    
    await page.setRequestInterception(true);
    page.on('request', async request => {
        if (['image', 'stylesheet', 'font', 'script'].indexOf(request.resourceType()) !== -1) {
            request.abort();
        } else {
            request.continue();
        }
    });
    
    console.log(`> Navigating to ${url + element.name.common.replace(" ", "+")}...`);
    await page.goto(url + element.name.common.replace(" ", "+"), {timeout: 180000});

    // Select search result
    try {
        await page.waitForSelector('.table.pretty-table');
        const links = await page.$x(`//td/a[contains(., '${element.name.common}')]`);
        await links[0].click();
        
        // Collect plant info
        await page.waitForSelector('.table.simple-table > tbody > tr');
        let dataObject = await page.$$eval('.table.simple-table > tbody > tr', row => {
            let extractRowData = function (el, i, arr) {
                let key = el.querySelector('td:first-of-type').textContent.toLowerCase();
                key = key.replaceAll(":", "").replace(/(\s{1}\w{1})/g, match => match.toUpperCase()).replaceAll(" ", "");

                let value = el.querySelector('td:last-of-type').textContent.trim();
                if(value.split("\n").length > 1) {
                    value = value.replaceAll("\n", ". ");
                } else {
                    value = value.replaceAll("\n", "");
                }
                
                return {[key]: value};
            }
            // Extract the data
            return row.map(extractRowData);
        });

        dataObject = Object.assign(...dataObject);
        
        await page.waitForSelector('.thumb');
        dataObject.image = await page.evaluate(async () => {
            return document.querySelector('.thumb').src;
        })
        console.log(dataObject)

        element.detailedInfo = dataObject;
    } catch(err) {
        // No plant found, returning without detailed data
        console.log(err)
    }

    await page.close();
    return element;
}

module.exports = scraperObject;