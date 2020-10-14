import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import PiChartGender from "./pichartgender";

const StatisticsReport = (props) => {

  const [loaded, setLoaded] = useState (false);

  const [statistics, setStatistics] = useState ({
    participants: '',
  });

  async function fetchStatistics() {
    let resp = await fetch(props.loris.BaseURL
      + '/AjaxHelper.php?Module=dqt&script=statistics.php', {
      method: 'GET',
      cache: 'no-cache',
      credentials: 'same-origin',
    });
    if (resp.ok && resp.status === 200) {
      let data = await resp.json();
      console.log('data is ');
      console.log(data);
      setStatistics(data);
      return true;
    }
    console.error('fetchStatistics failed');
    return false;
  }

  useEffect(() => {
    fetchStatistics().then(status => {
      setLoaded(status);
    });
  }, []);

  return (loaded) ? (
    <div className={'container-fluid'}
         style={{margin: '0 auto', maxWidth: '900px'}}>
      <div style={{
        width: '100%',
        color: '#fff',
        padding: '18px',
        outline: 'none',
        fontSize: '1.2em',
        textAlign: 'center',
        backgroundColor: '#913887',
      }}>
        Statistics Report
      </div>
      <div style={{
        display: 'block',
        margin: '0 0 10px',
        overflow: 'hidden',
        padding: '20px 18px',
        backgroundColor: '#fff',
        border: '1px solid #913887',
      }}>
        <p>Number of participants: {statistics.participants}</p>
        <p>..sample test..</p>
        <PiChartGender data={statistics.participants}/>
      </div>
    </div>
  ) : (
    <>
    </>
  );
}
StatisticsReport.propTypes = {
  loris: PropTypes.object,
};

export default StatisticsReport;
