import React, {useEffect} from 'react';
import PropTypes from 'prop-types';

const BarChartDiseases = (props) => {

  useEffect(() => {

  }, []);

  return (props.data) ? (
    <div id={'recruitmentBarChart'}/>
  ) : (
    <>
    </>
  );
}
BarChartDiseases.propTypes = {
  data: PropTypes.object,
};

export default BarChartDiseases;
