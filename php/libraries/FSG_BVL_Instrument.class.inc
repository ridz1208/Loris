<?php

require_once(__DIR__ . '/FSG_Utility.class.inc');

class FSG_BVL_Instrument extends NDB_BVL_Instrument
{
    public $customElementRulesSpecifications = [];  //public: need to access this from the inheriting class,
    protected $softValidation = true;  //important for us: we need to allow saving regardless of validation errors

    var $ValidityEnabled = false;
    var $ValidityRequired = false;

    var $headerGroupIndex = 0;  //used in addHeaderRow(...) to ensure a unique group name

    // and protected doesn't seem to allow this

    function addIntegerRangeRule($element, $min, $max)
    {
        //FIX: temporary array to hold validation specification: really should extend  LorisForm addFormRule to allow enough expressiveness for
        //converting this rule to a readable string
//        if (!isset($this->customElementRulesSpecifications)) {
//            $this->customElementRulesSpecifications = [];
//        }

        $this->customElementRulesSpecifications[$element][] = "IntegerRange: [$min, $max]";

        $this->form->addFormRule(function ($values) use ($element, $min, $max) {
            $value = trim($values[$element]);
            if ($value != "") {
                $converted = (int)$value;
                if ((string)$converted != $value) {
                    return [$element => 'Integer value required'];
                } else if (($min !== null && $converted < $min) || ($max !== null && $converted > $max)) {
                    if ($min === null) {
                        return [$element => "Value required less than or equal to $max"];
                    } else if ($max == null) {
                        return [$element => "Value required greater than or equal to $min"];
                    } else {
                        return [$element => "Value required between $min and $max"];
                    }
                }
            }
        });
    }

    function addFloatRangeRule($element, $min, $max)
    {
//        if (!isset($this->customElementRulesSpecifications)) {
//            $this->customElementRulesSpecifications = [];
//        }

        $this->customElementRulesSpecifications[$element][] = "FloatRange: [$min, $max]";

        $this->form->addFormRule(function ($values) use ($element, $min, $max) {
            $value = trim($values[$element]);
            if ($value != "") {
                $converted = (float)$value;
                if ((string)$converted != $value) {
                    return [$element => 'Decimal value required'];
                } else if (($min !== null && $converted < $min) || ($max !== null && $converted > $max)) {
                    if ($min === null) {
                        return [$element => "Value required less than or equal to $max"];
                    } else if ($max == null) {
                        return [$element => "Value required greater than or equal to $min"];
                    } else {
                        return [$element => "Value required between $min and $max"];
                    }
                }
            }
        });
    }

    //$value: string-formatted date yyyy-mm-dd, potentially with zero month and/or day
    function isValidIncompleteDate($value)
    {
        $completeDate = $this->incompleteDateToCompleteDate($value);
        if ($completeDate === null) {
            return false;
        }
        return $this->isValidDate($completeDate);
    }

    function isValidDate($value)
    {
        $elements = explode('-', $value);
        if (count($elements) != 3) {
            return false;
        }
        if (intval($elements[0]) > 9999) {
            return false;
        }
        return (checkdate($elements[1], $elements[2], $elements[0])); //note the argument order: month, day, year !!
    }

    //$value: string-formatted date yyyy-mm-dd, potentially with zero month and/or day, e.g. 2017-00-00
    //return value: string-formatted date (not necessarily valid) with 00 month and/or day changed to 01 e.g. 2017-01-01
    function incompleteDateToCompleteDate($value)
    {
        $elements = explode('-', trim($value));
        if (count($elements) != 3) {
            return null;
        }

        //if date is incomplete, we need to set any 00 day or month to 01
        if ($elements[1] === '00') {
            $elements[1] = '01';
        }
        if ($elements[2] === '00') {
            $elements[2] = '01';
        }

        return $elements[0] . '-' . $elements[1] . '-' . $elements[2];
    }

    //works with partial dates as well
    function addNoFutureDateRule($element)
    {
        $this->customElementRulesSpecifications[$element][] = "NoFutureDate";

        $this->form->addFormRule(function ($values) use ($element) {
            $value = trim($values[$element]);

            if ($value != '') {
                //reject invalid dates
                if (!$this->isValidDate($value)) {
                    return [$element => 'Invalid date.'];
                }

                $completeDate = $this->incompleteDateToCompleteDate($value);
                if (new \DateTime($completeDate) > new \DateTime('now')) {
                    return [$element => 'The date you have selected is in the future.'];
                }
            }
        });
    }

