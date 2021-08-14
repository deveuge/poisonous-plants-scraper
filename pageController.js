const pageScraper = require('./pageScraper');
const fs = require('fs');

async function scrapeAll(browserInstance){
    let browser;
    try{
        browser = await browserInstance;
        let scrapedData = await pageScraper.scraper(browser);
        await browser.close();
        fs.writeFile("data.json", JSON.stringify(scrapedData), 'utf8', function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("> Data scraped and saved successfully. Saved at './data.json'");
        });
    }
    catch(err){
        console.log("> ERROR: Couldn't resolve the browser instance - ", err);
    }
}

module.exports = (browserInstance) => scrapeAll(browserInstance)