import { utcToZonedTime } from 'date-fns-tz';

import { orderMetrics } from './metrics';

function extractSeries(data, stacked, timezone) {
  const formattedSeries = [];

  orderMetrics(data.metrics).forEach((metric) => {
    formattedSeries.push({
      name: metric.metric,
      type: stacked ? 'area' : 'line',
      unit: metric.unit,
      data: metric.data.map((item, index) => {
        const zonedDate = utcToZonedTime(data.times[index] * 1000, timezone);
        return [zonedDate, item];
      }),
    });
  });

  return formattedSeries;
}

export default extractSeries;
