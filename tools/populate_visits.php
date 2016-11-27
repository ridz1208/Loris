<?php
/**
 * This script populates the visits table based on the config.xml.
 * This should usually be run on a one time basis, and then the visits
 * table should be kept up to date manually, though the script will only
 * insert new visits, so it can be run multiple times if need be.
 *
 * The script also populates the visits_subproject_project_rel table.
 *
 * PHP Version 5
 *
 * @category Main
 * @package  Loris
 * @author   Rida Abou-Haidar <rida.loris@gmail.com>
 * @license  Loris license
 * @link     https://www.github.com/aces/Loris-Trunk/
 */
require_once __DIR__ . "/../vendor/autoload.php";
require_once 'generic_includes.php';
require_once 'Database.class.inc';
require_once 'Utility.class.inc';

/**
 * Class to implement logic which populates table.
 *
 * @category Main
 * @package  Loris
 * @author   Rida Abou-Haidar <rida.loris@gmail.com>
 * @license  Loris license
 * @link     https://www.github.com/aces/Loris-Trunk/
 */
class VisitsPopulator
{
    var $DB;
    var $Config;
    /**
     * Constructor function. Instantiates references to database and
     * config class.
     *
     * @return VisitWindowPopulator
     */
    function __construct()
    {
        $this->DB = Database::singleton();
        $this->Config = NDB_Config::singleton();
    }

    /**
     * Checks if a Visit_label is already in the visits table and
     * if not, populate it with the legacy_label.
     *
     * @param string $visit         The Visit to insert
     * @param string $new_label     The new visit_label for the front end.
     * @param int    $subprojectID  The Subproject for this visit
     *
     * @return none, but as a side-effect potentially inserts into database
     */
    function insertVisitIfMissing($visit, $new_label, $subprojectID)
    {
        $vid = $this->DB->pselectOne(
            "SELECT ID FROM visits WHERE legacy_label=:VL",
            array('VL' => $visit)
        );
        if (!empty($vid)) {
            $this->insertRelIfMissing($vid,$subprojectID);
            return;
        }

        print "Inserting $visit --> $new_label\n";
        $x = $this->DB->insert("visits", array('legacy_label' => $visit, 'label'=>$new_label));
        $vid = $this->DB->pselectOne(
            "SELECT ID FROM visits WHERE legacy_label=:VL",
            array('VL' => $visit)
        );
        $this->insertRelIfMissing($vid,$subprojectID);
    }

    /**
     * Checks if a Visit_label is already in the Visit_Windows table and
     * if not, populate it with null windows.
     *
     * @param string $visit The Visit label to insert
     *
     * @return none, but as a side-effect potentially inserts into database
     */
    function insertRelIfMissing($vid, $subprojectID)
    {
        $verify = $this->DB->pselectOne(
            "SELECT 'x' FROM visits_subproject_project_rel WHERE VisitID=:vid AND SubprojectID=:sid",
            array('vid' => $vid, 'sid' => $subprojectID)
        );
        if (!empty($verify)) {
            return;
        }
        print "Inserting Visit:$vid for Subproject:$subprojectID\n";
        $x = $this->DB->insert("visits_subproject_project_rel", array('VisitID' => $vid, 'SubprojectID'=>$subprojectID));
    }

    /**
     * Runs the logic of the script.
     *
     * @return none
     */
    function run()
    {
        // Can't use Utility::getVisits() because that uses the Visit_Window table..
        $vls = $this->Config->getSetting("visitLabel");
        foreach (Utility::toArray($vls) as $visits) {
            $sid = $visits['@']['subprojectID'];
            foreach (Utility::toArray($visits['labelSet']['item']) as $item) {
                $visit = $item['@']['value'];
                $label = $item['#'];
                if (!empty($visit)) {
                    $this->insertVisitIfMissing($visit,$label,$sid);
                }
            };
        }
    }
}
// Don't run if we're doing the unit tests, the unit test will call run..
if (!class_exists('UnitTestCase')) {
    $Runner = new VisitsPopulator();
    $Runner->run();
}
?>
