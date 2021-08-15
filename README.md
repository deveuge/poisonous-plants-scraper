# Poisonous Plants Scraper
_Scraper that collects information about poisonous plants to pets_

**Poisonous Plants Scraper** is a scraper built with [Puppeteer](https://pptr.dev) that collects information about poisonous plants to pets and saves the data in JSON format.

## Installation
Poisonous-plants-scraper requires the following stack:
- [NodeJS](https://nodejs.org)

The first step after downloading the code should be configuring the proxy.
Some websites protect themselves from web scraping, so to bypass their filters the script uses a proxy to perform the multiple petitions to gather detailed info about the plants.

In the "index.js" file, you should configure your filter host and port at line 7:
```
let browserInstanceWithProxy = browserObject.startBrowser("http://<PROXY_HOST>:<PROXY_PORT>");
```
As an example, the script uses the one provided by the free plan of [Scraper API](https://www.scraperapi.com): http://proxy-server.scraperapi.com:8001

Depending on the type of proxy, it may also be required to configure its authentication. You can remove or edit the authentication in the file "pageScrapper.js" at line 119:
```
await page.authenticate({
    username: <PROXY_USERNAME>,
    password: <PROXY_PASSWORD,
});
```
In the case that you want to use Scraper API as well, you must configure the user as "scraperapi" and the password as the API key that is assigned to each user after registering.
The free plan gives you 5.000 request per month and the execution of the script consumes around 1.000.

After the proxy is correctly configured, execute the following commands on the root folder:
```
npm install
npm start
```

The scraper will extract the data and it will save it in the root folder as a new file: "data.json".

If you want to visualize in real time the execution of the script in a Chromium browser, you can edit the "browser.js" file and set the "headless" parameter of the launch() method to "false" in line 17:
```
browser = await puppeteer.launch({
    headless: false,
    [...]
});
```

## Collected data
The list of poisonous plants is collected from [Rover.com](https://www.rover.com/blog/poisonous-plants/) and more detailed information is gathered from [Garden.org](ttps://garden.org/) following the logic detailed below:
1. The browser opens a new page and goes to "https://www.rover.com/blog/poisonous-plants/".
2. It waits for the list to be loaded and scrolls to bottom to trigger the script that loads the images and icons that indicate the toxicity of the plants.
3. For each row in the table, the script creates a new object to save the relevant information.
4. If there is a next page available, it clicks on the button to load the new data and scrolls to top to repeat the process from the previous steps.
5. Once the list of poisonous plants is collected, the script iterates over it to obtain more detailed info calling "https://garden.org/plants/search/text/?q=", querying with the common name of the plant in a cluster of petitions to speed up the process.
6. If the search returns any matching results, the script will select the first one that contains the full common name.
7. When the detailed info page is loaded, the data is gathered going over the rows of the table and establishing the values of the resulting "detailedInfo" object as key/value.
5. Once all the data has been collected, it saves it as a file in JSON format.

Each object in the resulting array has the following structure:
```
{
    "icon": <Plant image icon (140x140)>,
    "name":{
        "common": <Common name>,
        "scientific": <Scientific name>
    },
    "type": <Plant type: Wild Plant, Garden Plant or House Plant>,
    "symptoms": <String array containing the symptoms>,
    "toxicity":{
        "level": <Toxicity level: Moderate or Severe>,
        "dogs": <Boolean that indicates if it is toxic to dogs>,
        "cats": <Boolean that indicates if it is toxic to cats>
    },
    "detailedInfo": {
        // Data collected from Garden.org, the fields may vary depending on the received results
        plantHabit: <Plant habit>,
        lifeCicle: <Life cicle: Annual or Perennial>,
        sunRequirements: <Descriptive sun requirements>,
        waterPreferences: <Descriptive water preferences>,
        minimumColdHardiness: <Minimal resistance to cold>,
        leaves: <Type of leaves>,
        flowers: <Type of flowers>,
        flowerColor: <Color of its flowers>,
        bloomSize: <Descriptive bloom size>,
        flowerTime:  <Flowering time>,
        undergroundStructures: <Underground structures>,
        suitableLocations: <Suitable locations to grow>,
        uses: <Common uses>,
        resistances: <Resistances of the plant>,
        pollinators: <Common pollinators>,
        containers: <Suitable constainers>,
        miscellaneous: <Other data>,
        awardsAndRecognitions: <Awards and recognitions given to the plant>,
        image: <Image URL>
    }
},
```