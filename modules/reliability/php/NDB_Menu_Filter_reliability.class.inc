<?php
require_once 'NDB_Menu_Filter.class.inc';
require_once 'Utility.class.inc';
/**
 * The menu for the reliability checking
 * @package mri
 * @subpackage NIHPD
 */

function map_cIDs($array){
    $new_array;
    for($i = 0; $i < count($array); $i++){
      $element = $array[$i];
      $new_array[$element['CommentID']] = $element['reliability_center_id'];
    }
    return $new_array;
}

function find_cID($cID, $array){
  if(empty($array)){
    return false;
  }
  foreach($array as $key=>$value){
    if($key == $cID){
      return true;
    }
  }
  return false;
}

function array_remove($item, $array){
  $index = array_search($item, $array);
  if($index === false){
    return $array;
  }else{
    unset($array[$index]);
    return array_values($array); 
  }
}
 
class NDB_Menu_Filter_reliability extends NDB_Menu_Filter
{

    var $centerIDMap;
    
    var $site_id = array('SEA' => 2, 'PHI' => 3, 'STL' => 4, 'UNC' => 5, 'UofA' => 6);
    
    var $reliability_table;

    function _hasAccess() {
        $user =& User::singleton();
        if(Utility::isErrorX($user)) {
            return PEAR::raiseError("User Error: ".$user->getMessage());
        }
        if($user->hasPermission('access_all_profiles') || $user->hasPermission('reliability_edit_all')) {
            return true;
        }
        return false;
    }
    function _setupVariables()
    {
        $user =& User::singleton();
        if(Utility::isErrorX($user)) {
            return PEAR::raiseError("User Error: ".$user->getMessage());
        }

        // create the centerID map
        $db =& Database::singleton();
        $pscRows = array();
        $pscRows = $db->pselect("SELECT CenterID, Name FROM psc");
        foreach($pscRows AS $row) {
            $this->centerIDMap[$row['CenterID']] = $row['Name'];
        }
        
        $this->_populate_reliability_table();

        // the base query
        if(isset($_REQUEST['EARLI']) && $_REQUEST['EARLI'] == 1) {
            $extra_where = " AND EARLI_Candidate='yes'";
        } else {
            $extra_where = " AND EARLI_Candidate='no'";
        }
        $query = " FROM candidate, session, flag, reliability WHERE reliability.CommentID=flag.CommentID AND candidate.CandID=session.CandID AND session.ID=flag.SessionID $extra_where";

        // only view their own profiles, unless they have permission to see all
        if (!($user->hasPermission('reliability_edit_all') || $user->hasPermission('access_all_profiles'))) {
            $query .= " AND candidate.centerID = '" . $user->getData('CenterID') . "' "; 
        }

        // set the class variables
        $this->columns = array('reliability.CommentID', 'candidate.PSCID', 'reliability.reliability_center_id AS Site', 'session.SubprojectID as Cohort', 'session.CandID AS DCCID', 'candidate.Gender', 'session.Visit_label', 'reliability.Instrument', 'reliability.Reliability_score', 'session.Current_stage', 'reliability.invalid', 'reliability.Manual_Swap');

        $this->query = $query;
        $this->group_by = '';
        $this->order_by = 'reliability.Instrument, session.CandID, session.Visit_label';
        $this->headers = array('PSCID', 'reliability_center_id','Cohort', 'DCCID', 'Gender', 'Visit_label', 'Instrument', 'reliability_score', 'Reliable');
        $this->validFilters = array('reliability.reliability_center_id', 'session.SubprojectID', 'candidate.CenterID', 'session.CandID', 'candidate.PSCID', 'candidate.Gender', 'session.Visit_label', 'reliability.Instrument', 'reliability.Reliability_score', 'session.Current_stage', 'reliability.invalid','candidate.ProjectID');

        $this->formToFilter = array(
                                    'SubprojectID' => 'session.SubprojectID',
                                    'CenterID' => 'candidate.CenterID',
                                    'reliability_center_id'=> 'reliability.reliability_center_id',
                                    'DCCID' => 'candidate.CandID',
                                    'PSCID' => 'candidate.PSCID',
                                    'Gender' => 'candidate.Gender',
                                    'Visit_label' => 'session.Visit_label',
                                    'Instrument' => 'reliability.Instrument',
                                    'reliability_score'=>'reliability.Reliability_score',
                                    'Current_stage'=>'session.Current_stage',
                                    'Invalid' => 'reliability.invalid',
                                    'ProjectID'=>'candidate.ProjectID'
                                    // 'Lock_record' => 'session.Lock_record'
                                    );
        return true;
    }


