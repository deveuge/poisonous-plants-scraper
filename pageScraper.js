const scraperObject = {
    url: 'https://www.rover.com/blog/poisonous-plants',
    async scraper(browser){
        let page = await browser.newPage();
        console.log(`> Navigating to ${this.url}...`);
        await page.goto(this.url);

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
            dataObject.image = el.querySelector('.plant-image > img').src;
            dataObject.name = {
                common: el.querySelector('.tile-title').textContent,
                scientific: el.querySelector('.scientific-name').textContent
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

module.exports = scraperObject;