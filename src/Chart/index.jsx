import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ApexChart from 'react-apexcharts';
import extractOptions from './utils/options';
import extractSeries from './utils/series';

function Chart({ widgetId, preferences }) {
  const [options, setOptions] = useState(null);
  const [series, setSeries] = useState(null);

  const { services, metrics, graph_period } = preferences;
  const currentTimestamp = Math.floor(Date.now() / 1000);

  useEffect(() => {
    axios
      .get(
        `api/internal.php?object=centreon_metric&action=metricsData` +
          `&services=${services.replace('-', '_')}&metrics=${metrics}` +
          `&start=${currentTimestamp - graph_period}&end=${currentTimestamp}`,
      )
      .then(({ data }) => {
        console.log(data)
        setOptions(extractOptions(data));
        setSeries(extractSeries(data));
      });
  }, []);

  console.log(options)
  console.log(series)

  return (
    <>
      {options && series && (
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
