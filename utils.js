export async function getActiveTabURL() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

export const getTotalDuration = (data, startDate, endDate) => {
  let duration = 0;

  for (const entry of data) {
    for (const day of entry.days) {
      const dayDate = day.day.substring(0, 10);
      if (dayDate >= startDate && dayDate <= endDate) {
        for (const punch of day.punches) {
          duration += punch.duration;
        }
      }
    }
  }

  return duration;
};

export function isFriday(dateString) {
  const selectedDate = new Date(dateString);
  return selectedDate.getDay() == 4;
}
export function isThursday(dateString) {
  const selectedDate = new Date(dateString);
  return selectedDate.getDay() == 3;
}

export function getLastFriday() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // Sunday - 0, Monday - 1, ..., Saturday - 6
  let lastFriday = new Date(today);

  if (dayOfWeek >= 5) {
    // If today is Friday or a day of the weekend, subtract the difference to get to the last Friday
    lastFriday.setDate(today.getDate() - (dayOfWeek - 5));
  } else {
    // If today is before Friday, we need to go to the previous week's Friday
    lastFriday.setDate(today.getDate() - (dayOfWeek + 2));
  }

  lastFriday.setHours(0, 0, 0, 0); // reset hours to start of the day
  return lastFriday;
}