    function _setFilterForm()
    {
    	// create user object
        $user =& User::singleton();
        if(Utility::isErrorX($user)) {
            return PEAR::raiseError("User Error: ".$user->getMessage());
        }

           // allow to view all sites data through filter
        if ($user->hasPermission('access_all_profiles') || $user->hasPermission('reliability_edit_all')) {
            // get the list of study sites - to be replaced by the Site object
            $list_of_sites = Utility::getSiteList(false);
            if(Utility::isErrorX($list_of_sites)) {
                return PEAR::raiseError("DB Error: ".$list_of_sites->getMessage());
            }
            if(is_array($list_of_sites)) 
            {
                // This doesn't work, it causes all the indexes to change
                // and the index is supposed to be the CenterID number
                // $list_of_sites = array_merge(array('' => 'Any'), $list_of_sites);

                // So instead, manually iterate through and set everything
                // in a new array
                $new_list = array('' => 'Any');
                foreach($list_of_sites as $key => $val) {
                    $new_list[$key] = $val;
                }
                $list_of_sites = $new_list;
            }
        }
        else {
            // allow only to view own site data
            $site =& Site::singleton($user->getData('CenterID'));
            if (Utility::isErrorX($site)) {
                return PEAR::raiseError("DB Error: ".$site->getMessage());
            }
            //if ($site->isStudySite()) {
                $list_of_sites = array($user->getData('CenterID') => $user->getData('Site'));
            //}
        }
        
        /// hack for Visit Labels... maybe get all the real visit labels from DB?
        $list_of_visit_labels = array(null=>'Any','V06'=>'V06','V12'=>'V12','V24'=>'V24','V36'=>'V36');
        $list_of_visit_labels_only = array('V06'=>'V06','V12'=>'V12','V24'=>'V24','V36'=>'V36');
        $subproject_options = Utility::getSubprojectList();
        $subproject_options = array(null=>'Any') + $subproject_options;
        $gender_options = array(null=>'Any', 'Male'=>'Male', 'Female'=>'Female');
        $list_of_instruments = array(null=>'Any', 'csbs'=>'CSBS', 'adi_r'=>'ADI-R', 'ados'=>'ADOS', 'aosi' => 'AOSI',
                                     'aims'=>'AIMS','ados2_module1'=>'ADOS2 Module1','ados2_module2'=>'ADOS2 Module2');
        $list_of_instruments_only = array('csbs'=>'CSBS', 'adi_r_proband'=>'ADI-R (Proband)', 'adi_r_subject' => 'ADI-R (Subject)', 'ados_module1'=>'ADOS (Module 1)', 'ados_module2' => 'ADOS (Module 2)', 'aosi' => 'AOSI', 'ados2_module1'=>'ADOS2 (Module 1)','ados2_module2'=>'ADOS2 (Module2)');
        $lock_options = array(null=>'','Locked'=>'Locked','Unlocked'=>'Unlocked');
        $list_of_projects =& Utility::getProjectList();

        // Form Elements
        $this->addSelect('SubprojectID','Subproject:', $subproject_options);
        $this->addSelect('CenterID', 'Site:', $list_of_sites);
        $this->addSelect('reliability_center_id', 'Site of Reliability:', $list_of_sites);
        $this->addBasicText('DCCID', 'DCCID:', array("size"=>9, "maxlength"=>6));
        $this->addBasicText('PSCID', 'PSCID:', array("size"=>9, "maxlength"=>7));
        $this->addSelect('Gender', 'Gender:', $gender_options);
        $this->addSelect('Visit_label', 'Visit Label:', $list_of_visit_labels);
        $this->addSelect('Instrument', 'Instrument:', $list_of_instruments);
        $this->addSelect('Invalid', 'Invalid Candidate:', array('' => '', 'yes' => 'Yes', 'no' => 'No'));
        $config=&NDB_Config::singleton();
        if($config->getSetting("useProjects")=="true"){
           $this->addSelect('ProjectID', 'Project:', array('' => 'All') + $list_of_projects);
        }

	 // $this->addSelect('Lock_record', 'Lock_record:', $lock_options);
       
       // For swapping candidates
        if ($user->hasPermission('reliability_swap_candidates')) {
            $this->tpl_data['reliability_swap_candidates'] = true;
            $this->addSelect('Cand1Visit_label', 'Visit Label:', $list_of_visit_labels_only);
            $this->addBasicText('Cand1PSCID', 'PSCID:');
            $this->addSelect('Cand2Visit_label', 'Visit Label:', $list_of_visit_labels_only);
            $this->addBasicText('Cand2PSCID', 'PSCID:');
            $this->addSelect('SwapInstrument', 'Instrument:', $list_of_instruments_only);
        } else {
            $this->tpl_data['reliability_swap_candidates'] = false;
        }

        if ($user->hasPermission('data_entry')) {
            $this->tpl_data['IBIS_Access'] = true;
        } else {
            $this->tpl_data['IBIS_Access'] = false;
        }
        if ($user->hasPermission('EARLI_Reliability')) {
            $this->tpl_data['EARLI_Reliability'] = true;
            $this->addBasicText('AddPSCID', 'PSCID:');
            $this->addSelect('AddVisit_label', 'Visit Label:', array_merge(array('' => 'Any'), $list_of_visit_labels_only));
            $this->addSelect('AddReliabilityCenter', 'Site of Reliability:', $list_of_sites);
            $this->addSelect('AddInstrument', 'Instrument:', array_merge(array('' => 'Any'), $list_of_instruments_only));
        } else {
            $this->tpl_data['EARLI_Reliability'] = false;
        }

        // Doing this here is a hack. Since this is a menu filter and not a Form, there's no 
        // _process/_save functions automagically called. There should probably be something like
        // a Menu_Filter_Form base class for instances like this or the conflict resolver, but as
        // things stand you either need to work with the $_POST array/DB directly in a Menu_Filter,
        // or rewrite/imitate the Menu_Filter in an NDB_Form. -- Dave
        $swap = isset($_POST['swap']) ? $_POST['swap'] : '';
        if($swap == 'Swap Candidates' || $swap == 'swap') {
            $message = $this->_swap_candidates();
            if(isset($message['error'])) {
                $this->form->addElement('static', 'error', $message['error']);
            }
            if(isset($message['message'])) {
                $this->form->addElement('static', 'message', $message['message']);
            }
        } else if($swap == "Add Candidate" || $swap == 'addnew') {
            $message = $this->_addCandidate();
            if(isset($message['error'])) {
                $this->form->addElement('static', 'error', $message['error']);
            }
            if(isset($message['message'])) {
                $this->form->addElement('static', 'message', $message['message']);
            }
        }
        return true;
    }

