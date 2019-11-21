import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Chart from './Chart';

function App({ widgetId }) {
  // run legacy method from centreon web to resize iframe's height
  window.parent.iResize(window.name, 300);

  const [title, setTitle] = useState(null);
  const [dataParams, setDataParams] = useState(null);
  const [displayStatus, setDisplayStatus] = useState(false);
  const [displayAcknowledgements, setDisplayAcknowledgements] = useState(false);
  const [displayDowntimes, setDisplayDowntimes] = useState(false);
  const [displayStacked, setDisplayStacked] = useState(false);
  const [statusData, setStatusData] = useState(null);
  const [metricsData, setMetricsData] = useState(null);

  useEffect(() => {
    axios
      .get(
        `api/internal.php?object=centreon_home_customview&action=preferencesByWidgetId&widgetId=${widgetId}`,
      )
      .then(({ data }) => {
        const {
          title: prefTitle,
          services,
          metrics,
          graph_period: period,
          display_status: status,
          display_acknowledgements: acknowledgements,
          display_downtimes: downtimes,
          stacked,
        } = data;
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const start = currentTimestamp - period;
        const end = currentTimestamp;

        setTitle(prefTitle);
        setDataParams({ services, metrics, start, end });
        setDisplayStatus(status === '1');
        setDisplayAcknowledgements(acknowledgements === '1');
        setDisplayDowntimes(downtimes === '1');
        setDisplayStacked(stacked === '1');
      });
  }, [widgetId]);

  useEffect(() => {
    if (dataParams === null) {
      return;
    }

    const { services, metrics, start, end } = dataParams;
    if (services.length > 0 || metrics.length > 0) {
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
    }
  }, [dataParams]);

  useEffect(() => {
    if (dataParams === null || metricsData === null) {
      return;
    }

    const { services, metrics, start, end } = dataParams;
    if (
      metricsData.global.multiple_services === 0 &&
      services.split(',').length === 1 &&
      metrics.length === 0
    ) {
      axios
        .get(
          `api/internal.php?object=centreon_metric&action=statusByService` +
            `&ids=${services.replace(/-/g, '_')}` +
            `&start=${start}` +
            `&end=${end}`,
        )
        .then(({ data }) => {
          if (data[0] && data[0].data && data[0].data.status) {
            setStatusData(data[0].data.status);
          }
        });
    }
  }, [dataParams, metricsData]);

  const handlePeriodChange = (start, end) => {
    setDataParams({
      ...dataParams,
      start,
      end,
    });
  };

  const handleDisplayStatus = (value) => {
    setDisplayStatus(value);
  };

  const handleDisplayAcknowledgements = (value) => {
    setDisplayAcknowledgements(value);
  };

  const handleDisplayDowntimes = (value) => {
    setDisplayDowntimes(value);
  };

  const handleDisplayStacked = (value) => {
    setDisplayStacked(value);
  };

  return (
    <>
      {metricsData && (
        <Chart
          widgetId={widgetId}
          title={title}
          data={metricsData}
          onPeriodChange={handlePeriodChange}
          displayStatus={displayStatus}
          statusData={statusData}
          onDisplayStatus={handleDisplayStatus}
          displayAcknowledgements={displayAcknowledgements}
          onDisplayAcknowledgements={handleDisplayAcknowledgements}
          displayDowntimes={displayDowntimes}
          onDisplayDowntimes={handleDisplayDowntimes}
          displayStacked={displayStacked}
          onDisplayStacked={handleDisplayStacked}
        />
      )}
    </>
  );
}

export default App;
