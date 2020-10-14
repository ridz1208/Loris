import React, {useEffect} from 'react';
import PropTypes from 'prop-types';

const PiChartGender = (props) => {

  let recruitmentPieChart;

  const formatPieData = (data) => {
    let processedData = [];
    for (let i in data) {
      const siteData = [data[i].label, data[i].total];
      processedData.push(siteData);
    }
    return processedData;
  }

  useEffect(() => {
    let recruitmentPieData = formatPieData([
      {label: "Females", total: "602656"},
      {label: "Males", total: "402256"}
    ]);
    recruitmentPieChart = c3.generate({
      size: {
        height: 200,
        width: 200,
      },
      bindto: '#recruitmentPieChart',
      data: {
          columns: recruitmentPieData,
          type : 'pie'
      },
      color: {
          pattern: [
            '#f4e2f0', '#0c6db0',
          ]
      }
    });
  }, []);

  return (props.data) ? (
    <div id={'recruitmentPieChart'}/>
  ) : (
    <>
    </>
  );
}
PiChartGender.propTypes = {
  data: PropTypes.object,
};

export default PiChartGender;
