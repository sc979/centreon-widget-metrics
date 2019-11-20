import en from 'apexcharts/dist/locales/en.json';
import fr from 'apexcharts/dist/locales/fr.json';
import es from 'apexcharts/dist/locales/es.json';
import pt from 'apexcharts/dist/locales/pt-br.json';
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

  if (Object.keys(units).length > 2) {
    return [
      {
        labels: {
          formatter: (val) => {
            if (typeof val === 'number') {
              return val.toFixed(2);
            }
            return null;
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
            if (typeof val === 'number') {
              return (val / unitFormat.divider).toFixed(2) + unitFormat.unit;
            }
            return null;
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

export function getLocale(locale = 'en') {
  return locale;
}

export function getGeneralOptions() {
  const formattedOptions = {
    chart: {
      animations: {
        enabled: false,
      },
      locales: [en, fr, es, pt],
      events: {},
    },
    stroke: {
      width: 1,
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
    tooltip: {
      enabled: true,
      x: {
        show: true,
        //format: 'dd MM HH:mm',
        formatter: (timestamp) => {
          const DateToFormat = new Date(timestamp);
          return `${DateToFormat.toLocaleDateString()} ${DateToFormat.toLocaleTimeString()}`;
        },
      },
      onDatasetHover: {
        highlightDataSeries: false,
      },
      /*
      custom: ({ series, seriesIndex, dataPointIndex, w }) => {
        return (
          <div className="arrow_box">
            test
          </div>
        );
        return `<div class="arrow_box"><span>${series[seriesIndex][dataPointIndex]}</span></div>`;
      },
      */
    },
    markers: {
      size: 0,
      hover: {
        size: 0,
        sizeOffset: 0,
      },
    },
  };

  return formattedOptions;
}
