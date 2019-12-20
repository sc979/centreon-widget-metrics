import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

const rootElement = document.getElementById('root');
const widgetId = rootElement.getAttribute('data-widget-id');
const timezone = rootElement.getAttribute('data-widget-timezone');

ReactDOM.render(<App widgetId={widgetId} timezone={timezone} />, rootElement);
