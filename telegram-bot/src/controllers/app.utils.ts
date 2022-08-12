/**
 * Return sunset time in UTC
 * @param timestamp - timestamp from OpenWeather
 */
export function getSunsetTime(timestamp: number): {
  hours: number;
  minutes: number;
} {
  const sunsetUtcDate = new Date(timestamp * 1000);
  return {
    hours: sunsetUtcDate.getUTCHours(),
    minutes: sunsetUtcDate.getUTCMinutes(),
  };
}
