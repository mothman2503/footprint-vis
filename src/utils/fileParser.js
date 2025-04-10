// Converts microseconds to readable date
export const convertMicrosecondsToDate = (microseconds) => {
    const date = new Date(microseconds / 1000); // microseconds → milliseconds
    const datePart = date.toLocaleDateString();
    const timePart = date.toLocaleTimeString();
    return `${datePart}\n${timePart}`;
};
// Parses raw JSON for browser history
export const parseBrowserHistory = (rawJson) => {
    return rawJson?.["Browser History"] ?? [];
};

  // Function to extract the domain from the URL
  export const getDomainFromUrl = (url) => {
    try {
      const parsedUrl = new URL(url);
      let domain = parsedUrl.hostname;
      // Remove 'www.' if it's present
      if (domain.startsWith('www.')) {
        domain = domain.slice(4);
      }
      return parsedUrl.protocol + "//" + domain;
    } catch (e) {
      return '';
    }
  };
  

  