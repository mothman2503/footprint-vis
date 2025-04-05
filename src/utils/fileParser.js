// Utility function to format headers (Replace "_" with spaces & capitalize words)
const formatHeader = (header) => {
    return header
        .replace(/_/g, " ") // Replace underscores with spaces
        .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
};

// Function to filter and reorder headers (Keep only "Title", "URL", "Time")
const filterAndReorderHeaders = (keys) => {
    const allowedKeys = ["title", "url", "time_usec"];
    return keys
        .filter((key) => allowedKeys.includes(key.toLowerCase())) // Keep only the allowed keys
        .sort((a, b) => allowedKeys.indexOf(a.toLowerCase()) - allowedKeys.indexOf(b.toLowerCase())); // Sort in order
};

// Convert microseconds to a readable date format
const convertMicrosecondsToDate = (microseconds) => {
    const seconds = microseconds / 1000000;
    const date = new Date(seconds * 1000);
    return date.toLocaleString(); // Return formatted date
};

// Convert JSON to a structured array (keeping only "Title", "URL", and "Time")
export const convertJsonToCsvArray = (jsonData) => {
    if (!Array.isArray(jsonData) || jsonData.length === 0) {
        return [["No Data Available"]];
    }

    let keys = Object.keys(jsonData[0]);
    keys = filterAndReorderHeaders(keys); // Keep and reorder only the necessary columns

    const formattedHeaders = keys.map(formatHeader);

    // Convert rows, ensuring time is properly formatted
    const rows = jsonData.map((entry) =>
        keys.map((key) => {
            if (key === "time_usec" && entry[key]) {
                return convertMicrosecondsToDate(entry[key]);
            }
            return entry[key] ?? "";
        })
    );

    return [formattedHeaders, ...rows];
};

// Convert CSV text into an array with only "Title", "URL", and "Time"
export const convertCsvToArray = (csvText) => {
    const rows = csvText
        .split("\n")
        .map((row) => row.split(",").map((cell) => cell.trim()))
        .filter((row) => row.length > 1); // Remove empty rows

    if (rows.length === 0) return [["No Data Available"]];

    let headers = rows[0];
    headers = filterAndReorderHeaders(headers); // Keep only necessary columns
    const formattedHeaders = headers.map(formatHeader);

    // Reorder data rows based on the new header order
    const orderedDataRows = rows.slice(1).map((row) =>
        headers.map((header) => {
            const index = rows[0].indexOf(header);
            return row[index] ?? "";
        })
    );

    return [formattedHeaders, ...orderedDataRows];
};

// Universal parser: detects format and processes accordingly
export const parseData = (data) => {
    if (!data) return [["No Data Available"]];

    if (typeof data === "object" && "Browser History" in data) {
        return convertJsonToCsvArray(data["Browser History"]);
    }

    if (Array.isArray(data)) {
        return convertJsonToCsvArray(data);
    }

    if (typeof data === "string") {
        return convertCsvToArray(data);
    }

    return [["No Data Available"]];
};
