import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import PieChart from "./piechart";

const BarChart = (props) => {

  let barChart;

  const formatBarChartData = (data) => {
    let processedData = [];
    if (data.datasets) {
      let females = ['Female'];
      processedData.push(females.concat(data.datasets.female));
      let males = ['Male'];
      processedData.push(males.concat(data.datasets.male));
    }
    return processedData;
}

  useEffect(() => {
    let barChartData = formatBarChartData(props.data);
    barChart = c3.generate({
      size: {
        height: props.height,
        width: props.width,
      },
      bindto: `#${props.id}`,
      data: {
        columns: barChartData,
        type: 'bar'
      },
      axis: {
        x: {
          type : 'categorized',
          categories: props.data.labels
        },
        y: {
          label: 'Candidates registered'
        }
      },
      color: {
        pattern: props.pattern
      }
    });
  }, []);

  return (props.data) ? (
    <div id={props.id}/>
  ) : (
    <>
    </>
  );
}
BarChart.propTypes = {
  id: PropTypes.string.isRequired,
  data: PropTypes.object,
  pattern: PropTypes.array,
  height: PropTypes.number,
  width: PropTypes.number,
};
BarChart.defaultProps = {
  pattern: [
    '#f4e2f0', '#0c6db0',
  ],
  width: 400,
  height: 200,
};

export default BarChart;
