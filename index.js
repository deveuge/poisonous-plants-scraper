const browserObject = require('./browser');
const scraperController = require('./pageController');

(async () => {
    let browserInstance = browserObject.startBrowser();
    let poisonousPlants = await scraperController.scrapePoisonousPlants(browserInstance);
    let browserInstanceWithProxy = browserObject.startBrowser("http://proxy-server.scraperapi.com:8001");
    let plantsData = await scraperController.scrapePlantInfo(browserInstanceWithProxy, poisonousPlants);
    await scraperController.saveToFile(plantsData);
})();
