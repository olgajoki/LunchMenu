const axios = require("axios");
const cheerio = require("cheerio");
const ExcelJS = require("exceljs");

const websites = [
  "https://www.helenansoppa.fi/",
  "https://www.nestesorsasalo.fi/lounaslista/",
  "https://remar.fi/ravintola-pilotti/",
];

// Array to store promises of axios.get calls
const axiosPromises = [];

// Create a new Excel workbook and add a worksheet
const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet("Menu Data");

// Make requests to each website
websites.forEach(async (url) => {
  const axiosPromise = axios.get(url).then((response) => {
    try {
      let menuElements;

      // Process the response for each website
      const $ = cheerio.load(response.data);

      if (url === "https://www.helenansoppa.fi/") {
        menuElements = $(".col-md-12");
      } else if (url === "https://www.nestesorsasalo.fi/lounaslista/") {
        menuElements = $(".sisaltotxt");
      } else if (url === "https://remar.fi/ravintola-pilotti/") {
        menuElements = $(".row");
      }
      // Extract and print the menu
      const menuData = menuElements
        .map((index, element) => $(element).text())
        .get();

      // Add the menuData to the Excel worksheet
      worksheet.addRow([`Menu for ${url}`]); // Add a row with the website URL
      menuData.forEach((menuItem) => {
        worksheet.addRow([menuItem]); // Add a row for each menu item
        console.log(menuItem);
      });
    } catch (error) {
      console.error(`Error fetching menu from ${url}:`, error.message);
    }
  });
  // Add the axios promise to the array
  axiosPromises.push(axiosPromise);
});

// Wait for all axios.get calls to complete
Promise.all(axiosPromises)
  .then(() => {
    // Save the workbook to a file
    return workbook.xlsx.writeFile("menu_data.xlsx");
  })
  .then(() => {
    console.log("Excel file created successfully.");
  })
  .catch((error) => {
    console.error("Error creating Excel file:", error);
  });