    // This is used both by setDataTableRows, and reliability statistics
    function getThreshholds() {
        //return array("adi_r_proband" => 90, "adi_r_subject" => 90, "adi_r" => 90, 'aosi' => 78.9, 'csbs' => 80, 'ados_module1' => 80, 'ados_module2' => 80);
        $config =& NDB_Config::singleton();
        $reliabilityConfig = $config->getSetting("ReliabilityInstruments");
        $threshold = array();
           
        foreach(Utility::toArray($reliabilityConfig) AS $reliabilityInstrument){
             $instrument_list = $reliabilityInstrument['Instrument'];
             foreach($instrument_list AS $instrument){
                 $threshold[$instrument['Testname']] = $instrument['Threshold'];
             }
        }
        return $threshold;
        //return array("adi_r_proband" => 89.5, "adi_r_subject" => 89.5, "adi_r" => 89.5, 'aosi' => 78.0, 'csbs' => 79.5, 'ados_module1' => 79.5, 'ados_module2' => 79.5);
    }
    function _setDataTableRows($count)
    {

        $threshold = $this->getThreshholds();
        // print out
        $x = 0;
        foreach ($this->list as $item) {
            //count column
            $this->tpl_data['items'][$x][0]['value'] = $x + $count;

            //print out data rows
            $i = 1;
            // $identifier = $item['Tracking_log_ID'];
            $comment_id = $item['CommentID'];
            $site_id = $item['Site'];
            $current_stage = $item['Current_stage'];
            $invalid = $item['invalid'];
            $manual= $item['Manual_Swap'];
            if($item['Manual_Swap'] == 'yes' && $item['invalid'] == 'yes') {
                continue;
            }
            foreach ($item as $key => $val) {

                // Confused about this line
                if ($key =='Tracking_log_ID') continue;
                if ($key == 'CommentID') continue;
                if ($key == 'Current_stage') continue;
                if ($key == 'invalid') continue;
                if ($key == 'Manual_Swap') continue;
                // {
                //                    $this->tpl_data['items'][$x][$i]['CommentID'] = $item['CommentID'];
                //               $this->tpl_data['items'][$x][$i]['Instrument'] = $item['Instrument'];
                //                   }
                $this->tpl_data['items'][$x][$i]['name'] = $key;
                $this->tpl_data['items'][$x][$i]['value'] = $val;
                if ($key == 'PSCID'){
                   $this->tpl_data['items'][$x][$i]['CommentID'] = $comment_id;
                   $this->tpl_data['items'][$x][$i]['SiteID'] = $item['Site'];
                   $this->tpl_data['items'][$x][$i]['Instrument'] = $item['Instrument'];
                   $this->tpl_data['items'][$x][$i]['Current_stage'] = $current_stage;
                   $this->tpl_data['items'][$x][$i]['invalid'] = $invalid;
                   $this->tpl_data['items'][$x][$i]['manual'] = $manual;
                }
                if ($key == 'Site')
                {
                   $this->tpl_data['items'][$x][$i]['value'] = $this->centerIDMap[$item['Site']];
                }
                if($key == 'Reliability_score'){
                  $this->tpl_data['items'][$x][$i+1]['name'] = 'Reliability';
                  if(is_null($val))
                    $reliable = null;
                  else if($val >= $threshold[$item['Instrument']])
                    $reliable = 'Yes';
                  else
                    $reliable = 'No';
                  $this->tpl_data['items'][$x][$i+1]['value'] = $reliable;
                }
                
               $i++;
            }
            $x++;
        }

        return true;
    }

