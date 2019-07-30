<?php
/**
 * The forms for the start next stage menu
 *
 * PHP Version 5
 *
 * @category Test
 * @package  Main
 * @author   Ted Strauss <ted.strauss@mcgill.ca>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://github.com/aces/Loris
 */
/**
 * The forms for the start next stage menu
 *
 * PHP Version 5
 *
 * @category Test
 * @package  Main
 * @author   Ted Strauss <ted.strauss@mcgill.ca>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://github.com/aces/Loris
 */
class NDB_Form_Next_Stage extends NDB_Form
{
    /**
     * Tie the access to a data_entry permission
     *
     * @return bool true if they have access to this page
     */
    function _hasAccess()
    {
        // create user object
        $user =& User::singleton();

        $timePoint =& TimePoint::singleton($this->identifier);

        // check user permissions
        if (!$user->hasPermission('data_entry')
            || !in_array(
                $timePoint->getData('CenterID'),
                $user->getData('CenterIDs')
            )
        ) {
            return false;
        }
        return $timePoint->isStartable();
    }

    /**
     * Processes the values and saves to database
     *
     * @param array $values form values
     *
     * @return void
     */
    function _process($values)
    {
        $timePoint =& TimePoint::singleton($this->identifier);

        // figure out what the next stage should be
        $newStage = $timePoint->getNextStage();

        // start that stage
        $timePoint->startStage($newStage);

        // set the date for the new stage
        $timePoint->setData("Date_".$newStage, $values['date1']);

        // set SubprojectID if applicable
        if (isset($values['SubprojectID'])) {
            $timePoint->setData('SubprojectID', $values['SubprojectID']);
        }

        // set scan done if applicable
        if (isset($values['scan_done'])) {
            $timePoint->setData('Scan_done', $values['scan_done']);
        }

        // create a new battery object && new battery
        $battery   = new NDB_BVL_Battery;
        $candidate =& Candidate::singleton($timePoint->getCandID());

        $firstVisit = false;
         //get first visit for candidate
        $vLabel = $candidate->getFirstVisit();
         //if current visit label is same as
         // visit label returned must be first visit
        if ($vLabel ==  $timePoint->getVisitLabel()) {
            $firstVisit = true;
        }

         // select a specific time point (sessionID) for the battery
        $battery->selectBattery($timePoint->getData('SessionID'));

        // add instruments to the time point (lower case stage)
        $battery->createBattery(
            $timePoint->getSubprojectID(),
            $newStage,
            $timePoint->getVisitLabel(),
            $timePoint->getCenterID(),
            $firstVisit
        );

        //------------------------------------------------------------

        $this->tpl_data['success']   = true;
        $this->tpl_data['sessionID'] = $this->identifier;
        $this->tpl_data['candID']    = $timePoint->getCandID();

    }
    /**
     * Next stage function
     *
     * @return void
     */
    function next_stage()// @codingStandardsIgnoreLine 
    {
        $timePoint =& TimePoint::singleton($this->identifier);
        $config    =& NDB_Config::singleton();

        $study       = $config->getSetting('study');
        $dateOptions = array(
                        'language'       => 'en',
                        'format'         => 'YMd',
                        'addEmptyOption' => true,
                        'minYear'        => $study['startYear'],
                        'maxYear'        => $study['endYear'],
                       );

        $this->addHidden('candID', $timePoint->getData('CandID'));
        $this->addHidden('sessionID', $timePoint->getData('SessionID'));

        $stage = $timePoint->getNextStage();
        $this->tpl_data['stage'] = $stage;

        // add form elements
        if ($stage == 'Visit' && $config->getSetting('useScanDone')!='false') {
            $this->addSelect(
                'scan_done',
                'Scan Done',
                array(
                 null => null,
                 'Y'  => 'Yes',
                 'N'  => 'No',
                )
            );
            $this->addRule('scan_done', 'Scan done is required', 'required');
        }

        $dateAttributes = ['class' => 'form-control input-sm input-date'];

        // add dates
        $this->addBasicDate(
            'date1',
            "Date of $stage",
            $dateOptions,
            $dateAttributes
        );
//        $this->addBasicDate(
//            'date2',
//            "Retype Date of $stage",
//            $dateOptions,
//            $dateAttributes
//        );

        // let user select subproject *only* if subprojectid is not > 0
        if (!($timePoint->getSubprojectID() > 0)) {
            $list_of_objectives =& Utility::getSubprojectList();
            $this->addSelect(
                'SubprojectID',
                'Objective',
                array('' => '') + $list_of_objectives
            );
            $this->addRule('SubprojectID', 'Required', 'required');
        }

        // add date rules
        $this->addRule('date1', 'Date is required', 'required');
//        $this->addRule(array('date1', 'date2'), 'Date fields must match', 'compare');

        // no future date
        $this->addNoFutureDateRule('date1');

        //later than first visit, but only if we're not on the first visit
        $this->form->addFormRule(array(&$this, 'validateVisitDate'));

        $this->addRule('date1', 'Date is required', 'required');

        $this->form->addFormRule(array(&$this, '_validate'));
    }
    /**
     * Validate function
     *
     * @param string $values the value
     *
     * @return string
     */
    function _validate($values)
    {
        $config =& NDB_Config::singleton();

        $timePoint =& TimePoint::singleton($this->identifier);
        $candID    = $timePoint->getCandID();

        $candidate =& Candidate::singleton($candID);

        $errors = array();
        // check date pairs
        if (empty($values['date1'])) {
            $errors['date1'] .= "Date is required. \n";
        } elseif (!Utility::_checkDate($values['date1'])) {
            $errors['date1'] .= "Date is not a valid date. \n";
        }

//        if ($values['date1'] != $values['date2']) {
//            $errors['date1'] .= "Both Date fields must match. \n";
//        }

        // get candidate's DOB or EDC according to SubprojectID
        $candidateBirthDate = $timePoint->getEffectiveDateOfBirth();

        //Determine the next stage, and validate accordingly
        $stage = $timePoint->getNextStage();
        if ($stage == 'Visit') {
            // compare the dates date of MRI
            // must be > DOB - ONLY WHEN starting Visit stage
            $date = $values['date1'];

            if (empty($values['scan_done'])
                && $config->getSetting('useScanDone')!='false'
            ) {
                $errors['scan_done'] = 'Scan done is required';
            }
            if ($config->getSetting('useScreening')=="true"
                && $config->getSetting('screeningAfterVisit')!="true"
                && strcmp($date, $timePoint->getData('Date_screening')) < 0
            ) {
                $errors['date1'] .= "Date of Visit is less than".
                                    " Date of Screening. \n";
            }
            if ($config->getSetting('allowPrenatalTimepoints')!="true"
                && strcmp($date, $candidateBirthDate) < 1
            ) {
                $errors['date1'] .= "Date of Visit is less than ".
                                    "Date of Birth/EDC. \n";
            }
        }

        if (empty($errors)) {
             return true;
        }
        return $errors;
    }


    //ncote: copied from FSG_BVL_Instrument
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

    function validateVisitDate($values)
    {
        $visitDate = trim($values['date1']);
        $timePoint = TimePoint::singleton($this->identifier);
        $candidate = Candidate::singleton($timePoint->getCandID());



        $firstVisitId = $candidate->getVisitV01Id();
        if (!$firstVisitId || $timePoint->getSessionID() === $firstVisitId) {
            return;
        }


        //get visit V01
        $firstTimePoint = TimePoint::singleton($firstVisitId);
        $firstVisitDate = $firstTimePoint->getDateOfVisit();
        //our date must greater than this
        if ($visitDate != '' && $this->isValidDate($visitDate)) {
            if (new \DateTime($visitDate) <= new DateTime($firstVisitDate)) {
                return ['date1' => "Date of visit must be greater than the date of the first visit: " . $firstVisitDate];
            }
        }
    }

}
?>