    function addPartialDateRule($element)
    {
        $this->form->addFormRule(function ($values) use ($element) {
            $value = trim($values[$element]);

            if ($value != '') {
                //reject invalid dates
                if (!$this->isValidIncompleteDate($value)) {
                    return [$element => 'Invalid date.'];
                }
            }
        });
    }

    function addOptionalRule($field)
    {
        $this->XINRegisterRule(
            $field,
            array("$field{@}=={@}NEVER_REQUIRED"));
    }

    function addRequiredIfRule($element, $controllingElement, $values, $operator, $group = '')
    {
        //handle "!=" operator with multiple values in intuitive way (can never be false if handled strictly)
        //turn != with multiple values into: $value != $value1 && $value != value2 && ...
        if (is_array($values) && count($values) > 1 && $operator == '!=') {
            $rules = array_map(function ($value) use ($controllingElement, $operator) {
                return $controllingElement . "{@}" . $operator . "{@}" . $value;
            }, $values);
        } else {
            $rules = [$controllingElement . "{@}" . $operator . "{@}" . $values];
        }
        $this->XINRegisterRule(
            $element,
            $rules,
            "Required.",
            $group);

        // use Lorisform-native rules if not using XINRules
        //$this->form->addRule([$element, $controllingElement], 'Required', 'requiredIf', ['operator' => $operator, 'value' => $values]);
    }

    function addEnabledIfRule($element, $controllingElement, $values, $operator, $group = '')
    {
        //handle "!=" operator with multiple values in intuitive way (can never be false if handled strictly)
        //turn != with multiple values into: $value != $value1 && $value != value2 && ...
        if (is_array($values) && count($values) > 1 && $operator == '!=') {
            $rules = array_map(function ($value) use ($controllingElement, $operator) {
                return $controllingElement . "{@}" . $operator . "{@}" . $value;
            }, $values);
        } else {
            $rules = [$controllingElement . "{@}" . $operator . "{@}" . $values];
        }
        $this->registerEnabledIfRule(
            $element,
            $rules,
            "Required.",
            $group);
    }


    protected function registerEnabledIfRule($elname, $rules, $message="", $group="")
    {
        if (!is_array($rules)) {
            $rules_array[] = $rules;
        } else {
            $rules_array = $rules;
        }
        $this->EnabledIfRules[$elname]['message'] = $message;
        $this->EnabledIfRules[$elname]['group']   = $group;

        foreach ($rules_array AS $rule) {
            $this->EnabledIfRules[$elname]['rules'][] = $rule;
        }
        return true;
    }




    function addRules()
    {
        $this->addOptionalRules();
        $this->addRequiredIfRules();
        $this->addIntegerRangeRules();
        $this->addFloatRangeRules();
        $this->addNoFutureDateRules();
        $this->addEnabledIfRules();
    }

    function addRequiredIfRules()
    {
        if (isset($this->requiredIfs)) {
            foreach ($this->requiredIfs as $spec) {
                $this->addRequiredIfRule($spec[0], $spec[1], $spec[2], $spec[3], count($spec) > 4 ? $spec[4] : '');
            }
        }
    }

    //mimics XIN rules, but only used for enabling/disabling in javascript
    function addEnabledIfRules() {
        if (isset($this->enabledIfs)) {
            foreach ($this->enabledIfs as $spec) {
                $this->addEnabledIfRule($spec[0], $spec[1], $spec[2], $spec[3], count($spec) > 4 ? $spec[4] : '');
            }
        }
    }


    function addOptionalRules()
    {
        if (isset($this->optionals)) {
            foreach ($this->optionals as $spec) {
                $this->addOptionalRule($spec);
            }
        }
    }

    function addIntegerRangeRules()
    {
        if (isset($this->integerRanges)) {
            foreach ($this->integerRanges as $spec) {
                $this->addIntegerRangeRule($spec[0], $spec[1], $spec[2]);
            }
        }
    }

    function addFloatRangeRules()
    {
        if (isset($this->floatRanges)) {
            foreach ($this->floatRanges as $spec) {
                $this->addFloatRangeRule($spec[0], $spec[1], $spec[2]);
            }
        }
    }

    function addNoFutureDateRules()
    {
        if (isset($this->noFutureDates)) {
            foreach ($this->noFutureDates as $element) {
                $this->addNoFutureDateRule($element);
            }
        }
    }

