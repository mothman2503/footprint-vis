export function getDateArray(startDate, endDate) {
  const arr = [];
  let d = new Date(startDate);
  d.setHours(0, 0, 0, 0);
  endDate = new Date(endDate);
  endDate.setHours(0, 0, 0, 0);
  while (d <= endDate) {
    arr.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return arr;
}
