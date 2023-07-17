export function groupBy(list, givenKey) {
  return list.reduce((prev, curr) => {
    const key = curr[givenKey];
    if (!prev[key]) {
      prev[key] = [];
    }
    prev[key].push(curr);
    return prev;
  }, {});
}