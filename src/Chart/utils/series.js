import { orderMetrics } from './metrics';

function extractSeries(data, stacked) {
  const formattedSeries = [];

  orderMetrics(data.metrics).forEach((metric) => {
    formattedSeries.push({
      name: metric.metric,
      type: stacked ? 'area' : 'line',
      unit: metric.unit,
      data: metric.data.map((item, index) => {
        return [data.times[index] * 1000, item];
      }),
    });
  });

  return formattedSeries;
}

export default extractSeries;
