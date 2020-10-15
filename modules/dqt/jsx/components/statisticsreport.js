import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import PieChart from './piechart';
import BarChart from './barchart';

const StatisticsReport = (props) => {

  const [loaded, setLoaded] = useState(false);

  const [statistics, setStatistics] = useState ({
    participants: '',
    gender: [],
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
        <p align={'center'}><b style={{color: '#0d346e'}}>
          Number of participants:</b> {statistics.participants}
        </p>
        <div style={{display: 'flex', flexWrap: 'wrap'}}>
          <BarChart
            id={'barChartDisease'}
            data={
              {
                labels: ['Autism', 'Anxiety', 'OCD'],
                datasets: {
                  female: ['500000', '320123', '159000'],
                  male: ['450000', '932000', '169000']
                }
              }
            }
            style={{flex: 1}}
          />
          <PieChart
            id={'pieChartGender'}
            data={statistics.gender}
            style={{flex: 0.5}}
          />
        </div>
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