    function _populate_reliability_table()
    {
        $db =& Database::singleton();
        $db->select("SELECT CommentID, reliability_center_id FROM reliability", $this->reliability_table);


        $this->reliability_table = map_cIDs($this->reliability_table);

        // WITHIN SITE
        $site_list = array('SEA', 'PHI', 'STL', 'UNC');

        foreach($site_list as $site){

            $this->within_site_flagging("adi_r_subject", 0.1, $site, $db, 1);
            $this->within_site_flagging("adi_r_proband", 0.15, $site, $db, 1);
            $this->within_site_flagging("csbs", 0.1, $site, $db, 1);
            $this->within_site_flagging_visitlevel("aosi", 0.1, $site, $db,'V06' , 1);
            $this->within_site_flagging_visitlevel("aosi", 0.1, $site, $db,'V12' , 1);
            $this->within_site_flagging_visitlevel("ados_module1", 0.1, $site, $db,'V24' ,1);
            $this->within_site_flagging_visitlevel("ados_module1", 0.1, $site, $db,'V36' ,1);
            $this->within_site_flagging_visitlevel("ados_module2", 0.1, $site, $db,'V24' ,1);
            $this->within_site_flagging_visitlevel("ados_module2", 0.1, $site, $db,'V36' ,1);
            $this->within_site_flagging_visitlevel("ados_module3", 0.1, $site, $db,'V24' ,1);
            $this->within_site_flagging_visitlevel("ados_module3", 0.1, $site, $db,'V36' ,1);

            $this->within_site_flagging_visitlevel("ados2_module1", 0.1, $site, $db,'V24' ,1);
            $this->within_site_flagging_visitlevel("ados2_module1", 0.1, $site, $db,'V36' ,1);
            $this->within_site_flagging_visitlevel("ados2_module2", 0.1, $site, $db,'V24' ,1);
            $this->within_site_flagging_visitlevel("ados2_module2", 0.1, $site, $db,'V36' ,1);
            $this->within_site_flagging_visitlevel("ados2_module3", 0.1, $site, $db,'V24' ,1);
            $this->within_site_flagging_visitlevel("ados2_module3", 0.1, $site, $db,'V36' ,1);


            //ibis 2 reliability
            $this->within_site_flagging_visitlevel("aims", 0.1, $site, $db,'V03' ,2);
            $this->within_site_flagging_visitlevel("aims", 0.05, $site, $db,'V06' ,2);
            $this->within_site_flagging_visitlevel("aims", 0.05, $site, $db,'V09' ,2);
            $this->within_site_flagging_visitlevel("aims", 0.05, $site, $db,'V12' ,2);
            $this->within_site_flagging_visitlevel("aims", 0.05, $site, $db,'V15' ,2);
            $this->within_site_flagging("adi_r_subject", 0.1, $site, $db, 2);
            $this->within_site_flagging("adi_r_proband", 0.1, $site, $db, 2);
            $this->within_site_flagging("aosi", 0.1, $site, $db, 2);
            $this->within_site_flagging("csbs", 0.1, $site, $db, 2);
            $this->within_site_flagging_visitlevel("ados2_module1", 0.1, $site, $db,'V24' ,2);
            $this->within_site_flagging_visitlevel("ados2_module1", 0.1, $site, $db,'V36' ,2);
            $this->within_site_flagging_visitlevel("ados2_module2", 0.1, $site, $db,'V24' ,2);
            $this->within_site_flagging_visitlevel("ados2_module2", 0.1, $site, $db,'V36' ,2);
            $this->within_site_flagging_visitlevel("ados2_module3", 0.1, $site, $db,'V24' ,2);
            $this->within_site_flagging_visitlevel("ados2_module3", 0.1, $site, $db,'V36' ,2);
        }

        foreach($site_list as $site){

            $this->cross_site_flagging("adi_r_subject", $site, array_remove($site, $site_list), $db, 1);
            $this->cross_site_flagging("aosi", $site, array("UofA"), $db, 1);
            $this->cross_site_flagging("csbs", $site, array_remove($site, $site_list), $db, 1);

            $this->cross_site_flagging_visitlevel("ados_module1", $site, array_remove($site, $site_list), $db,'V24' ,1);
            $this->cross_site_flagging_visitlevel("ados_module1", $site, array_remove($site, $site_list), $db,'V36' ,1);
            $this->cross_site_flagging_visitlevel("ados_module2", $site, array_remove($site, $site_list), $db,'V24' ,1);
            $this->cross_site_flagging_visitlevel("ados_module2", $site, array_remove($site, $site_list), $db,'V36' ,1);
            $this->cross_site_flagging_visitlevel("ados_module3", $site, array_remove($site, $site_list), $db,'V24' ,1);
            $this->cross_site_flagging_visitlevel("ados_module3", $site, array_remove($site, $site_list), $db,'V36' ,1);
            $this->cross_site_flagging_visitlevel("ados2_module1", $site, array_remove($site, $site_list), $db,'V24' ,1);
            $this->cross_site_flagging_visitlevel("ados2_module1", $site, array_remove($site, $site_list), $db,'V36' ,1);
            $this->cross_site_flagging_visitlevel("ados2_module2", $site, array_remove($site, $site_list), $db,'V24' ,1);
            $this->cross_site_flagging_visitlevel("ados2_module2", $site, array_remove($site, $site_list), $db,'V36' ,1);
            $this->cross_site_flagging_visitlevel("ados2_module3", $site, array_remove($site, $site_list), $db,'V24' ,1);
            $this->cross_site_flagging_visitlevel("ados2_module3", $site, array_remove($site, $site_list), $db,'V36' ,1);

            // IBIS2 reliability
            $this->cross_site_flagging("aosi", $site, array("UofA"), $db, 2);
            //$this->cross_site_flagging("adi_r_subject", $site, array_remove($site, $site_list), $db, 2);
            $this->cross_site_flagging("csbs", $site, array_remove($site, $site_list), $db, 2);

            $this->cross_site_flagging_visitlevel("ados2_module1", $site, array_remove($site, $site_list), $db,'V24', 2);
            $this->cross_site_flagging_visitlevel("ados2_module1", $site, array_remove($site, $site_list), $db,'V36', 2);
            $this->cross_site_flagging_visitlevel("ados2_module2", $site, array_remove($site, $site_list), $db,'V24', 2);
            $this->cross_site_flagging_visitlevel("ados2_module2", $site, array_remove($site, $site_list), $db,'V36', 2);
            $this->cross_site_flagging_visitlevel("ados2_module3", $site, array_remove($site, $site_list), $db,'V24', 2);
            $this->cross_site_flagging_visitlevel("ados2_module3", $site, array_remove($site, $site_list), $db,'V36', 2);
            //ados2 module3

        }

    }

