import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ApexChart from 'react-apexcharts';
import { getGeneralOptions, getLocale, extractYaxis } from './utils/options';
import extractSeries from './utils/series';

function Chart({ widgetId, preferences }) {
  const options = getGeneralOptions();
  const [yAxis, setYAxis] = useState(null);
  const [series, setSeries] = useState(null);

  const { title, services, metrics, graph_period: period } = preferences;

  const fetchMetricsData = (selectedServices, selectedMetrics, start, end) => {
    axios
      .get(
        `api/internal.php?object=centreon_metric&action=metricsData` +
          `&services=${selectedServices.replace('-', '_')}` +
          `&metrics=${selectedMetrics}` +
          `&start=${start}` +
          `&end=${end}`,
      )
      .then(({ data }) => {
        setYAxis(extractYaxis(data));
        setSeries(extractSeries(data));
      });
  };

  useEffect(() => {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const start = currentTimestamp - period;
    const end = currentTimestamp;
    fetchMetricsData(services, metrics, start, end);
  }, []);

  options.title = { text: title, align: 'center' };
  options.chart.defaultLocale = getLocale();
  options.yaxis = yAxis;
  options.chart.events.beforeZoom = (chartContext, { xaxis }) => {
    const start = Math.floor(xaxis.min / 1000);
    const end = Math.floor(xaxis.max / 1000);
    fetchMetricsData(services, metrics, start, end);
  };

  return (
    <>
      {yAxis && series && (
        <ApexChart
          options={options}
          series={series}
          type="line"
          height="300px"
        />
      )}
    </>
  );
}

export default Chart;
