const puppeteer = require('puppeteer');

async function startBrowser(){
    let browser;
    try {
        console.log("> Opening the browser");
        browser = await puppeteer.launch({
            headless: true,
            args: ["--disable-setuid-sandbox"]
        });
    } catch (err) {
        console.log("> ERROR: Couldn't create a browser instance - ", err);
    }
    return browser;
}

module.exports = {
    startBrowser
};