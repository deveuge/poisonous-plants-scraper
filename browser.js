const puppeteer = require('puppeteer');

async function startBrowser(proxy){
    let browser;
    let browserArgs = [
        "--disable-setuid-sandbox", 
        '--incognito',
    ];

    if(proxy !== undefined) {
        browserArgs.push('--proxy-server=' + proxy);
    }

    try {
        console.log("> Opening the browser");
        browser = await puppeteer.launch({
            headless: true,
            ignoreHTTPSErrors: true,
            args: browserArgs
        });
    } catch (err) {
        console.log("> ERROR: Couldn't create a browser instance - ", err);
    }
    return browser;
}

module.exports = {
    startBrowser
};