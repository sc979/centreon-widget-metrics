import React, { useState, useEffect } from 'react';
import { renderToString } from 'react-dom/server';
import ApexChart from 'react-apexcharts';
import StatusIcon from '@material-ui/icons/ViewArray';
import AcknowledgeIcon from '@material-ui/icons/EmojiPeople';
import DowntimeIcon from '@material-ui/icons/Gavel';
import StackedIcon from '@material-ui/icons/HorizontalSplit';
import {
  getGeneralOptions,
  getLocale,
  extractYaxis,
  extractColors,
  groupByUnit,
} from './utils/options';
import extractSeries from './utils/series';

function Chart({
  widgetId,
  title,
  data,
  onPeriodChange,
  displayStatus,
  statusData,
  onDisplayStatus,
  displayAcknowledgements,
  onDisplayAcknowledgements,
  displayDowntimes,
  onDisplayDowntimes,
  displayStacked,
  onDisplayStacked,
}) {
  const options = getGeneralOptions();
  const [yAxis, setYAxis] = useState(null);
  const [series, setSeries] = useState(null);
  const [colors, setColors] = useState(null);
  const [downtimes, setDowntimes] = useState([]);
  const [acknowledgements, setAcknowledgements] = useState([]);
  const [status, setStatus] = useState([]);
  const [stacked, setStacked] = useState(false);


  useEffect(() => {
    setYAxis(extractYaxis(data));
    setColors(extractColors(data));
  }, [data]);

  useEffect(() => {
    setSeries(extractSeries(data, stacked));
  }, [data, stacked]);

  options.title = { text: title, align: 'center' };
  options.chart.defaultLocale = getLocale();
  options.yaxis = yAxis;
  options.colors = colors;

  options.chart.stacked = stacked;

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
    if (statusData !== null) {
      options.chart.toolbar.tools.customIcons.push({
        icon: renderToString(
          <StatusIcon
            fontSize="small"
            style={{ color: displayStatus ? '#008FFB' : '#6E8192' }}
          />,
        ),
        index: 1,
        title: 'display status',
        class: 'custom-icon',
        click: () => {
          onDisplayStatus(!displayStatus);
        },
      });
    }

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

    if (Object.keys(groupByUnit(data)).length === 1) {
      options.chart.toolbar.tools.customIcons.push({
        icon: renderToString(
          <StackedIcon
            fontSize="small"
            style={{ color: displayStacked ? '#008FFB' : '#6E8192' }}
          />,
        ),
        index: 2,
        title: 'stacked',
        class: 'custom-icon',
        click: () => {
          onDisplayStacked(!displayStacked);
        },
      });
    }
  }

  useEffect(() => {
    if (displayStatus && statusData !== null) {
      const statusParams = {
        ok: 'green',
        warning: 'yellow',
        critical: 'red',
        unknown: 'grey',
      };
      setStatus(
        Object.entries(statusData).reduce((acc, [statusLabel, values]) => {
          if (statusParams[statusLabel]) {
            values.forEach((value) => {
              acc.push({
                x: value.start * 1000,
                x2: value.end * 1000,
                fillColor: statusParams[statusLabel],
                borderColor: 'none',
                opacity: 0.1,
                label: {
                  text: ' ',
                },
              });
            });
          }
          return acc;
        }, []),
      );
    } else {
      setStatus([]);
    }
  }, [statusData, displayStatus]);

  useEffect(() => {
    if (displayAcknowledgements && data.global.multiple_services === 0) {
      setAcknowledgements(
        data.acknowledge.map((acknowledge) => ({
          x: acknowledge.start * 1000,
          strokeDashArray: 5,
          borderColor: '#91911f',
          opacity: 0.5,
          label: {
            borderColor: '#91911f',
            style: {
              color: '#fff',
              background: '#c0c01e',
            },
            text: 'ack',
          },
        })),
      );
    } else {
      setAcknowledgements([]);
    }
  }, [data.acknowledge, displayAcknowledgements]);

  useEffect(() => {
    if (displayDowntimes && data.global.multiple_services === 0) {
      setDowntimes(
        data.downtime.map((downtime, index) => ({
          x: downtime.start * 1000,
          x2: downtime.end * 1000,
          strokeDashArray: 5,
          borderColor: '#775DD0',
          opacity: 0.5,
          label: {
            borderColor: '#775DD0',
            style: {
              color: '#fff',
              background: '#775DD0',
            },
            text: 'dwt',
          },
        })),
      );
    } else {
      setDowntimes([]);
    }
  }, [data.downtime, displayDowntimes]);

  useEffect(() => {
    const isStacked =
      displayStacked &&
      data.global.multiple_services === 0 &&
      Object.keys(groupByUnit(data)).length === 1;
    setStacked(isStacked);
  }, [data, displayStacked]);

  options.chart.events.beforeZoom = (chartContext, { xaxis }) => {
    const start = Math.floor(xaxis.min / 1000);
    const end = Math.floor(xaxis.max / 1000);
    onPeriodChange(start, end);
  };

  options.fill = {
    type: 'solid',
    opacity: 0.5,
  };

  options.annotations.xaxis = [...status, ...acknowledgements, ...downtimes];

  console.log('render')

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
