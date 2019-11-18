export function extractYaxis(data) {
  console.log(data);
  const units = {};
  data.metrics.forEach((metric) => {
    if (!Object.prototype.hasOwnProperty.call(units, metric.unit)) {
      units[metric.unit] = [];
    }
    units[metric.unit].push(metric.metric);
  });

  if (units.length > 2) {
    return [
      {
        labels: {
          formatter: (val) => {
            return val.toFixed(2);
          },
        },
        //title: { text: 'mon boule y' },
      },
    ];
  }

  const yAxis = [];
  Object.entries(units).forEach(([unit, metrics], unitIndex) => {
    metrics.forEach((metric, metricIndex) => {
      yAxis.push({
        labels: {
          formatter: (val) => {
            return val.toFixed(2) + unit;
          },
        },
        show: metricIndex === 0,
        seriesName: unit,
        opposite: unitIndex !== 0,
      });
    });
  });
  console.log(yAxis)

  return yAxis;
}

export function extractOptions(data) {
  const formattedOptions = {
    chart: {
      animations: {
        enabled: false,
      },
    },
    stroke: {
      width: 1,
    },
    markers: {
      size: 0,
    },
    xaxis: {
      type: 'datetime',
      labels: {
        show: true,
        datetimeFormatter: {
          year: 'yyyy',
          month: "MMM 'yy",
          day: 'dd MMM',
          hour: 'HH:mm',
        },
      },
    },
    yaxis: extractYaxis(data),
  };

  return formattedOptions;
}

export default extractOptions;
