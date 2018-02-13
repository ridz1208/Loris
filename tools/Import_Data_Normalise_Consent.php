<?php
/**
 * This script is written for a one time use only to normalise the consent feature of the
 * candidate parameters module and populate the normalised tables with existing
 * data from the participant_status and consent_info_history tables in the database.
 * 
 * The old tables and columns should be deleted after running this script. Follow the prompts at the end.
 * 
 * affected tables:
 * - participant_status
 * - consent_info_history
 * - consent_type
 * - candidate_consent_type_rel
 * _ candidate_consent_type_history
 * 
 * PHP Version 7
 * 
 * @category Main 
 * @package  Loris
 * @author   Zaliqa Rosli <zaliqa.rosli@mcin.ca>
 * @license  Loris license
 * @link     https://github.com/aces/Loris
 */

require_once 'generic_includes.php';

$config = NDB_Config::singleton();
$db     =& Database::singleton();

// Get consent info from Config.xml
$consentConfig = $config->getSettingFromXML('ConsentModule');
$useConsent = $consentConfig['useConsent'];
$consents = $consentConfig['Consent'];

// Update ConfigSetting table with value of 'useConsent' if true. Default is set to false.
$configID = $db->pselectOne(
              'SELECT ID FROM ConfigSettings WHERE Name="useConsent"',
              array()
            );
if ($useConsent === "true") {
  $updateValue = ['Value' => $useConsent];
  $db->update(
       'Config',
       $updateValue,
       array (
         'ConfigID' => $configID, 
       )
  );
  echo "\nConfig settings set to use consent.\n\n";
}

// Start import of consent status information into new tables
$consentType = [];
$printArray  = [];

foreach ($consents as $key=>$consent) {
  // Populate consent_type table with consents from Config.xml
  $consentName  = $consent['name'];
  $consentLabel = $consent['label'];

  $db->insert(
         'consent_type', 
         array(
           'Name'  => $consentName,
           'Label' => $consentLabel,
         )
  );
  // Save ConsentTypeID inserted
  $consentTypeID = $db->pselectOne(
                     'SELECT ConsentTypeID FROM consent_type WHERE Name=:consentName',
                     array('consentName' => $consentName)
                   );

  // Create array of consents to use later in importing history data
  $consentType[$consentName] = $consentLabel;

  // CHECK: Do consent columns exist in old table?
  $columnQuery = 'SHOW COLUMNS FROM participant_status LIKE "' . $consentName . '"';
  $columnExists = $db->pselect($columnQuery, array());

  if (!empty($columnExists)) {
    //get all data where the consent status has a value
    $psData = $db->pselect(
                 'SELECT * FROM participant_status WHERE ' . $consentName . ' IS NOT NULL OR ' . $consentName . ' != ""',
                 array()
               );

    foreach ($psData as $entry) {
      //Check for zero dates
      if($entry[$consentName . '_date'] === "0000-00-00 00:00:00"){
        throw new Exception("Zero dates found in: " . $entry . ". Please remove date or run /tools/DB_date_zeros_removal.php.");
      }
      //push each formatted old entry to array
      $consentValues = [
          'CandidateID'   => $entry['CandID'],
          'ConsentTypeID' => $consentTypeID,
          'Status'        => $entry[$consentName],
          'DateGiven'     => $entry[$consentName . '_date'],
          'DateWithdrawn' => $entry[$consentName . '_withdrawal'],
          ];
      array_push($printArray, $consentValues);
    }
  }
}

// Output list of consents to terminal
echo "\nValid consents found: \n";
$i=1;
foreach($consentType as $consent) {
  echo $i . ". " . $consent . "\n";
  $i++;
}

//Check for when consent columns exist in table but not in list of consents in Config.xml
$columnQuery = 'SELECT Column_name FROM Information_schema.columns WHERE Column_name LIKE "%consent%" AND Table_name LIKE "participant_status"';
$existingColumns = $db->pselect($columnQuery, array());

//format $existingColumns and remove data, withdrawal columns
$formattedColumns = [];

foreach ($existingColumns as $key=>$column) {
  $columnName = $column['Column_name']; 
  if (!(preg_match("/date/", $columnName) || preg_match("/withdrawal/", $columnName))) {
    array_push($formattedColumns, $columnName);
  }
}
//check that column names are in list of consent names
foreach ($formattedColumns as $columnName) {
  $i=0;
  foreach ($consents as $consent){
    $consentName = $consent['name'];
    if($consentName===$columnName) {
      $i++;
    }
  }
  if ($i===0) {
    throw new Exception("\nThe consent type " . $columnName . " exists in the database but not in Config.xml. Please add the consent to Config.xml or delete columns and data from 'participant_status'");
  }
}

//Output list of data to be inserted into new table to terminal
echo "\nRows to be inserted into 'candidate_consent_type_rel' table ..\n";
echo "Empty values will be inserted as NULL.\n\n";
print_r($printArray);

//populate candidate_consent_type_rel with data
foreach ($printArray as $consentValues) {
    $db->insert('candidate_consent_type_rel', $consentValues);
  }

echo "\nData insert complete.\n";

// Select consent history and import into new history table
$consentHistory = $db->pselect(
    'SELECT * FROM consent_info_history',
    array()
);

foreach ($consentHistory as $entry) {
  $candID = $entry['CandID'];
  $pscid = $db->pselectOne(
             'SELECT PSCID FROM candidate WHERE CandID=:cid',
              array ('cid' => $candID)
           );
  $entryStaff = $entry['entry_staff'];
  $entryDate = $entry['data_entry_date'];

  foreach($consentType as $consentName=>$consentLabel) {
    if(array_key_exists($consentName, $entry)) {
      $consentStatus = $entry[$consentName];
      $consentDate = $entry[$consentName . '_date'];
      $consentWithdrawal = $entry[$consentName . '_withdrawal'];

      if(!empty($consentStatus) || !empty($consentDate) || !empty($consentWithdrawal)) {
        $formattedHistory = [
                'PSCID'         => $pscid,
                'ConsentName'   => $consentName,
                'ConsentLabel'  => $consentLabel,
                'Status'        => $consentStatus,
                'DateGiven'     => $consentDate,
                'DateWithdrawn' => $consentWithdrawal,
                'EntryStaff'    => $entryStaff,
                'EntryDate'     => $entryDate,
                ];

      }
      //Populate candidate_consent_type_history table
      $db->insert('candidate_consent_type_history', $formattedHistory); 
    }
  }
}
echo "\nHistory data insert complete.\n";
echo "\nRun the following commands in mySQL to delete deprecated columns: \n\n";

foreach ($existingColumns as $column) {
    $columnName = $column['Column_name'];
    echo "ALTER TABLE participant_status DROP COLUMN " . $columnName . ";\n";
}

echo "\n\nRun the following command in mySQL to delete deprecated history table: \n";
echo "\nDROP TABLE consent_info_history;\n\n";
?>
