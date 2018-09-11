<?php
/**
 * Script to convert MyISAM tables in the database into InnoDB tables. Multiple
 * options are proposed to the user, see showHelp() function for more details.
 *
 * PHP Version 7
 *
 * @category Main
 * @package  Loris
 * @author   Rida Abou-Haidar <rida.loris@gmail.com>
 * @license  Loris license
 * @link     https://www.github.com/aces/Loris-Trunk/
 */
require_once __DIR__ . "/../generic_includes.php";
require_once __DIR__ . "/../helpers/FileHelper.php";

$dbConfig = $config->getSetting("database");
$adminDB  = Database::singleton(
    $dbConfig["database"],
    $dbConfig["quatUser"],
    $dbConfig["quatPassword"],
    $dbConfig["host"],
    true
);

$base = $config->getSetting("base");
// SETUP OUTPUT to file in project/tables_sql/change_MyISAM_to_INNODB_schemaTables.sql
$filePath = __DIR__ . "/../../SQL/Archive/autogenerated/single_use/change_MyISAM_to_INNODB.sql";

echo "
#####################################################################################
This script will create ALTER TABLE statements to change selected tables in the 
 database with a MyISAM engine to use INNODB.
This script includes foreign keycheck disabling and re-enabling.
#####################################################################################
\n\n";

// define the command line parameters
// expected commands all have 2 parameters
if (count($argv) != 3 || $argv[1] == "help") {
    showHelp();
}

// set default arguments
$confirm    = false;
$printToSQL = false;
$output     = "";
$action     = "";
// array to hold all tables that will be converted
$tablesToChange = array();

// SETUP INPUT from Database table schema. used for `allTables` and `tableName` options
$table_names = $DB->pselectCol(
    "SELECT TABLE_NAME 
     FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA =:dbn 
       AND ENGINE = 'MyISAM'",
    array("dbn" => $dbConfig["database"])
);

// possible actions for script are schemaTables, all Tables or any table in the DB
$actions    = array("allTables","schemaTables") + $table_names;
// END INPUT


// get command arguments and validate
if (in_array($argv[1],$actions,true)) {
    $action = $argv[1];
} else {
    echo "ERROR: The action you have selected is invalid. Use `schemaTable, `allTables `
    or specify the name of the table you would like to convert.\n\n\n";
    showHelp();
}

if ($argv[2] === "confirm") {
    $confirm = true;
} elseif ($argv[2] === "tosql") {
    $printToSQL = true;
} else {
    showHelp();
}

// If action is `schemaTables` only, parse schema files
if ($action === "schemaTables") {
    // SETUP INPUT from schema files in SQL loris directory
    $schemaFiles = [
        "0000-00-00-schema.sql",
        "0000-00-01-Permission.sql",
        "0000-00-02-Menus.sql",
        "0000-00-03-ConfigTables.sql",
        "0000-00-04-Help.sql",
    ];
    $schemaFileBase = $base . "SQL/";
    $completeSchema = "";
    foreach ($schemaFiles as $file) {
        $completeSchema .= $fc = file_get_contents($schemaFileBase . $file, "r");
    }
    $createTables = [];
    preg_match_all('/CREATE TABLE \`([_a-zA-Z0-9]+)\`/', $completeSchema, $createTables);

    // Format array to match expectations
    foreach ($createTables[1] as $key=>$table)
    {
        $tablesToChange[] = $table;
    }
    // END INPUT
} elseif ($action === "allTables") {
    $tablesToChange = $table_names;
} else {
    // its a specific table
    $tablesToChange[] = $action;
}

if (empty($tablesToChange)) {
    echo "No MyISAM tables detected. Terminating the script.\n";
    die();
}

// SETUP OUTPUT
$output .="SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS; \n";
$output .="SET FOREIGN_KEY_CHECKS=0; \n";

foreach ($tablesToChange as $table)
{
    $output .= "ALTER TABLE `".$table."` ENGINE=INNODB;\n";
}

$output .="SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS; \n";
// END OUTPUT

// START ACTION
if ($printToSQL) {
    // Generate the file
    FileHelper::writeToFile($filePath, $output);
} elseif ($confirm) {
    // Run on database
    // Get data from all tables to be modified
    $dataPre = array();
    foreach ($tablesToChange as $key=>$table)
    {
        $colNumber = getNumberOfCols($table,$adminDB,$dbConfig);
        $sortString = "";
        // limit to 20 columns to avoid Memory allocation errors
        for ($i=1; $i < min($colNumber-1, 20); $i++) {
            $sortString .= "$i,";
        }
        $sortString .= $colNumber-1;
        $dataPre[$table] = $DB->pselect("SELECT * FROM ". $table . " ORDER BY $sortString", array());
    }
    echo "Running database calls.\n";
    // Admin necessary, ALTER TABLE calls
    $adminDB->run($output);
    $dataPost = array();
    foreach ($tablesToChange as $key=>$table)
    {
        $colNumber = getNumberOfCols($table,$adminDB,$dbConfig);
        $sortString = "";
        // limit to 20 columns to avoid Memory allocation errors
        for ($i=1; $i < min($colNumber-1, 20); $i++) {
            $sortString .= "$i,";
        }
        $sortString .= $colNumber-1;
        $dataPost[$table] = $DB->pselect("SELECT * FROM ". $table . " ORDER BY $sortString", array());
    }
    compareArrays($dataPre, $dataPost);
}

function compareArrays($array1, $array2)
{
    echo "Comparing data before and after engine conversion.\n";
    foreach ($array1 as $table=>$rows) {
        foreach ($rows as $rowid=>$row) {
            foreach ($row as $key=>$val) {
                if ($array2[$table][$rowid][$key] !== $val) {
                    echo "A potential data corruption has been detected in Table $table, at field $key. 
                    (old value: $val, new value: $array2[$table][$rowid][$key])\n";
                }
            }
        }
    }
}

function getNumberOfCols($DBTable, $DB, $dbConfig)
{
    $number = $DB->pselectOne("
          SELECT COUNT(*) 
          FROM `information_schema`.`COLUMNS` 
          WHERE TABLE_NAME=:tbl AND TABLE_SCHEMA=:dbn",
        array(
            "tbl"=> $DBTable,
            "dbn"=> $dbConfig["database"]
        )
    );
    return $number;
}

function showHelp()
{
    echo "*** CHANGE MyISAM TO INNODB***\n\n";

    echo "Example: php Engine_Change_MyISAM_to_INNODB_schemaTables.php allTables confirm\n";
    echo "Example: php Engine_Change_MyISAM_to_INNODB_schemaTables.php allTables tosql\n";
    echo "Example: php Engine_Change_MyISAM_to_INNODB_schemaTables.php schemaTables confirm\n";
    echo "Example: php Engine_Change_MyISAM_to_INNODB_schemaTables.php tableName tosql\n\n";

    echo "When the 'tosql' option is used, an SQL file is generated and exported to the following path: \n".
        "%loris_root%/SQL/Archive/autogenerated/single_use/change_MyISAM_to_INNODB.sql\n\n";

    echo "When the 'confirm' option is used, the generated SQL is run directly on the database.\n\n";

    die();
}
