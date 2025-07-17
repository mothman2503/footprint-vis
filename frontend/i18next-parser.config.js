module.exports = {
    locales: ["en", "de"], // List of supported languages
    output: "src/locales/$LOCALE.json", // Where JSON files will be stored
    useKeysAsDefaultValue: true, // Use the original text as the default value
    createOldCatalogs: false // Don't keep old translations
  };
  