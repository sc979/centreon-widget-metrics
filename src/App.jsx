import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Chart from './Chart';

function App({ widgetId }) {
  // run legacy method from centreon web to resize iframe's height
  window.parent.iResize(window.name, 500);

  const [preferences, setPreferences] = useState(null);

  useEffect(() => {
    axios
      .get(
        `api/internal.php?object=centreon_home_customview&action=preferencesByWidgetId&widgetId=${widgetId}`,
      )
      .then(({ data }) => {
        setPreferences(data);
      });
  }, [widgetId]);

  return (
    <>
      {preferences && <Chart widgetId={widgetId} preferences={preferences} />}
    </>
  );
}

export default App;