    function within_site_flagging($instrument, $ratio, $current_site, $db, $projectID){
        $phi_site_clause = '';
        if($current_site == "PHI" && ($instrument == "adi_r_subject" || $instrument == "adi_r_proband")){
            $phi_site_clause = " AND Date_taken >= '2009-11-11' ";
        }

        if($current_site == "STL" && ($instrument == "aosi")){
            $phi_site_clause = " AND Date_taken >= '2010-02-15' ";
        }

        $db->select("SELECT i.CommentID FROM {$instrument} as i, flag as f, session as s, candidate as c WHERE i.CommentID=f.CommentID AND f.sessionID=s.ID AND s.CandID = c.CandID AND s.Current_stage<>'Recycling Bin' AND f.Data_entry='Complete' AND i.CommentID LIKE '%{$current_site}%' AND s.visit_label<>'v18' AND i.CommentID NOT LIKE 'DDE%' {$phi_site_clause} AND f.Administration <> 'None' AND c.ProjectID = $projectID ORDER BY RIGHT(i.CommentID, 6)", $instrument_records);
        $total_records_count = $db->selectOne("SELECT COUNT(i.CommentID) FROM {$instrument} as i, flag as f, session as s, candidate as c WHERE i.CommentID=f.CommentID AND f.sessionID=s.ID AND s.CandID = c.CandID AND s.Current_stage<>'Recycling Bin' AND f.Data_entry='Complete' AND i.CommentID LIKE '%{$current_site}%' AND s.visit_label<>'v18' AND i.CommentID NOT LIKE 'DDE%' AND f.Administration <> 'None' AND c.ProjectID = $projectID ORDER BY RIGHT(i.CommentID, 6)");


        //$current_count = $db->selectOne("SELECT count(*) FROM reliability WHERE CommentID LIKE '%{$current_site}%' AND Instrument='{$instrument}' AND reliability_center_id={$this->site_id[$current_site]}");
        $current_count = $db->selectOne("SELECT count(*) FROM (SELECT DISTINCT r.CommentID FROM reliability as r, flag as f, session as s  WHERE r.CommentID LIKE '%{$current_site}%' AND r.Instrument='{$instrument}' AND r.reliability_center_id={$this->site_id[$current_site]} AND r.invalid = 'no' AND r.CommentID=f.CommentID AND f.sessionID=s.ID AND s.Current_stage<>'Recycling Bin') as t");
        $total_count = count($instrument_records);
        if($ratio*$total_records_count >= $total_count) {
            $max = $total_count;
        } else {
            $max = floor($ratio * $total_records_count);
        }

        //echo("Site: {$current_site} <BR>");
        //echo($current_count . " --- " . $total_count . "<BR>");
        //echo("Max (ratio: {$ratio}/jump: {$jump_step}): {$max} <BR><BR>");

        for($i = 0; $i < count($instrument_records) && $current_count + 1 <= $max; $i += 2){
            $commentID = $instrument_records[$i]["CommentID"];
            if(!find_cID($commentID, $this->reliability_table)){
                $db->insert('reliability', array('CommentID' => $instrument_records[$i]["CommentID"],
                    'reliability_center_id' => $this->site_id[$current_site],
                    'Instrument' => $instrument
                ));
                $this->reliability_table[$instrument_records[$i]["CommentID"]] = $this->site_id[$current_site];
                $current_count++;
            }
        }
    }

