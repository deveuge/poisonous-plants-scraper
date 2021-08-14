# Poisonous Plants Scraper
_Scraper that collects information about poisonous plants to pets_

**Poisonous Plants Scraper** is a scraper built with [Puppeteer](https://pptr.dev) that collects information about poisonous plants to pets and saves the data in JSON format.

## Installation
Poisonous-plants-scraper requires the following stack:
- [NodeJS](https://nodejs.org)

Once you have Node.js installed, download the code and execute the following commands on the root folder:
```
npm install
npm start
```

The scraper will extract the data and it will save it in the root folder as a new file: "data.json".

If you want to visualize in real time the execution of the script in a Chromium browser, you can edit the "browser.js" file and set the "headless" parameter of the launch() method to "false" in line 8:
```
browser = await puppeteer.launch({
    headless: false,
    [...]
});
```

## Collected data
The information about poisonous plants is collected from [Rover.com](https://www.rover.com/blog/poisonous-plants/) following the logic detailed below:
1. The browser opens a new page and goes to "https://www.rover.com/blog/poisonous-plants/".
2. It waits for the list to be loaded and scrolls to bottom to trigger the scripts that loads the images and icons that indicate the toxicity of the plants.
3. For each row in the table, the script creates a new object to save the relevant information.
4. If there is a next page available, it clicks on the button to load the new data and scrolls to top to repeat the process from the previous step.
5. Once all the data has been collected, it saves it as a file in JSON format.

Each object in the resulting array has the following structure:
```
{
    "image": <Plant image URL>,
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
    }
},
```