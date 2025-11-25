const fs = require("fs");
const path = require("path");
const csv = require("csv");

// Configuration
const CSV_URL =
  "https://raw.githubusercontent.com/LACMTA/los-angeles-regional-gtfs/refs/heads/main/.scripts/route_overview.csv";
const OUTPUT_DIR = "src/_data/2025-12";
const RAIL_OUTPUT = path.join(OUTPUT_DIR, "lines-rail.json");
const BUS_OUTPUT = path.join(OUTPUT_DIR, "lines-bus.json");

/**
 * Fetch CSV data from URL using fetch API
 */
async function fetchCsvData(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.text();
}

/**
 * Parse CSV data using the csv package
 */
function parseCsv(csvData) {
  return new Promise((resolve, reject) => {
    const records = [];

    csv
      .parse(csvData, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      })
      .on("readable", function () {
        let record;
        while ((record = this.read())) {
          records.push(record);
        }
      })
      .on("error", function (err) {
        reject(err);
      })
      .on("end", function () {
        resolve(records);
      });
  });
}

/**
 * Split data based on route_type
 */
function splitDataByRouteType(data) {
  const railTypes = ["rail"];
  const busTypes = ["express", "bus", "busway"];

  const railData = data.filter((route) =>
    railTypes.includes(route.route_type?.toLowerCase())
  );

  const busData = data.filter((route) =>
    busTypes.includes(route.route_type?.toLowerCase())
  );

  return { railData, busData };
}

/**
 * Ensure directory exists
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

/**
 * Save data as JSON file
 */
function saveJsonFile(filePath, data) {
  const jsonData = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, jsonData, "utf8");
  console.log(`Saved ${data.length} records to ${filePath}`);
}

/**
 * Main function
 */
async function main() {
  try {
    console.log("Fetching CSV data...");
    const csvData = await fetchCsvData(CSV_URL);
    console.log(`Fetched ${csvData.length} characters of CSV data`);

    console.log("Parsing CSV data...");
    const parsedData = await parseCsv(csvData);
    console.log(`Parsed ${parsedData.length} records`);

    console.log("Splitting data by route type...");
    const { railData, busData } = splitDataByRouteType(parsedData);
    console.log(
      `Split into ${railData.length} rail routes and ${busData.length} bus routes`
    );

    console.log("Ensuring output directory exists...");
    ensureDirectoryExists(OUTPUT_DIR);

    console.log("Saving JSON files...");
    saveJsonFile(RAIL_OUTPUT, railData);
    saveJsonFile(BUS_OUTPUT, busData);

    console.log("✅ Script completed successfully!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}
