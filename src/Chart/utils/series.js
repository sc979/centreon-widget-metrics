function extractSeries(data) {
  const formattedSeries = [];

  data.metrics.forEach((metric) => {
    formattedSeries.push({
      name: metric.metric,
      data: metric.data.map((item, index) => {
        return [data.times[index] * 1000, item];
      }),
    });
  });

  return formattedSeries;
}

export default extractSeries;