    function cross_site_flagging($instrument, $current_site, $reliability_sites, $db, $projectID){
        $ratio = 0.1;
        $reliability_site_index = 0;
        // We want the site to be random, starting from 0 causes a bias towards the first entry
        // in $reliability_sites.. so shuffle the array to eliminate the bias
        shuffle($reliability_sites);

        $query_extra = '';
        if($instrument == "adi_r_subject"){
            $query_extra = " AND (s.visit_label='v24' OR s.visit_label='v36')";
        }

        $phi_site_clause = '';
        if($current_site == "PHI" && ($instrument == "adi_r_subject" || $instrument == "adi_r_proband")){
            $phi_site_clause = " AND Date_taken >= '2009-11-11' ";
        }
        if($current_site == "STL" && ($instrument == "aosi")){
            $phi_site_clause = " AND Date_taken >= '2010-02-15' ";
        }

        $db->select("SELECT i.CommentID FROM {$instrument} as i, flag as f, session as s, candidate as c WHERE i.CommentID=f.CommentID AND f.sessionID=s.ID AND s.CandID = c.CandID AND s.Current_stage<>'Recycling Bin' AND f.Data_entry='Complete' AND i.CommentID LIKE '%{$current_site}%' AND s.visit_label<>'v18'{$query_extra} AND i.CommentID NOT LIKE 'DDE%' {$phi_site_clause} AND f.Administration <> 'None' AND c.ProjectID = $projectID ORDER BY RIGHT(i.CommentID, 6)", $instrument_records);
        $total_records_count = $db->selectOne("SELECT COUNT(i.CommentID) FROM {$instrument} as i, flag as f, session as s, candidate c WHERE i.CommentID=f.CommentID AND f.sessionID=s.ID AND s.CandID=c.CandID AND s.Current_stage<>'Recycling Bin' AND f.Data_entry='Complete' AND i.CommentID LIKE '%{$current_site}%' AND s.visit_label<>'v18'{$query_extra} AND i.CommentID NOT LIKE 'DDE%' AND f.Administration <> 'None' AND c.ProjectID = $projectID ORDER BY RIGHT(i.CommentID, 6)");

        $current_count = $db->selectOne("SELECT count(*) FROM (SELECT DISTINCT r.CommentID FROM reliability as r, flag as f, session as s  WHERE r.CommentID LIKE '%{$current_site}%' AND r.Instrument='{$instrument}' AND r.reliability_center_id<>{$this->site_id[$current_site]} AND r.invalid = 'no' AND r.CommentID=f.CommentID AND f.sessionID=s.ID AND s.Current_stage<>'Recycling Bin') as t");
        $total_count = count($instrument_records);
        if($ratio*$total_records_count >= $total_count) {
            $max = $total_count;
        } else {
            $max = floor($ratio * $total_records_count);
        }
        // 
        // echo("Site: {$current_site} <BR>");
        // echo($current_count . " --- " . $total_count . "<BR>");
        // echo("Max (ratio: {$ratio}/jump: {$jump_step}): {$max} <BR><BR>");

        for($i = 0; $i < count($instrument_records) && $current_count + 1 <= $max; $i += 2){
            $commentID = $instrument_records[$i]["CommentID"];
            if(!find_cID($commentID, $this->reliability_table)){
                $db->insert('reliability', array('CommentID' => $instrument_records[$i]["CommentID"],
                    'reliability_center_id' => $this->site_id[$reliability_sites[$reliability_site_index]],
                    'Instrument' => $instrument
                ));
                $this->reliability_table[$instrument_records[$i]["CommentID"]] = $this->site_id[$current_site];
                $current_count++;
            }
            $reliability_site_index = ($reliability_site_index + 1) % count($reliability_sites);
        }
    }
    function within_site_flagging_visitlevel($instrument, $ratio, $current_site, $db,$visit_label, $projectID){
        $db->select("SELECT i.CommentID FROM {$instrument} as i, flag as f, session as s, candidate as c WHERE i.CommentID=f.CommentID AND f.sessionID=s.ID AND s.CandID = c.CandID AND s.Current_stage<>'Recycling Bin' AND f.Data_entry='Complete' AND i.CommentID LIKE '%{$current_site}%' AND s.visit_label = '{$visit_label}' AND i.CommentID NOT LIKE 'DDE%' AND f.Administration <> 'None' AND c.ProjectID = $projectID ORDER BY RIGHT(i.CommentID, 6)", $instrument_records);
        $total_records_count = $db->selectOne("SELECT COUNT(i.CommentID) FROM {$instrument} as i, flag as f, session as s, candidate as c WHERE i.CommentID=f.CommentID AND f.sessionID=s.ID AND s.CandID = c.CandID AND s.Current_stage<>'Recycling Bin' AND f.Data_entry='Complete' AND i.CommentID LIKE '%{$current_site}%' AND s.visit_label = '{$visit_label}' AND i.CommentID NOT LIKE 'DDE%' AND f.Administration <> 'None' AND c.ProjectID = $projectID ORDER BY RIGHT(i.CommentID, 6)");


        #$current_count = $db->selectOne("SELECT count(*) FROM reliability WHERE CommentID LIKE '%{$current_site}%' AND Instrument='{$instrument}' AND reliability_center_id={$this->site_id[$current_site]}");
        $current_count = $db->selectOne("SELECT count(*) FROM (SELECT DISTINCT r.CommentID FROM reliability as r, flag as f, session as s  WHERE r.CommentID LIKE '%{$current_site}%' AND r.Instrument='{$instrument}' AND r.reliability_center_id={$this->site_id[$current_site]} AND r.invalid = 'no' AND r.CommentID=f.CommentID AND f.sessionID=s.ID AND s.Current_stage<>'Recycling Bin') as t");
        $total_count = count($instrument_records);
        if($ratio*$total_records_count >= $total_count) {
            $max = $total_count;
        } else {
            $max = floor($ratio * $total_records_count);
        }

        //echo("Site: {$current_site} <BR>");
        //echo($current_count . " --- " . $total_count . "<BR>");
        //echo("Max (ratio: {$ratio}/jump: {$jump_step}): {$max} <BR><BR>");

        for($i = 0; $i < count($instrument_records) && $current_count + 1 <= $max; $i += 2){
            $commentID = $instrument_records[$i]["CommentID"];
            if(!find_cID($commentID, $this->reliability_table)){
                $db->insert('reliability', array('CommentID' => $instrument_records[$i]["CommentID"],
                    'reliability_center_id' => $this->site_id[$current_site],
                    'Instrument' => $instrument
                ));
                $this->reliability_table[$instrument_records[$i]["CommentID"]] = $this->site_id[$current_site];
                $current_count++;
            }
        }
    }

