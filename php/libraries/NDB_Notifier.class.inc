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
    var $notifier;

    /**
     * @var array     get list of users to be notified from database.
     */
    var $notified=array();

    /**
     * Function to be overridden by module using the notification system
     *
     * @param string $operation_type operation triggering notification
     *
     * @return void
     *
     * @throws LorisException when notify is not personalized
     */
    function _notify($operation_type){
        throw new LorisException(
            "Notification has not been defined for this module."
        );
    }

    /**
     * getter for user issuing notification
     *
     * @return string   User issuing notification
     */
    function _getNotifier(){
        return $this->notifier;
    }

    /**
     * getter for users receiving notification
     *
     * @return array    Users receiving notifications from this module
     */
    function _getNotified(){
        return $this->notified;
    }

}