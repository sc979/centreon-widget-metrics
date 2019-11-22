export function orderMetrics(metrics) {
  return metrics.sort((a, b) => (a.ds_order > b.ds_order ? 1 : -1));
}

export function getMaxAbsoluteValue(min, max) {
  return Math.max(Math.abs(min), Math.abs(max));
}

export function getUnitBase(unit) {
  const base1024 = [
    'B',
    'bytes',
    'bytespersecond',
    'B/s',
    'B/sec',
    'o',
    'octets',
  ];
  if (base1024.includes(unit)) {
    return 1024;
  }

  return 1000;
}

export function getUnitFormat(unit, min, max) {
  const maxAbsValue = getMaxAbsoluteValue(min, max);
  const base = getUnitBase(unit);

  let unitFormat = {
    divider: 1,
    unit,
  };
  ['M', 'G', 'T'].forEach((scale) => {
    const divider = unitFormat.divider * base;
    if (maxAbsValue % divider !== maxAbsValue) {
      unitFormat = {
        divider,
        unit: scale + unit,
      };
    }
  });

  return unitFormat;
}

export function getMetricsUnitFormat(unit, metrics) {
  let metricUnitFormat = {
    divider: 1,
    unit,
  };

  metrics.forEach((metric) => {
    const unitFormat = getUnitFormat(unit, metric.min, metric.max);
    if (unitFormat.divider > metricUnitFormat.divider) {
      metricUnitFormat = unitFormat;
    }
  });

  return metricUnitFormat;
}

function getMetricsMin(metrics) {
  let min = null;

  for (const metric of metrics) {
    if (isNaN(metric.min)) {
      return null;
    }

    if (min === null || metric.min < min) {
      min = metric.min;
    }
  }

  return parseInt(min);
}

function getMetricsMax(metrics) {
  let max = null;

  for (const metric of metrics) {
    if (isNaN(metric.max)) {
      return null;
    }

    if (max === null || metric.max > max) {
      max = metric.max;
    }
  }

  return parseInt(max);
}

export function getMetricsLimits(metrics) {
  return {
    min: getMetricsMin(metrics),
    max: getMetricsMax(metrics),
  };
}
