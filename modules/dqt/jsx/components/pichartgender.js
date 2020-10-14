import React, {useEffect, useState} from 'react';
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
            '#bc77af', '#009ff1', '#2DC3D0', '#4AE8C2', '#D90074', '#7900DB', '#FF8000',
            '#0FB500', '#CC0000', '#DB9CFF', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2',
            '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'
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
