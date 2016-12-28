<?php
/**
 *
 *
 * PHP Version 7
 *
 * @category Imaging
 * @package  Imaging
 * @author   Loris Team <loris.mni@bic.mni.mcgill.ca>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/Loris/
 */

/**
 * A static class to encapsulate the notification spooling system
 *
 * @category Imaging
 * @package  Imaging
 * @author   Loris Team <loris.mni@bic.mni.mcgill.ca>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/Loris/
 */
class NDB_Notifier extends NDB_Page
{
    /**
     * @var string    get the current logged in user issuing the notification.
     */
    private $notifier;

    /**
     * @var array     get list of users to be notified from database.
     */
    private $notified=array();









    /**
     * NDB_Notifier constructor.
     *
     * @param string $module_name    module issuing notification
     * @param string $operation_type operation triggering notification
     *
     * @throws LorisException Exception thrown if module is not supported
     *                        by the notifier.
     */
    public function __construct($module_name, $operation_type){
        switch ($module_name) {
            case 'media':
                _notifyMedia($operation_type);
                break;
            case 'bvl_feedback':
                _notifyBVLFeedback($operation_type);
                break;
            default:
                throw new LorisException(
                    "Notification has not been defined for this module."
                );
        }
        return;
    }








    /**
     * getter for user issuing notification
     *
     * @return string   User issuing notification
     */
    public function getNotifier(){
        return $this->notifier;
    }

    /**
     * getter for users receiving notification
     *
     * @return array    Users receiving notifications from this module
     */
    public function getNotified(){
        return $this->notified;
    }

    /**
     * setter setting notifier as administrators
     *
     * @return void
     * TODO
     */
    private function _setNotifierAdmin() {

        $this->notifier;
    }

    /**
     *
     */
    private function _get2DListNotified() {
        $DB     = Database::singleton();
        $query = "SELECT ";
        $params = array();
        $result = $DB->pselect($query,$params);
    }


    /**
     * Function to be overridden by module using the notification system
     *
     * @return void
     */
    public function notify() {

    }
}