console.log("Running process-data.js\n");

const fs = require('fs');
const papa = require('papaparse');

const CURRENT_SHAKEUP_FOLDER = '2025-12';

const UPDATES_FILE = 'src/_data/' + CURRENT_SHAKEUP_FOLDER + '/updates.csv';
const CONTENT_FILE = 'src/_data/' + CURRENT_SHAKEUP_FOLDER + '/content.csv';
const LINES_BUS_FILE = 'src/_data/' + CURRENT_SHAKEUP_FOLDER + '/lines-bus.json';
const LINES_RAIL_FILE = 'src/_data/' + CURRENT_SHAKEUP_FOLDER + '/lines-rail.json';
const OUTPUT_PATH = 'src/data/';

let rs_updates_file;
let rs_content_file;
let linesData;

try {
    rs_updates_file = fs.createReadStream(UPDATES_FILE);
    console.log('Read file:', UPDATES_FILE);
} catch (e) {
    console.log('Error reading file:', UPDATES_FILE);
    console.log(e);
}

try {
    rs_content_file = fs.createReadStream(CONTENT_FILE);
    console.log('Read file:', CONTENT_FILE);
} catch (e) {
    console.log('Error reading file:', CONTENT_FILE);
    console.log(e);
}

try {
    let busLinesData = JSON.parse(fs.readFileSync(LINES_BUS_FILE, 'utf-8'));
    console.log('Read file:', LINES_BUS_FILE);

    try {
        let railLinesData = JSON.parse(fs.readFileSync(LINES_RAIL_FILE, 'utf-8'));
        linesData = busLinesData.concat(railLinesData);
        
    } catch (e) {
        console.log('Error reading file:', LINES_RAIL_FILE);
        console.log(e);
    }
} catch (e) {
    console.log('Error reading file:', LINES_BUS_FILE);
    console.log(e);
}

console.log('');

let count = 0;
const langs = ['en', 'es', 'hy', 'ja', 'ko', 'ru', 'vi', 'zh-tw'];
let translation_results = {
    'lines': [],
    'en': {
        'lang': 'en',
        'page': {},
        'updates': {}
    },
    'es': {
        'lang': 'es',
        'page': {},
        'updates': {}
    },
    'hy': {
        'lang': 'hy',
        'page': {},
        'updates': {}
    },
    'ja': {
        'lang': 'ja',
        'page': {},
        'updates': {}
    },
    'ko': {
        'lang': 'ko',
        'page': {},
        'updates': {}
    },
    'ru': {
        'lang': 'ru',
        'page': {},
        'updates': {}
    },
    'vi': {
        'lang': 'vi',
        'page': {},
        'updates': {}
    },
    'zh-tw': {
        'lang': 'zh-tw',
        'page': {},
        'updates': {}
    }
};

let lineList = [];

papa.parse(rs_updates_file, {
    header: true,
    worker: true,
    encoding: 'utf-8',
    complete: function(results) {
        console.log("Successfully read file:", UPDATES_FILE);
        console.log("");

        try {
            results.data.forEach(function(item) {
                let line = item.line;
                lineList.push(line);

                if (!translation_results.lines.includes(line)) {
                    translation_results.lines.push(line);
                    langs.forEach(function(lang) {
                        translation_results[lang].updates[line] = [];
                    });
                }
                langs.forEach(function(lang) {
                    let update = {};
                    update['update'] = item[lang + '-update'];
                    update['reason'] = item[lang + '-reason'];
                    update['map'] = item['map'];
                    update['schedule'] = item['schedule'];
                    
                    // find the object in linesData where line is equal to item.route_code and add the terminal_1, terminal_2, and arterials fields
                    let lineData = linesData.find(lineData => lineData['route_code'] === line || lineData['route_short_name'] === line || lineData['route_id'] === line);
                    
                    if (lineData) {
                        if (lineData['terminal_1'] != null && lineData['terminal_2'] != null) {
                            update['description'] = `${lineData['terminal_1']} - ${lineData['terminal_2']}`;
                        } else {
                            console.log('No terminal data found for line:', line);
                            update['description'] = lineData['long_name'];
                        }
                        
                        update['lineLabel'] = lineData['long_name'] != null ? lineData['long_name'] : line;
                        update['arterials'] = lineData['arterials'];
                    } else {
                        console.log('Line data not found for line:', line);
                    }

                    translation_results[lang].updates[line] = update;
                    translation_results[lang]['lineList'] = lineList;
                });
            });
            // console.log(results);

            papa.parse(rs_content_file, {
                header: true,
                worker: true,
                encoding: 'utf-8',
                complete: function(results) {
                    console.log("Successfully read file:", CONTENT_FILE);
                    console.log("");
                    try {
                        results.data.forEach(function(item) {

                            langs.forEach(function(lang){
                                let content = {};
                                translation_results[lang].page[item.field] = item[lang + '-content'];
                            });

                        });

                        langs.forEach(function(lang) {
                            let jsonOutput = JSON.stringify(translation_results[lang]);
                            let fileName = lang + '-content.json';
                            fs.writeFile(OUTPUT_PATH + fileName, jsonOutput, err => {
                                if (err) {
                                    console.log('Error writing file:', err);
                                } else {
                                    console.log('Successfully wrote file:', fileName);
                                }
                            })
                        });

                    } catch (err) {
                        console.log("Error parsing:", CONTENT_FILE)
                        console.log ('Error message:', err);
                    }
                }
            });
        } catch (err) {
            console.log("Error parsing:", UPDATES_FILE)
            console.log ('Error message:', err);
        }
    }
});