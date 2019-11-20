import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ApexChart from 'react-apexcharts';
import { getGeneralOptions, getLocale, extractYaxis } from './utils/options';
import extractSeries from './utils/series';

function Chart({ widgetId, preferences, data, onPeriodChange }) {
  const options = getGeneralOptions();
  const [yAxis, setYAxis] = useState(null);
  const [series, setSeries] = useState(null);

  const { title } = preferences;

  useEffect(() => {
    setYAxis(extractYaxis(data));
    setSeries(extractSeries(data));
  }, [data]);

  options.title = { text: title, align: 'center' };
  options.chart.defaultLocale = getLocale();
  options.yaxis = yAxis;
  options.chart.events.beforeZoom = (chartContext, { xaxis }) => {
    const start = Math.floor(xaxis.min / 1000);
    const end = Math.floor(xaxis.max / 1000);
    onPeriodChange(start, end);
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
