//enable/disable dependent files according to XIN Rules
//
//example rules
// var rules = {
//     "protocol_version": {
//         "message": "Required",
//         "group": "protocol_version_group",
//         "rules": ["signed{@}=={@}yes", "protocol_version_status{@}=={@}"]
//     },
//     "signed_date_date": {
//         "message": "Required",
//         "group": "signed_date_date_group",
//         "rules": ["signed{@}=={@}yes", "signed_date_date_status{@}=={@}"]
//     },
//     "signed_time": {
//         "message": "Required",
//         "group": "signed_time_group",
//         "rules": ["signed{@}=={@}yes", "signed_time_status{@}=={@}"]
//     }
// };

function XINRunElementRules(elname, elements, rules) {
    var errors = [];

    //Conditions for the rule to be true, and thus the element to be required.
    var is_required = true;

    for (var index = 0; index < rules['rules'].length; index++) {
        var rule = rules['rules'][index];
        //Loop through the assigned rules (which is the array of formatted
        //statements passed in XINRegisterRule)
        //If this is an OR rule using two different controllers explode it
        //at the pipe.  ex: q_1{@}=={@}yes|q_2{@}=={@}yes
        var rules_array;
        if (rule.lastIndexOf('{@}') < rule.indexOf('|')) {
            rules_array = [rule];
        }
        else {
            rules_array = rule.split("|");
        }

        //Loop through the rules (will only be one rule if this is not an OR)
        var or_conditions = [];
        for (var i = 0; i < rules_array.length; i++) {
            var rule = rules_array[i].split("{@}");

            //ncote: this next bit will not work, given the split done above
            //Some rules compare against multiple values, handle this here.

            var values;
            if (rule[2].indexOf("|") != -1) {  //ex: q_1{@}=={@}yes|no
                values = rule[2].split("|");
            } else {  //ex: q_1{@}=={@}yes
                values = [rule[2]];
            }

            //Handle select multiples who's controllre values are arrays.


            //if controller field disabled, we will not have a value in the elements array, just assign ''
            if (elements[rule[0]] === undefined) {
                elements[rule[0]] = [''];
            }
            //explicitly cast the controller value as an array
            if (!Array.isArray(elements[rule[0]])) {
                elements[rule[0]] = [elements[rule[0]]];
            }
            //Foreach controller value run the rule.
            var or_conditions = false;
            for (var controllerIndex = 0; controllerIndex < elements[rule[0]].length; controllerIndex++) {
                var controller_value = elements[rule[0]][controllerIndex];
                var ElementResult = XINRunRuleFunction(
                    controller_value,
                    values,
                    rule[1]
                );

                if (ElementResult) {
                    or_conditions = true; //If any of the OR rules is true
                }
            }
        }

        //If NONE of the or_conditions were true the field is NOT required.
        if (or_conditions == false) {
            is_required = false;
        }
    }
    return is_required;
    // //If all of the conditions were true then print the error message
    // if (is_required == true) {
    //     var el = rules['group'] != "" ? rules['group'] : elname;
    //     errors[el] = rules['message'];
    // }
    // return errors;
}


/**
 * Run a XIN rule on an individual element
 *
 * @param string controller The element which affects the validity of this
 *                           element
 * @param array  values     Array of values which will invalidate the rule.
 * @param string operator   The operator which is used to compare the rule.
 *
 * @return boolean true if element should be required, false otherwise.
 */
function XINRunRuleFunction(controller, values, operator) {
    if (['==', '!=', '>', '>=', '<', '<='].indexOf(operator) == -1) {
        return true;
    }
    var is_required = true;
    //Loop through the conditions to test against (for most rules it
    //will only be one value)
    //If all of the conditions are true (ie: all conditions are met
    //to pop a required rule)
    var valFlag = [];
    for (var index = 0; index < values.length; index++) {
        var value = values[index];
        var compareFunction = create_function(
            'a, b',
            'return (a ' + operator + ' b);'
        );
        if (!compareFunction(controller, value)) {
            // IF one of the conditions is not  met then this rule
            // does not need to be run.
            valFlag.push(false);
        }
    }
    //For conditions
    if (valFlag.length == values.length) {
        is_required = false;
    }
    return is_required;
}

function create_function(args, code) {
    try {
        return Function.apply(null, args.split(',').concat(code))
    } catch (e) {
        return false
    }
}

function runAllElementRules() {

    if (typeof validationRules === "undefined") {
        return;
    }
    //values
    //massage fieldnames and values to match server-side behaviour
    var valuesArray = jQuery('#test_form').serializeArray();
    //make into an object
    var valuesObject = {};
    for (var index = 0; index < valuesArray.length; index++) {
        valuesObject[valuesArray[index].name] = valuesArray[index].value;
    }

    for (elname in validationRules) {
        var elementValidationRules = validationRules[elname];
        //remove rules like
        //     xxx_version_status{@}=={@}: will prevent the main field from ever becoming enabled when not_answered is selected
        //     ... NEVER_REQUIRED: hack to allow for optional fields
        elementValidationRules.rules = elementValidationRules.rules.filter(function (rule) {
            return !(/_status\{@\}==\{@\}$/.test(rule) || /NEVER_REQUIRED/.test(rule));
        });
        var enabled = XINRunElementRules(elname, valuesObject, elementValidationRules);
        //enable/disable the status field if it exists
        jQuery('#test_form [name="' + elname + '_status"]').prop('disabled', !enabled);
        //only actually enable the main field if related _status field is BLANK (or non-existent, thus the || '' since will be undefined)
        enabled = enabled && ((jQuery('#test_form [name="' + elname + '_status"]').val() || '') == '');
        // check: if enabled == false, remains false
        //        if enabled == true, remains true only if _status==BLANK (or doesn't exist)
        //blindly try elname, elname[H], elname[i] to handle time elements (two dropdowns)
        // also, handle date fields with format-neutral backing fields: i.e. of the form base_name + '_visible_date_field'
        jQuery('#test_form [name="' + elname + '"],#test_form [name="' + elname + '[H]"],#test_form [name="' + elname + '[i]"],#test_form #' + elname + '_visible_date_field').prop('disabled', !enabled);
    }
}

//react to all changes
jQuery(document).ready(function () {
    jQuery('input, select, textarea').on('change', function (event) {
        runAllElementRules();
    });
    runAllElementRules();
});
