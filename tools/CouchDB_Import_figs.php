<?php
require_once __DIR__ . "/../vendor/autoload.php";
require_once 'generic_includes.php';
require_once 'CouchDB.class.inc';
require_once 'Database.class.inc';
require_once 'Utility.class.inc';
class CouchDBFigsImporter
{
    var $SQLDB; // reference to the database handler, store here instead
    // of using Database::singleton in case it's a mock.
    var $CouchDB; // reference to the CouchDB database handler

    function __construct()
    {
        $this->SQLDB   = Database::singleton();
        $this->CouchDB = CouchDB::singleton();
    }

    function UpdateDataDicts($Instruments)
    {
        foreach ($Instruments as $instrument => $name) {
            $Dict   = array(
                'Administration'  => array(
                    'Type'        => "enum('None'," .
                        " 'Partial', 'All')",
                    'Description' => "Administration " .
                        "for $name",
                ),
                'Data_entry'      => array(
                    'Type'        => "enum('In Progress'," .
                        " 'Complete')",
                    'Description' => "Data entry status " .
                        "for $name",
                ),
                'Validity'        => array(
                    'Type'        => "enum('Questionable'" .
                        ", 'Invalid', 'Valid')",
                    'Description' => "Validity of data " .
                        "for $name",
                ),
                'Conflicts_Exist' => array(
                    'Type'        => "enum('Yes', 'No')",
                    'Description' => 'Conflicts exist for' .
                        ' instrument data entry',
                ),
                'DDE_Complete'    => array(
                    'Type'        => "enum('Yes', 'No')",
                    'Description' => 'Double Data Entry ' .
                        'was completed for instrument',
                ),
            );
            $Fields = $this->SQLDB->pselect(
                "SELECT * from parameter_type WHERE SourceFrom=:inst " .
                "AND Queryable=1",
                array('inst' => $instrument)
            );
            foreach ($Fields as $field) {
                if (isset($field['SourceField'])) {
                    $fname        = $field['SourceField'];
                    $Dict[$fname] = array();
                    $Dict[$fname]['Type']        = $field['Type'];
                    $Dict[$fname]['Description'] = $field['Description'];
                }
            }

            unset($Dict['city_of_birth']);
            unset($Dict['city_of_birth_status']);

            $this->CouchDB->replaceDoc(
                "DataDictionary:$instrument",
                array(
                    'Meta'           => array('DataDict' => true),
                    'DataDictionary' => array($instrument => $Dict),
                )
            );
        }
    }


    function run()
    {
        $tests = array("figs_year3_relatives" => "Figs Relatives");
        $this->UpdateDataDicts($tests);


        $this->CouchDB->beginBulkTransaction();

        $results = array(
            'new'       => 0,
            'modified'  => 0,
            'unchanged' => 0,
        );

        // Query to retrieve figs data
        $figs_rel = $this->SQLDB->pselect("
            SELECT  c.PSCID,
                    s.Visit_label,
                    f.Administration,
                    f.Data_entry,
                    f.Validity,
                    CASE WHEN EXISTS (SELECT 'x'
                                      FROM conflicts_unresolved cu
                                      WHERE fr.CommentID=cu.CommentId1 OR fr.CommentID=cu.CommentId2) THEN 'Y' ELSE 'N' END
                          AS Conflicts_Exist,
                    CASE f.Data_entry='Complete' WHEN 1 THEN 'Y' WHEN NULL THEN 'Y' ELSE 'N' END
                          AS DDE_Complete,
                    fr.*
            FROM figs_year3_relatives fr
            LEFT JOIN flag f ON (f.CommentID=fr.CommentID)
            LEFT JOIN session s ON (s.ID=f.SessionID)
            LEFT JOIN candidate c ON (c.CandID=s.CandID)
            WHERE f.CommentID NOT LIKE 'DDE%'
                    AND s.Active='Y'
                    AND c.Active='Y'
            ", array()
        );

        // Adding the data to CouchDB documents
        foreach($figs_rel as $row) {
            $identifier = array($row['PSCID'], $row['Visit_label']);
            $id = 'figs_year3_relatives_' . join($identifier, '_');
            unset($row['PSCID']);
            unset($row['Visit_label']);
            $success = $this->CouchDB->replaceDoc($id, array('Meta' => array(
                'DocType' => 'figs_year3_relatives',
                'identifier' => $identifier
            ),
                'data' => $row
            ));
            print "$id: $success\n";
        }
        print $this->CouchDB->commitBulkTransaction();
    }
}


// Don't run if we're doing the unit tests; the unit test will call run.
if(!class_exists('UnitTestCase')) {
    $Runner = new CouchDBFigsImporter();
    $Runner->run();
}
?>