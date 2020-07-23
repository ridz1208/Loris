/**
 * This file contains the React component for the fix conflict form
 * to be rendered in the cells of the conflict_resolver datatable.
 */
import {Component} from 'react';
import PropTypes from 'prop-types';

/**
 * The fix FixConflictForm renders a <form> within a <td>. The form as a select
 * dropdown with the two possible answers as values; plus an empty value (default).
 * On change events triggers a POST request to /conflict_resolver/unresolved with
 * the conflict_id and the selected value as payload.
 *
 * It is possible to change the value multiple time, each time sending a new POST
 * request to the same endpoint. After the first request, the empty option of the
 * dropdown is removed to prevent the user from sending a POST request with an empty
 * value.
 *
 * Known issue: When sorting the datatable, previouly fixed conflicts are
 * considered unresolved; there is no green checkmark beside the dropdown anymore.
 */
class FixConflictForm extends Component {
  /**
   * Constructor
   *
   * @param {object} props - The provided properties.
   */
  constructor(props) {
    super(props);

    this.state = {
      success: false,
      error: false,
      emptyOption: true,
    };

    this.resolveConflict = this.resolveConflict.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.error) {
      setTimeout(() => {
        this.setState({error: false});
      }, 3000);
    }
    if (this.state.success) {
      setTimeout(() => {
        this.setState({success: false});
      }, 3000);
    }
  }

  /**
   * Callback for the select dropdown onChange event.
   *
   * Sends a POST request to /conflict_resolver/unresolved containing the
   * conflict_id and the selected value name.
   *
   * If the request is successful, a green checkmark is displayed in a <span>
   * beside the dropdown. On error, a red cross will be displayed as well as a
   * sweetalert (swal) with the error message.
   *
   * @param {string} name
   * @param {string} value
   */
  resolveConflict(name, value) {
    // Hide any previously displayed icon.
    this.setState({success: false, error: false, emptyOption: false});

    fetch(loris.BaseURL.concat('/conflict_resolver/unresolved'), {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({conflictid: name, correctanswer: value}),
    })
    .then((resp) => {
      return resp.ok ? {} : resp.json();
    })
    .then((json) => {
      if (json.error) {
        throw json.error;
      }
      this.setState({success: true});
    })
    .catch((error) => {
      swal('Error!', error, 'error');
      this.setState({error: true});
    });
  }

  render() {
    const {success, error, emptyOption} = this.state;
    const iconStyle = {
      opacity: success || error ? 1 : 0,
      color: success ? 'green' : (error ? 'red' : 'white'),
      transition: 'opacity 2s, color 2s',
    };
    const iconClass = 'glyphicon glyphicon-' + (success ? 'ok' : 'remove')
      + '-circle';
    return (
      <td>
        <span className={iconClass} style={iconStyle}/>
        <SelectElement
          name={this.props.conflictId}
          onUserInput={this.resolveConflict}
          options={this.props.options}
          emptyOption={emptyOption}
        />
      </td>
    );
  }
}

FixConflictForm.propTypes = {
    conflictId: PropTypes.string.isRequired,
    options: PropTypes.object.isRequired,
};

export default FixConflictForm;
