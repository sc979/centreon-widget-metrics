import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import ApexChart from 'react-apexcharts';
import extractOptions from './utils/options';
import extractSeries from './utils/series';

function Chart({ widgetId, preferences }) {
  const [options, setOptions] = useState(null);
  const [series, setSeries] = useState(null);

  useEffect(() => {
    axios
      .get(
        `api/internal.php?object=centreon_metric&action=metricsData&services=11_50&metrics=11_48_3&start=1574078146&end=1574081746`,
      )
      .then(({ data }) => {
        setOptions(extractOptions(data));
        setSeries(extractSeries(data));
      });
  }, []);

  //console.log(series)

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
