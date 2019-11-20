import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Chart from './Chart';

function App({ widgetId }) {
  // run legacy method from centreon web to resize iframe's height
  window.parent.iResize(window.name, 400);

  const [preferences, setPreferences] = useState(null);
  const [dataParams, setDataParams] = useState(null);
  const [metricsData, setMetricsData] = useState(null);

  useEffect(() => {
    axios
      .get(
        `api/internal.php?object=centreon_home_customview&action=preferencesByWidgetId&widgetId=${widgetId}`,
      )
      .then(({ data }) => {
        const { services, metrics, graph_period: period } = data;
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const start = currentTimestamp - period;
        const end = currentTimestamp;

        setPreferences(data);
        setDataParams({ services, metrics, start, end });
      });
  }, [widgetId]);

  useEffect(() => {
    if (dataParams === null) {
      return;
    }

    const { services, metrics, start, end } = dataParams;

    axios
      .get(
        `api/internal.php?object=centreon_metric&action=metricsData` +
          `&services=${services.replace(/-/g, '_')}` +
          `&metrics=${metrics}` +
          `&start=${start}` +
          `&end=${end}`,
      )
      .then(({ data }) => {
        setMetricsData(data);
      });
  }, [dataParams]);

  const handlePeriodChange = (start, end) => {
    setDataParams({
      ...dataParams,
      start,
      end,
    });
  };

  return (
    <>
      {metricsData && (
        <Chart
          widgetId={widgetId}
          preferences={preferences}
          data={metricsData}
          onPeriodChange={handlePeriodChange}
        />
      )}
    </>
  );
}

export default App;
