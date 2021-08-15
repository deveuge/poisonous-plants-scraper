const pageScraper = require('./pageScraper');
const fs = require('fs');

const scrapePoisonousPlants = async function(browserInstance) {
    let browser;
    try{
        browser = await browserInstance;
        let scrapedData = await pageScraper.scraperList(browser);
        await browser.close();
        return scrapedData;
    }
    catch(err){
        console.log("> ERROR: Couldn't resolve the browser instance - ", err);
    }
}

const scrapePlantInfo = async function(browserInstance, dataIntance) {
    let browser;
    let data;
    try{
        browser = await browserInstance;
        data = await dataIntance;
        let scrapedData = await pageScraper.scraperInfo(browser, data);
        await browser.close();
        return scrapedData;
    }
    catch(err){
        console.log("> ERROR: Couldn't resolve the browser instance - ", err);
    }
}

const saveToFile = async function(scrapedData) {
    fs.writeFile("data.json", JSON.stringify(scrapedData), 'utf8', function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("> Data scraped and saved successfully. Saved at './data.json'");
    });
}

module.exports = {
    scrapePoisonousPlants,
    scrapePlantInfo,
    saveToFile
};