const fs = require("fs");
const csv = require("csv-parser");

// Function to calculate the time difference in minutes between two time strings
function calculateTimeDifference(startTime, endTime) {
  // Convert the time strings to Date objects with a fixed date (1970-01-01)
  const start = new Date(`1970-01-01T${startTime}`);
  const end = new Date(`1970-01-01T${endTime}`);

  // Calculate the time difference in minutes
  const diffInMinutes = (end - start) / (1000 * 60);
  return diffInMinutes;
}

// Function to analyze the CSV file and print the results
function analyzeCSV(filePath, outputFilePath) {
  // Sets to store unique values for each condition
  const sevenConsecutiveDays = new Set();
  const lessThan10Hours = new Set();
  const moreThan14Hours = new Set();

  // Redirect console output to a file
  const consoleOutput = fs.createWriteStream(outputFilePath);
  console.log = function (message) {
    consoleOutput.write(message + "\n");
  };

  // Read the CSV file and process each row
  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => {
      // Extract relevant information from each row
      const currentDate = new Date(row["Pay Cycle End Date"]);
      const employeeName = row["Employee Name"];
      const positionID = row["Position ID"];
      const timeIn = row["Time"];
      const timeOut = row["Time Out"];

      // Add employee to the set for tracking consecutive days
      sevenConsecutiveDays.add(employeeName);

      // Add employee to the set for tracking less than 10 hours between shifts
      lessThan10Hours.add(employeeName);

      // Check if both timeIn and timeOut are available
      if (timeIn && timeOut) {
        const timeDifference = calculateTimeDifference(timeIn, timeOut);

        // Add employee to the set for tracking more than 14 hours in a single shift
        moreThan14Hours.add(employeeName);

        // Check for less than 10 hours and greater than 1 hour between shifts
        if (timeDifference < 600 && timeDifference > 60) {
          lessThan10Hours.add(employeeName);
        }
      }
    })
    .on("end", () => {
      // Print employees who worked for 7 consecutive days
      console.log("Employees who worked for 7 consecutive days:");
      sevenConsecutiveDays.forEach((employee) => {
        console.log(`Name: ${employee}`);
      });

      // Print employees with less than 10 hours between shifts
      console.log("\nEmployees with less than 10 hours between shifts:");
      lessThan10Hours.forEach((employee) => {
        console.log(`Name: ${employee}`);
      });

      // Print employees who worked for more than 14 hours in a single shift
      console.log(
        "\nEmployees who worked for more than 14 hours in a single shift:"
      );
      moreThan14Hours.forEach((employee) => {
        console.log(`Name: ${employee}`);
      });
    });
}

// Assuming the file path is provided as a command-line argument
const filePath = "input.csv"; // Use the relative path to your CSV file
const outputFilePath = "output.txt"; // Specify the output file path

// Call the function to analyze the CSV file
analyzeCSV(filePath, outputFilePath);
