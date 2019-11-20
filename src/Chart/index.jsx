import React, { useState, useEffect, useRef } from 'react';
import { renderToString } from 'react-dom/server';
import ApexChart from 'react-apexcharts';
import AcknowledgeIcon from '@material-ui/icons/EmojiPeople';
import DowntimeIcon from '@material-ui/icons/Gavel';
import { getGeneralOptions, getLocale, extractYaxis } from './utils/options';
import extractSeries from './utils/series';

function Chart({
  widgetId,
  preferences,
  data,
  onPeriodChange,
  statusData,
  displayAcknowledgements,
  onDisplayAcknowledgements,
  displayDowntimes,
  onDisplayDowntimes,
}) {
  const options = getGeneralOptions();
  const [yAxis, setYAxis] = useState(null);
  const [series, setSeries] = useState(null);
  const [downtimes, setDowntimes] = useState([]);
  const [acknowledgements, setAcknowledgements] = useState([]);
  const [status, setStatus] = useState([]);

  const { title } = preferences;

  useEffect(() => {
    setYAxis(extractYaxis(data));
    setSeries(extractSeries(data));
  }, [data]);

  options.title = { text: title, align: 'center' };
  options.chart.defaultLocale = getLocale();
  options.yaxis = yAxis;

  options.chart.toolbar = {
    show: true,
    tools: {
      download: false,
      selection: true,
      zoom: true,
      zoomin: false,
      zoomout: true,
      pan: false,
      reset: false,
    },
    autoSelected: 'zoom',
  };

  options.chart.toolbar.tools.customIcons = [];
  if (data.global.multiple_services === 0) {
    if (data.acknowledge.length > 0) {
      options.chart.toolbar.tools.customIcons.push({
        icon: renderToString(
          <AcknowledgeIcon
            fontSize="small"
            style={{ color: displayAcknowledgements ? '#008FFB' : '#6E8192' }}
          />,
        ),
        index: 1,
        title: 'display acknowledgements',
        class: 'custom-icon',
        click: () => {
          onDisplayAcknowledgements(!displayAcknowledgements);
        },
      });
    }

    if (data.downtime.length > 0) {
      options.chart.toolbar.tools.customIcons.push({
        icon: renderToString(
          <DowntimeIcon
            fontSize="small"
            style={{ color: displayDowntimes ? '#008FFB' : '#6E8192' }}
          />,
        ),
        index: 2,
        title: 'display downtimes',
        class: 'custom-icon',
        click: () => {
          onDisplayDowntimes(!displayDowntimes);
        },
      });
    }
  }

  useEffect(() => {
    if (displayAcknowledgements) {
      setAcknowledgements(
        data.acknowledge.map((acknowledge) => ({
          x: acknowledge.start * 1000,
          strokeDashArray: 0,
          borderColor: '#91911f',
          opacity: 0.5,
          label: {
            borderColor: '#91911f',
            style: {
              color: '#fff',
              background: '#c0c01e',
            },
            text: 'acknowledge',
          },
        })),
      );
    } else {
      setAcknowledgements([]);
    }
  }, [data.acknowledge, displayAcknowledgements]);

  useEffect(() => {
    if (displayDowntimes) {
      setDowntimes(data.downtime.map((downtime, index) => {
        return {
          type: 'downtime',
          x: downtime.start * 1000,
          x2: downtime.end * 1000,
          strokeDashArray: 0,
          borderColor: '#775DD0',
          opacity: 0.5,
          label: {
            borderColor: '#775DD0',
            style: {
              color: '#fff',
              background: '#775DD0',
            },
            text: 'downtime',
          },
        };
      }));
    } else {
      setDowntimes([]);
    }
  }, [data.downtime, displayDowntimes]);

  useEffect(() => {
    if (statusData !== null) {
      setStatus(statusData.ok.map(({ start, end }, index) => {
        return {
          type: 'status',
          x: start * 1000,
          x2: end * 1000,
          strokeDashArray: 0,
          fillColor: 'green',
          borderColor: 'none',
          opacity: 0.1,
          label: {
            text: ' ',
          },
        };
      }));
    } else {
     setStatus([]);
    }
  }, [statusData]);

  options.chart.events.beforeZoom = (chartContext, { xaxis }) => {
    const start = Math.floor(xaxis.min / 1000);
    const end = Math.floor(xaxis.max / 1000);
    onPeriodChange(start, end);
  };

  options.annotations.xaxis = [...status, ...acknowledgements, ...downtimes];

  return (
    <>
      {yAxis && series && (
        <ApexChart
          options={options}
          series={series}
          type="line"
          height="260px"
        />
      )}
    </>
  );
}

export default Chart;