    //needed for easily adding _status fields in tables (groups are used to define a row, and can't have nested groups so can't use the standard functions)
    function createStatus($baseName)
    {
        return $this->createSelect(
            $baseName . "_status",
            null,
            array(
                null => "",
                'not_answered' => "Not Answered",
            ),
            array('class' => 'form-control input-sm not-answered')  //TODO: correct styling??
        );
    }

    function addHeaderRow($titles)
    {
        if (count($titles) > 0) {
            $elements = [];
            foreach (array_slice($titles, 1) as $title) {
                $elements[] = $this->form->createElement('static', null, null, $title);
            }
            if (count($elements) > 0) {
                $this->addGroup($elements, 'header_group' . $this->headerGroupIndex++, $titles[0], ' ');  //headerGroupIndex ensures uniquely-named
            }
        }
    }

    /**
     * NOTE: copied from addHourMinElement and modified to remove unusual options (DNK, etc.)
     * Wrapper to create an Hour/Minute field, with an accompanying status field.
     *
     * @param string $field Name given to the HTML QuickForm Element
     *                             being created
     * @param string $label The question text to display
     * @param array $rules Additional rules to apply to the element
     *                             being added,{@} delimited
     * @param string $rule_message Message to display upon rule violation.
     *
     * @return none
     */
    function addHourMinElementEx(
        $field,
        $label,
        $rules = array(),
        $rule_message = null
    )
    {
//        if ($rule_message === null) {
//            $rule_message = "You are required to select a status "
//                . "if you want to leave this time blank.";
//        }

        $this->form->addTime(
            $field,
            $label,
            array('class' => 'form-control input-sm')
        );

//        $group[] = $this->createSelect(
//            $field . "_status",
//            "",
//            array(
//                null => '',
//                'not_answered' => 'Not Answered',
//            )
//        );
//        $this->addGroup($group, $field . "_group", $label, null, false);
        if ($rules) {
            $this->XINRegisterRule(
                $field,
                $rules,
                $rule_message
            );
        }
        //unset($group);
    }


    /**
     * Wrapper to create a field that only accepts a number, with an
     * accompanying status field.
     *
     * @param string $field The database field in which the response
     *                         will be stored
     * @param string $label The question text to display
     * @param unknown $options Does not appear to be used?
     *
     * @return none
     */
    function addNumericElementEx($field, $label, $rules = array(), $rule_message = null)
    {
//        if ($rule_message === null) {
//            $rule_message = "You are required to select a status "
//                . "if you want to leave this field blank.";
//        }

        //$group[] = $this->createText($field, $label);
        $this->form->addText($field, $label, array('class' => 'form-control input-sm'));
        //$this->WrapperNumericElements[$field] = $group[0];
//        $group[] = $this->createSelect(
//            $field . "_status",
//            null,
//            array(
//                null => "",
//                'not_answered' => "Not Answered",
//            ),
//            array('class' => 'form-control input-sm not-answered')
//        );
//        $this->addGroup($group, $field . "_group", $label, null, false);
//        unset($group);
//        $this->addGroupRule(
//            $field . "_group",
//            array(array(array("Value must be numeric.", 'numeric')))
//        );
        $this->addRule($field, 'Value must be numeric.', 'numeric');
        if ($rules) {
            $this->XINRegisterRule(
                $field,
                $rules,
                $rule_message
            );
        }
    }

    /**
     * Adds a date group with a status box and appropriate rule
     * Note: $this->dateOptions must be defined by the subclass calling this
     * wrapper function
     *
     * @param string $name Name prepended to the HTMLQuickform element
     * @param string $label Element label
     * @param array $options optional override of class's dateOptions
     *
     * @return none
     */
    function addDateElementEx($name, $label, $dateOptions = null, $rules = array(), $rule_message = null)
    {
//        if ($rule_message === null) {
//            $rule_message = "You are required to select a status "
//                . "if you want to leave this field blank.";
//        }

        if ($dateOptions === null) {
            $dateOptions = $this->dateOptions;
        }

        $this->form->addDate(
            $name . "_date",
            $label,
            $dateOptions,
            array(
                'class' => 'form-control input-sm ' . $name . "_date",
                'style' => 'max-width:33%; display:inline-block;',
            )
        );
        //$this->WrapperDateWithStatusElements[$name . "_date"] = $group[0];
        if (!in_array($name . "_date", $this->dateTimeFields)) {
            $this->dateTimeFields[] = $name . "_date";
        }

//        $group[] = $this->createSelect(
//            $name . "_date_status",
//            null,
//            array(
//                null => "",
//                'not_answered' => "Not Answered",
//            ),
//            array('class' => 'form-control input-sm not-answered')
//        );

//        $this->addGroup(
//            $group,
//            $name . "_date_group",
//            $label,
//            $this->_GUIDelimiter,
//            false
//        );

        unset($group);
        if ($rules) {
            $this->XINRegisterRule(
                $name . "_date",
                $rules,
                $rule_message
            );
        }
    }

