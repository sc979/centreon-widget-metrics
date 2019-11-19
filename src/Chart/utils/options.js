import { getMetricsUnitFormat, getMetricsLimits } from './metrics';

export function extractYaxis(data) {
  const units = {};
  data.metrics.forEach((metric, index) => {
    if (!Object.prototype.hasOwnProperty.call(units, metric.unit)) {
      units[metric.unit] = [];
    }
    units[metric.unit].push({
      metric: metric.metric,
      min: metric.min,
      max: metric.max,
      index,
    });
  });

  if (units.length > 2) {
    return [
      {
        labels: {
          formatter: (val) => {
            return val.toFixed(2);
          },
        },
      },
    ];
  }

  const yAxis = [];
  Object.entries(units).forEach(([unit, metrics], unitIndex) => {
    const unitFormat = getMetricsUnitFormat(unit, metrics);
    const limits = getMetricsLimits(metrics);
    const seriesName = metrics[0].metric;

    metrics.forEach((metric, metricIndex) => {
      yAxis[metric.index] = {
        labels: {
          formatter: (val) => {
            return (val / unitFormat.divider).toFixed(2) + unitFormat.unit;
          },
        },
        showAlways: metricIndex === 0,
        show: metricIndex === 0,
        seriesName,
        opposite: unitIndex !== 0,
        //min: limits.min,
        //max: limits.max,
        title: metrics.length === 1 ? { text: metric.metric } : {},
      };
    });
  });

  return yAxis;
}

export function extractOptions(data) {
  const formattedOptions = {
    chart: {
      animations: {
        enabled: false,
      },
      //locales: ['fr'],
      defaultLocale: 'fr',
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