    function cross_site_flagging_visitlevel($instrument, $current_site, $reliability_sites, $db, $visit_label, $projectID){
        $ratio = 0.1;
        $reliability_site_index = 0;
        // We want the site to be random, starting from 0 causes a bias towards the first entry
        // in $reliability_sites.. so shuffle the array to eliminate the bias
        shuffle($reliability_sites);

        $query_extra = '';
        if($instrument == "adi_r_subject"){
            $query_extra = " AND (s.visit_label='v24' OR s.visit_label='v36')";
        }

        $phi_site_clause = '';
        if($current_site == "PHI" && ($instrument == "adi_r_subject" || $instrument == "adi_r_proband")){
            $phi_site_clause = " AND Date_taken >= '2009-11-11' ";
        }
        if($current_site == "STL" && ($instrument == "aosi")){
            $phi_site_clause = " AND Date_taken >= '2010-02-15' ";
        }

        $db->select("SELECT i.CommentID FROM {$instrument} as i, flag as f, session as s, candidate as c WHERE i.CommentID=f.CommentID AND f.sessionID=s.ID AND s.CandID = c.CandID AND s.Current_stage<>'Recycling Bin' AND f.Data_entry='Complete' AND i.CommentID LIKE '%{$current_site}%' AND s.visit_label='{$visit_label}'{$query_extra} AND i.CommentID NOT LIKE 'DDE%' {$phi_site_clause} AND f.Administration <> 'None' AND c.ProjectID = $projectID ORDER BY RIGHT(i.CommentID, 6)", $instrument_records);
        $total_records_count = $db->selectOne("SELECT COUNT(i.CommentID) FROM {$instrument} as i, flag as f, session as s, candidate c WHERE i.CommentID=f.CommentID AND f.sessionID=s.ID AND s.CandID=c.CandID AND s.Current_stage<>'Recycling Bin' AND f.Data_entry='Complete' AND i.CommentID LIKE '%{$current_site}%' AND s.visit_label='{$visit_label}'{$query_extra} AND i.CommentID NOT LIKE 'DDE%' AND f.Administration <> 'None' AND c.ProjectID = $projectID ORDER BY RIGHT(i.CommentID, 6)");

        $current_count = $db->selectOne("SELECT count(*) FROM (SELECT DISTINCT r.CommentID FROM reliability as r, flag as f, session as s  WHERE r.CommentID LIKE '%{$current_site}%' AND r.Instrument='{$instrument}' AND r.reliability_center_id<>{$this->site_id[$current_site]} AND r.invalid = 'no' AND r.CommentID=f.CommentID AND f.sessionID=s.ID AND s.Current_stage<>'Recycling Bin') as t");
        $total_count = count($instrument_records);
        if($ratio*$total_records_count >= $total_count) {
            $max = $total_count;
        } else {
            $max = floor($ratio * $total_records_count);
        }
        // 
        // echo("Site: {$current_site} <BR>");
        // echo($current_count . " --- " . $total_count . "<BR>");
        // echo("Max (ratio: {$ratio}/jump: {$jump_step}): {$max} <BR><BR>");

        for($i = 0; $i < count($instrument_records) && $current_count + 1 <= $max; $i += 2){
            $commentID = $instrument_records[$i]["CommentID"];
            if(!find_cID($commentID, $this->reliability_table)){
                $db->insert('reliability', array('CommentID' => $instrument_records[$i]["CommentID"],
                    'reliability_center_id' => $this->site_id[$reliability_sites[$reliability_site_index]],
                    'Instrument' => $instrument
                ));
                $this->reliability_table[$instrument_records[$i]["CommentID"]] = $this->site_id[$current_site];
                $current_count++;
            }
            $reliability_site_index = ($reliability_site_index + 1) % count($reliability_sites);
        }
    }
    /* To be discussed with Tanya
     function cross_site_flagging_aims($current_site, $reliability_sites, $db, $projectID){
         $ratio = 0.1;
         $reliability_site_index = 0;
         // We want the site to be random, starting from 0 causes a bias towards the first entry
         // in $reliability_sites.. so shuffle the array to eliminate the bias
         shuffle($reliability_sites);

         $query_extra = '';
         $instrument = "aims";
         $db->select("SELECT i.CommentID FROM {$instrument} as i, flag as f, session as s, candidate as c WHERE i.CommentID=f.CommentID AND f.sessionID=s.ID AND s.CandID = c.CandID AND s.Current_stage<>'Recycling Bin' AND f.Data_entry='Complete' AND i.CommentID LIKE '%{$current_site}%' AND s.visit_label<>'v18'{$query_extra} AND i.CommentID NOT LIKE 'DDE%'  AND f.Administration <> 'None' AND c.ProjectID = $projectID ORDER BY RIGHT(i.CommentID, 6)", $instrument_records);
         $total_records_count = $db->selectOne("SELECT COUNT(i.CommentID) FROM {$instrument} as i, flag as f, session as s, candidate c WHERE i.CommentID=f.CommentID AND f.sessionID=s.ID AND s.CandID=c.CandID AND s.Current_stage<>'Recycling Bin' AND f.Data_entry='Complete' AND i.CommentID LIKE '%{$current_site}%' AND s.visit_label<>'v18'{$query_extra} AND i.CommentID NOT LIKE 'DDE%' AND f.Administration <> 'None' AND c.ProjectID = $projectID ORDER BY RIGHT(i.CommentID, 6)");

          $current_count = $db->selectOne("SELECT count(*) FROM (SELECT DISTINCT r.CommentID FROM reliability as r, flag as f, session as s  WHERE r.CommentID LIKE '%{$current_site}%' AND r.Instrument='{$instrument}' AND r.reliability_center_id<>{$this->site_id[$current_site]} AND r.invalid = 'no' AND r.CommentID=f.CommentID AND f.sessionID=s.ID AND s.Current_stage<>'Recycling Bin') as t");
         $total_count = count($instrument_records);
         if($ratio*$total_records_count >= $total_count) {
             $max = $total_count;
         } else {
             $max = floor($ratio * $total_records_count);
         }

        for($i = 0; $i < count($instrument_records) && $current_count + 1 <= $max; $i += 2){
           $commentID = $instrument_records[$i]["CommentID"];
           if(!find_cID($commentID, $this->reliability_table)){
             $db->insert('reliability', array('CommentID' => $instrument_records[$i]["CommentID"],
                                               'reliability_center_id' => $this->site_id[$reliability_sites[$reliability_site_index]],
                                               'Instrument' => $instrument
                                               ));
             $this->reliability_table[$instrument_records[$i]["CommentID"]] = $this->site_id[$current_site];
             $current_count++;
           }
           $reliability_site_index = ($reliability_site_index + 1) % count($reliability_sites);
        }
     }
 */
    function get_current_index($instrument, $current_site, $reliability_sites, $db){
        $site_name = array_flip($this->site_id);
        $last_site = $db->selectOne("SELECT reliability_center_id FROM reliability where ID=(select max(ID) FROM reliability WHERE CommentID LIKE '%{$current_site}%' AND Instrument='{$instrument}' AND reliability_center_id<>{$this->site_id[$current_site]})");
        if(empty($last_site)){
            return 0;
        }
        else{
            return (array_search($site_name[$last_site], $reliability_sites) + 1) % count($reliability_sites);
        }
    }

