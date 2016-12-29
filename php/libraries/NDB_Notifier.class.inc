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
 * A class allowing to issue notification using several services including sms,
 * phone, email and loris in-site notifications.
 *
 *
 * @category Imaging
 * @package  Imaging
 * @author   Loris Team <loris.mni@bic.mni.mcgill.ca>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/Loris/
 */
class NDB_Notifier
{
    /**
     * @var string    get the current logged in user issuing the notification.
     */
    private $notifier;

    /**
     * @var array     get list of users to be notified and notification methods.
     */
    private $notified=array();

    /**
     * @var string    Module for which the notifier is setup
     */
    private $module;

    /**
     * @var string    Operation for which the notifier is setup
     */
    private $operation;

    /**
     * @var string    Message to be attached to email/sms/phone call
     */
    private $message;


    /**
     * NDB_Notifier constructor.
     *
     * @param string $module_name    module issuing notification
     * @param string $operation_type operation triggering notification
     * @param string $custom_message message overriding module-defined message
     *
     * @throws LorisException Exception thrown if module is not supported
     *                        by the notifier.
     */
    public function __construct($module_name,$operation_type,$custom_message=null){
        $this->module=$module_name;
        $this->operation=$operation_type;
        $this->notified=$this->_get2DListToNotify();
        $this->notifier=$this->_getLoggedInUser();

        if (empty($custom_message)) {
            switch ($module_name) {
                case 'media':
                    if ($operation_type==='download') {
                        $this->message =
                            "Hi {TARGET_USER},\n\n".
                            $this->notifier ." Downloaded";
                        break;
                    } elseif ($operation_type==='upload') {
                        $this->message = "";
                        break;
                    } else {
                        //empty to resume switch all the way to default
                    }
                case 'bvl_feedback':
                    if ($operation_type==='newTicket') {
                        $this->message = "";
                        break;
                    } else {
                        //empty to resume switch all the way to default
                    }
                default:
                    throw new LorisException(
                        "Notification has not been defined for this module and operation."
                    );
                    break;
            }
        } else {
            $this->message = $custom_message;
        }

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
     * Gets information of logged in user and returns a name-email string combination
     *
     * @return string   string in the form `First Last <email@domain.com>`
     */
    private function _getLoggedInUser(){
        $user =& User::singleton();
        $concat_name= $user->getFullname().' <'.$user->getData('Email').'>';
        return $concat_name;
    }

    /**
     * Gets 2D list of user emails/phone numbers from database grouped by
     * notification service
     *
     * @return array   2D list of user emails and/or phone numbers grouped by
     *                 available service.
     */
    private function _get2DListToNotify() {
        $DB     = Database::singleton();
        $user =& User::singleton();
        $site_concerned=  $user->getCenterID();
        // query needs to take into account the notified user permissions.
        $query = "SELECT 
                    u.Email as emailAddress, 
                    u.Phone as phoneNum, 
                    unr.email, 
                    unr.sms, 
                    unr.phone 
                  FROM users u 
                    JOIN users_notifications_rel unr ON (u.ID = unr.UserID) 
                    JOIN notification_modules nm ON (nm.ID=unr.NotificationID)
                    LEFT JOIN user_perm_rel upr ON (u.ID=upr.userID)
                  WHERE nm.module_name=:nm
                    AND nm.operation_type=:ot
                    AND (u.CenterID=:cid OR upr.permID=(SELECT permID 
                                    FROM permissions 
                                    WHERE code='access_all_profiles')
                        )
                    AND (unr.email ='Y' OR unr.sms='Y' OR unr.phone='Y')
                    ";
        $params = array(
            "nm"=>$this->module,
            "ot"=>$this->operation,
            "cid"=>$site_concerned
        );
        $result = $DB->pselect($query,$params);

        //parse $result and create 2D array
        $notification_list=array();
        foreach ($result as $k=>$row) {
            if ($row['email']==='Y') {
                $notification_list['email'][] = $row['emailAddress'];
            }
            if ($row['sms']==='Y') {
                $notification_list['sms'][] = $row['phoneNum'];
            }
            if ($row['phone']==='Y') {
                $notification_list['phone'][] = $row['phoneNum'];
            }
        }
        return $notification_list;
    }


    /**
     * Function to be overridden by module using the notification system
     *
     * @param bool $adminNotifier when true, sends notification as if triggered
     *                            by administrator not user.
     *
     * @return void
     */
    public function notify($adminNotifier=false) {

    }
}