    function addHiddenFieldFromDB($hiddenFieldName, $sourceTable, $sourceField)
    {
        //get field value from DB
        $db = \Database::singleton();

        $value = $db->pselectOne("select $sourceTable.$sourceField from session 
                inner join flag on flag.SessionID = session.ID 
                inner join $sourceTable on $sourceTable.CommentID = flag.CommentID
                where session.CandID = :CandidateID and flag.Test_name = '$sourceTable' and flag.CommentID not like 'DDE_%'", ['CandidateID' => $this->getCandID()]);

        $this->addHidden($hiddenFieldName, $value);
    }

    //for handling enabled/disable client-side based on XIN validation rules
    function getJSDependencies()
    {
        $factory = \NDB_Factory::singleton();
        $baseURL = $factory->settings()->getBaseURL();
        $deps = parent::getJSDependencies();
        return array_merge(
            $deps,
            array(
                $baseURL . "/instrument_helper/js/XINRules.js",  //urlrewrite will use GetJS.php to map to /project/modules/<modulename>/js...
            )
        );
    }

    function getVisitLabel() {
        $timepoint = TimePoint::singleton($this->getSessionID());
        return $timepoint->getVisitLabel();
    }

    function getCandID()
    {
        $db = Database::singleton();

        return $db->pSelectOne("select session.CandID from session 
                inner join flag on flag.SessionID = session.ID 
                where flag.CommentID = :CommentID", ['CommentID' => $this->getCommentID()]);
    }

    function getSiteId() {
        $db = Database::singleton();

        $centerID = $db->pselectOne(
            "SELECT session.CenterID FROM session, flag
            WHERE session.ID=flag.SessionID AND flag.CommentID=:cmnt_id",
            array('cmnt_id' => $this->getCommentID())
        );

        return $centerID;
    }

    //for handling enabled/disable client-side based on XIN validation rules
    function outputXINRules()
    {
        $rulesJs = json_encode($this->EnabledIfRules ?? new \stdClass);
        $script = 'var validationRules = ' . $rulesJs . ';';
        $this->form->addStatic(null, '<script type="text/javascript">' . $script . '</script>');
    }

    function _saveValues($values)
    {
        //set unsubmitted fields to blank to handle fields disabled by XIN RequiredIf-type validator
        foreach ($this->form->form as $elementOrGroup) {
            if ($elementOrGroup['type'] == 'group') {
                $elements = $elementOrGroup['elements'];
            } else {
                $elements = [$elementOrGroup];
            }
            foreach ($elements as $element) {
                if (isset($element['name']) && !array_key_exists($element['name'], $values) && !in_array($element['type'], ['header', 'static', 'file'])) {
                    $values[$element['name']] = '';
                }
            }
        }

        //  remove fields ending in ___cached_value
        foreach (array_keys($values) as $key) {
            if (preg_match('/___cached_value$/', $key)) {
                unset($values[$key]);
            }
        }

        //parent::_saveValues($values);

        //  Following chunk copied from NDB_BVL_Instrument::_saveValues to prevent trying to save CandidateAge, which we don't use
        //Convet date/timestamps into database format
        if (empty($this->dateTimeFields)) {
            $this->dateTimeFields = array("Date_taken");
        }

        //not needed, causes an error
//        if (strrpos($this->testName, "_proband") === false) {
//            $this->_saveCandidateAge($values);
//        }

        //Convert select multiple elements into database storable values
        if (!empty($this->_selectMultipleElements)) {
            foreach ($this->_selectMultipleElements AS $elname) {
                if (isset($values[$elname]) && is_array($values[$elname])) {
                    $values[$elname] = implode("{@}", $values[$elname]);
                }
            }
        }

        //XIN specific functionality
        if ($this->formType == "XIN") {
            $this->_nullStatus($values);
        }

        // do not alter this when overwriting the method
        unset(
            $values['candID'],
            $values['sessionID'],
            $values['commentID'],
            $values['test_name'],
            $values['page'],
            $values['fire_away'],
            $values['subtest']
        );
        // nor these -- these ones are for direct data entry
        unset($values['key'], $values['nextpage'], $values['pageNum']);
        $this->_save($values);

        //end of copy from NDB_BVL_Instrument::_saveValues
    }


    //overrides \NDB_BVL_Instrument::addYesNoElement to remove the not_answered option
    function addYesNoElement(
        $field,
        $label,
        $rules = array(),
        $rule_message = 'This field is required.'
    )
    {
        $this->addSelect(
            $field,
            $label,
            array(
                null => '',
                'yes' => 'Yes',
                'no' => 'No',
            )
        );

        if (!empty($rules)) {
            $this->XINRegisterRule($field, $rules, $rule_message);
        }
    }


    //overrides \NDB_BVL_Instrument::addDateElement to remove the grouped not_answered dropdown
    function addDateElement($name, $label, $options = null)
    {
        if ($options === null) {
            $options = $this->dateOptions;
        }

//        $group[] = $this->createDate(
//            $name . "_date",
//            $label,
//            $options,
//            array(
//                'class' => 'form-control input-sm '.$name."_date",
//                'style' => 'max-width:33%; display:inline-block;',
//            )
//        );
        //$this->WrapperDateWithStatusElements[$name . "_date"] = $group[0];

        $this->form->addDate(
            $name . "_date",
            $label,
            $options,
            array(
                'class' => 'form-control input-sm ' . $name . "_date",
                'style' => 'max-width:33%; display:inline-block;',
            )
        );

        if (!in_array($name . "_date", $this->dateTimeFields)) {
            $this->dateTimeFields[] = $name . "_date";
        }

//        $group[] = $this->createSelect(
//            $name . "_date_status",
//            null,
//            array(
//                null           => "",
//                'not_answered' => "Not Answered",
//            ),
//            array('class' => 'form-control input-sm not-answered')
//        );

//        $this->addGroup(
//            $group,
//            $name . "_date_group",
//            $label,
//            $this->_GUIDelimiter,
//            false
//        );

        //unset($group);
//        $this->XINRegisterRule(
//            $name . "_date",
//            array($name . "_date_status{@}=={@}"),
//            "A Date, or Not Answered is required.",
//            $name . "_date_group"
//        );
    }


    //overrides \NDB_BVL_Instrument::addTextElement to remove the grouped not_answered dropdown
    function addTextElement(
        $field,
        $label,
        $rules = array(),
        $rule_message = 'Required.',
        $refusals = array()
//            ''             => '',
//            'not_answered' => 'Not Answered',
//        )
    )
    {
        //$group[] =
        $this->form->addText($field, $label, array('class' => 'form-control input-sm'));
        //$this->WrapperTextElements[$field] = $group[0];
        //$group[] = $this->createSelect(
//            $field."_status",
//            "",
//            $refusals,
//            array('class' => 'form-control input-sm not-answered')
//        );

//        $this->addGroup($group, $field.'_group', $label, null, false);
//        unset($group);
        //$rules_array = array_merge(array($field.'_status{@}=={@}'), $rules);
        if ($rules) {
            $this->XINRegisterRule($field, $rules, $rule_message);
        }
    }


    //overrides \NDB_BVL_Instrument::addTextAreaElement to remove the grouped not_answered dropdown
    function addTextAreaElement(
        $field,
        $label,
        $rules = array(),
        $rule_message = 'This field is required.'
    )
    {
        //$group[] =
        $this->form->addElement(
            "textarea",
            $field,
            $label,
            array(
                'cols' => 25,
                'rows' => 4,
                'class' => 'form-control',
            )
        );
        //$this->WrapperTextElements[$field] = $group[0];
//        $group[] = $this->createSelect(
//            $field."_status",
//            "",
//            array(
//                null           => '',
//                'not_answered' => 'Not Answered',
//            ),
//            array('class' => 'form-control input-sm not-answered')
//        );
//        $this->addGroup($group, $field.'_group', $label, null, false);
//        unset($group);
        //$rules_array = array_merge(array($field.'_status{@}=={@}'), $rules);
        if ($rules) {
            $this->XINRegisterRule(
                $field,
                $rules,
                $rule_message
            );
        }
    }


    function getICFDate()
    {
        $candID = $this->getCandID();

        $db = Database::singleton();
        return $db->pselectOne(
            "select informed_consent.signed_date_date from session
                inner join flag on flag.SessionID = session.ID
                inner join informed_consent on informed_consent.CommentID = flag.CommentID
                where informed_consent.CommentID not like 'DDE_%' and session.CandID = :CandID",
            array('CandID' => $candID)
        );
    }

    function getICFDateTime()
    {
        $candID = $this->getCandID();

        $db = Database::singleton();
        return $db->pselectOne(
            "select concat(informed_consent.signed_date_date,' ',informed_consent.signed_time) from session
                inner join flag on flag.SessionID = session.ID
                inner join informed_consent on informed_consent.CommentID = flag.CommentID
                where informed_consent.CommentID not like 'DDE_%' and session.CandID = :CandID",
            array('CandID' => $candID)
        );
    }


    function checkICF()
    {
        $candID = $this->getCandID();

        if (!$candID) {
            return true;  //if no CandID, prob. running lorisform_parser
        }

        $db = Database::singleton();
        $data = $db->pselect(
            "select CandID, informed_consent.signed from session
                inner join flag on flag.SessionID = session.ID
                inner join informed_consent on informed_consent.CommentID = flag.CommentID
                where informed_consent.CommentID not like 'DDE_%' and session.CandID = :CandID",
            array('CandID' => $candID)
        );

        if (count($data) == 0) {
            return false;
        }
        return $data[0]['signed'] == 'yes';
    }

    function _addMetadataFields()
    {
        //copy-modified from NDB_BVL_Instrument for our particular needs
        $config =& NDB_Config::singleton();

        $dateOptions = array(
            'language' => 'en',
            'format' => 'YMd',
            //'minYear' => $config->getSetting('startYear'),
            //'maxYear' => $config->getSetting('endYear'),
            'addEmptyOption' => true,
            'emptyOptionValue' => null,
        );

        $this->dateOptions = $dateOptions;

        $this->addBasicDate('Date_taken', 'Date of Assessment', $dateOptions);

        $this->addRule(
            'Date_taken',
            'Date of Assessment is required',
            'required'
        );

        //ensure date_taken is >= ICF date
        //not needed here
        //$this->addRuleDateNotBeforeICFDate('Date_taken');
    }

    function addRuleDateNotBeforeICFDate($element)
    {
        $this->form->addFormRule(function ($values) use ($element) {
            $value = trim($values[$element]);
            if ($value != '' && $this->isValidIncompleteDate($value)) {
                $icf_date = $this->getICFDate();
                if (new \DateTime($value) < new DateTime($icf_date)) {
                    return [$element => "Date cannot be before Informed Consent Form signature date."];
                }
            }
        });
    }

    function addRuleDateTimeNotBeforeICFDateTime($date_element, $time_element)
    {
        $this->form->addFormRule(function ($values) use ($date_element, $time_element) {
            $date_value = trim($values[$date_element]);
            $time_value = trim($values[$time_element]);
            $date_time_value = trim($date_value . ' ' . $time_value);
            if ($date_value != '' && $time_value != '' && strtotime($date_time_value) !== false) {
                $icf_date_time = $this->getICFDateTime();
                if (strtotime($icf_date_time) !== false && new \DateTime($date_time_value) < new DateTime($icf_date_time)) {
                    return [$date_element => "Date and time cannot be before Informed Consent Form signature date-time."];
                }
            }
        });
    }


    function addWarningMessage($message)
    {
        if ($this->tpl_data['warning_message']) {
            $this->tpl_data['warning_message'] .= '<br>';
        }
        $this->tpl_data['warning_message'] .= $message;

    }

    function addConfirmationField($name, $label, $values)
    {
        $this->tpl_data['confirmation_field'] = ['label' => $label, 'name' => $name, 'checked' => !empty($values[$name])];
        //make the confirmation field Required
        if (empty($values[$name])) {
            return [$name => 'Must confirm or change answers to comply.'];
        }
    }

    function AddICFOrInactiveWarning()
    {
        $participantIsActive = FSG_Utility::get_candidate_status($this->getCandID()) == FSG_Utility::participant_status_active;

        if (!$participantIsActive) {
            $this->addWarningMessage('Participant is not Active.');
        }
        if (!$this->checkICF()) {
            $this->addWarningMessage('Informed consent must be indicated before filling out this form.');
        }

    }

}