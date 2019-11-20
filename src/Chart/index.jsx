import React, { useState, useEffect, useRef } from 'react';
import { renderToString } from 'react-dom/server';
import ApexChart from 'react-apexcharts';
import AcknowledgeIcon from '@material-ui/icons/EmojiPeople';
import DowntimeIcon from '@material-ui/icons/Gavel';
import { getGeneralOptions, getLocale, extractYaxis } from './utils/options';
import extractSeries from './utils/series';

function Chart({ widgetId, preferences, data, onPeriodChange }) {
  const [options, setOptions] = useState(getGeneralOptions());
  const [yAxis, setYAxis] = useState(null);
  const [series, setSeries] = useState(null);
  const [displayAcknowledge, setDisplayAcknowledge] = useState(false);
  const [displayDowntime, setDisplayDowntime] = useState(false);
  const isInitialMount = useRef(true);

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
            style={{ fontSize: 20 }}
            color={displayAcknowledge ? 'primary' : 'disabled'}
          />,
        ),
        index: 1,
        title: 'display acknowledgements',
        class: 'custom-icon',
        click: (chart, options, e) => {
          setDisplayAcknowledge(!displayAcknowledge);
        },
      });
    }

    if (data.downtime.length > 0) {
      options.chart.toolbar.tools.customIcons.push({
        icon: renderToString(
          <DowntimeIcon
            style={{ fontSize: 20 }}
            color={displayDowntime ? 'primary' : 'disabled'}
          />,
        ),
        index: 2,
        title: 'display downtimes',
        class: 'custom-icon',
        click: (chart, options, e) => {
          setDisplayDowntime(!displayDowntime);
        },
      });
    }
  }

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else if (displayAcknowledge) {
      data.acknowledge.forEach((acknowledge, index) => {
        setOptions({
          ...options,
          annotations: {
            ...options.annotations,
            xaxis: [
              {
                id: `acknowledge-${index}`,
                type: 'acknowledge',
                x: acknowledge.start * 1000,
                strokeDashArray: 0,
                borderColor: '#775DD0',
                label: {
                  borderColor: '#775DD0',
                  style: {
                    color: '#fff',
                    background: '#775DD0',
                  },
                  text: 'acknowledge',
                },
              },
            ],
          },
        });
      });
    } else {
      setOptions({
        ...options,
        annotations: {
          xaxis: options.annotations.xaxis.filter((annotation) => {
            return annotation.type !== 'acknowledge';
          }),
        },
      });
    }
  }, [data.acknowledge, displayAcknowledge]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else if (displayDowntime) {
      data.downtime.forEach((downtime, index) => {
        setOptions({
          ...options,
          annotations: {
            ...options.annotations,
            xaxis: [
              {
                id: `downtime-${index}`,
                type: 'downtime',
                x: downtime.start * 1000,
                x2: downtime.end * 1000,
                strokeDashArray: 0,
                borderColor: '#775DD0',
                label: {
                  borderColor: '#775DD0',
                  style: {
                    color: '#fff',
                    background: '#775DD0',
                  },
                  text: 'downtime',
                },
              },
            ],
          },
        });
      });
    } else {
      setOptions({
        ...options,
        annotations: {
          xaxis: options.annotations.xaxis.filter((annotation) => {
            return annotation.type !== 'downtime';
          }),
        },
      });
    }
  }, [data.downtime, displayDowntime]);

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