    function _swap_candidates() {
        $user =& User::singleton();
        if(Utility::isErrorX($user)) {
            return PEAR::raiseError("User Error: ".$user->getMessage());
        }
        if (!($user->hasPermission('reliability_swap_candidates'))) {
            return array("error" => "You do not have permission to swap candidates");
        }
        $DB =& Database::singleton();
        $PSCID = $_POST['Cand1PSCID'];
        $PSCID_V = $_POST['Cand1Visit_label'];
        $PSCID_Replace= $_POST['Cand2PSCID'];
        $PSCID_Replace_V = $_POST['Cand2Visit_label'];
        $Instrument = $_POST['SwapInstrument'];

        $query="SELECT reliability.CommentID as OldID, reliability.reliability_center_id as CenterID, reliability.Reliability_score as Score, candidate.CenterID as OldCenterID, reliability.EARLI_Candidate AS EARLI_Candidate,candidate.ProjectID  FROM candidate, session, flag, reliability WHERE reliability.CommentID=flag.CommentID AND candidate.CandID=session.CandID AND session.ID=flag.SessionID AND candidate.PSCID='$PSCID' AND reliability.Instrument='$Instrument' and session.Visit_label='$PSCID_V' and flag.Data_entry IS NOT NULL and flag.Data_entry <> 'None' ";

        $DB->selectRow($query, $CommentID);
        if(!$CommentID) {
            return array("error" => "$PSCID/$PSCID_V is not in reliability coding for $Instrument. Cannot swap candidates.");
        }

        $query="SELECT f.CommentID as NewID, c.CenterID as NewCenterID FROM session s join flag f ON (f.SessionID=s.ID) JOIN candidate c ON (c.CandID=s.CandID)  WHERE f.Test_name='$Instrument' and c.PSCID='$PSCID_Replace' AND s.Visit_label='$PSCID_Replace_V' AND f.Data_entry IS NOT NULL and f.Data_entry <> 'None'";
        $DB->selectRow($query, $newCommentID);
        if(!$newCommentID) {
            return array('error' => "$PSCID_Replace/$PSCID_Replace_V did not complete $Instrument or data not entered. Cannot swap candidates.");
        }
        if($newCommentID['NewCenterID'] !== $CommentID['OldCenterID']) {
            return array('error' => "Candidates are not from the same site. Cannot swap candidates across sites.");
        }
        elseif($user->getCenterID() != $newCommentID['NewCenterID']) {
            return array('error' => "$PSCID_Replace/$PSCID_Replace_V is from a different site than you. Can only swap candidates from the same site.");
        }
        elseif($user->getCenterID() != $CommentID['OldCenterID']) {
            return array('error' => "$PSCID/$PSCID_V is from a different site than you. Can only swap candidates from the same site.");
        }
        $NewID = $newCommentID['NewID'];
        $DB->selectRow("SELECT CommentID FROM reliability WHERE CommentID='$NewID'", $replacementCheck);
        if(!empty($replacementCheck)) {
            return array("error" => "$PSCID_Replace/$PSCID_Replace_V already in reliability. Cannot swap $PSCID/$PSCID_V for it.");
        }

        $CenterID = $CommentID['CenterID'];
        $EARLI_Cand= $CommentID['EARLI_Candidate'];
        if(!empty($CommentID['Score'])) {
            return array( "error" => "Reliability score already exists for $PSCID/$PSCID_V. Can not swap candidate.");
        }
        $DB->run("UPDATE reliability SET invalid='yes', manual_swap='yes' WHERE CommentID='$CommentID[OldID]' AND Instrument='$Instrument'");
        $DB->run("INSERT INTO reliability (CommentID, reliability_center_id, Instrument, Manual_Swap, EARLI_Candidate) VALUES ('$newCommentID[NewID]', $CenterID, '$Instrument', 'yes', '$EARLI_Cand')");

        return array("message" => "Swapped candidate $PSCID for $PSCID_Replace");
    }

    function _addCandidate() {
        $user =& User::singleton();
        $DB =& Database::singleton();
        if(Utility::isErrorX($user)) {
            return PEAR::raiseError("User Error: ".$user->getMessage());
        }
        if (!($user->hasPermission('EARLI_Reliability'))) {
            return array("error" => "You do not have permission to add EARLI candidates");
        }
        $Instrument = $_POST['AddInstrument'];
        $CenterID = $_POST['AddReliabilityCenter'];
        $Visit_label= $_POST['AddVisit_label'];
        if(!$Visit_label) {
            return array("error" => "You must specify a visit label");
        }

        if(!$Instrument) {
            return array("error" => "You must specify an instrument");
        }
        if(!$CenterID) {
            return array("error" => "You must specify a center for reliability testing");
        }

        $PSCID = $_POST['AddPSCID'];
        $CommentID = $DB->selectOne("SELECT CommentID FROM flag f JOIN session s ON (s.ID=f.SessionID) JOIN candidate c USING (CandID) WHERE f.Test_name='$Instrument' AND c.PSCID='$PSCID' AND s.Visit_label='$Visit_label'");
        if(!$CommentID) {
            return array("error" => "$PSCID/$Visit_label does not have data entered for $Instrument");

        }
        $DB->run("INSERT INTO reliability (CommentID, reliability_center_id, Instrument, Manual_Swap, EARLI_Candidate) VALUES ('$CommentID', $CenterID, '$Instrument', 'no', 'yes')");
        return array("message" => "Inserted new reliability candidate $PSCID/$Visit_label for EARLI collaboration");
    }
}
?>
