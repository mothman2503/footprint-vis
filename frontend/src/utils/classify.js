export const classifyQueries = async (queries) => {
  const response = await fetch("http://localhost:8000/classify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ queries }),
  });

  if (!response.ok) {
    throw new Error("API call failed");
  }

  return await response.json();
};
