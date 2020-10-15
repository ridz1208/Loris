import React, {useEffect} from 'react';
import PropTypes from 'prop-types';

const Piechart = (props) => {

  let pieChart;

  const formatPieData = (data) => {
    let processedData = [];
    for (let i in data) {
      if (data.hasOwnProperty(i)) {
        const siteData = [data[i].label, data[i].total];
        processedData.push(siteData);
      }
    }
    return processedData;
  }

  useEffect(() => {
    let pieData = formatPieData(props.data);
    pieChart = c3.generate({
      size: {
        height: props.height,
        width: props.width,
      },
      bindto: `#${props.id}`,
      data: {
          columns: pieData,
          type : 'pie',
      },
      color: {
          pattern: props.pattern,
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
Piechart.propTypes = {
  id: PropTypes.string.isRequired,
  data: PropTypes.object,
  pattern: PropTypes.array,
  height: PropTypes.number,
  width: PropTypes.number,
};
Piechart.defaultProps = {
  pattern: [
    '#f4e2f0', '#0c6db0',
  ],
  width: 200,
  height: 200,
};

export default Piechart;
