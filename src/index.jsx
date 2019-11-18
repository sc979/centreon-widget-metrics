import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

const rootElement = document.getElementById('root');
const widgetId = rootElement.getAttribute('data-widget-id');

ReactDOM.render(<App widgetId={widgetId} />, rootElement);
