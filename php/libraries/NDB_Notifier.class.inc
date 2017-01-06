<?php
/**
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
 * @category Imaging
 * @package  Imaging
 * @author   Loris Team <loris.mni@bic.mni.mcgill.ca>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/Loris/
 */
class NDB_Notifier
{
    /**
     * Get the current logged in user issuing the notification.
     *
     * @var string
     */
    private $_notifier;

    /**
     * Get the admin user issuing the notification.
     *
     * @var string
     */
    private $_adminNotifier;

    /**
     * Get list of users to be notified and notification methods.
     *
     * @var array
     */
    private $_notified =array();

    /**
     * Module for which the notifier is setup
     *
     * @var string
     */
    private $_module;

    /**
     * Operation for which the notifier is setup
     *
     * @var string
     */
    private $_operation;

    /**
     * Template to use for email/sms/phone
     *
     * @var string
     */
    private $_template;

    /**
     * Data to be sent to the template fo filling
     *
     * @var array
     */
    private $_tpl_data =array();

    /**
     * NDB_Notifier constructor.
     *
     * @param string $module_name    module issuing notification
     * @param string $operation_type operation triggering notification
     * @param array  $extra_tpl_data additional variables to be sent to the tpl.
     *
     * @throws LorisException Exception thrown if module is not supported
     *                        by the notifier.
     */
    public function __construct(
        $module_name,
        $operation_type,
        $extra_tpl_data=array()
    ) {
        $this->_module        =$module_name;
        $this->_operation     =$operation_type;
        $this->_notified      =$this->_get2DListToNotify();
        $this->_notifier      =$this->_getLoggedInUser();
        $this->_adminNotifier =$this->_getAdminUser();
        $this->_tpl_data      = $this->_tpl_data + $extra_tpl_data;

        switch ($module_name) {
        case 'media':
            if ($operation_type==='download') {
                $this->_template ="notifier_media_download.tpl";
                break;
            } elseif ($operation_type==='upload') {
                $this->_template ="notifier_media_upload.tpl";
                break;
            } else {
                throw new LorisException(
                    "Notifications have not been defined for the ".
                    "$module_name $operation_type operation."
                );
                break;
            }
        case 'bvl_feedback':
            if ($operation_type==='newTicket') {
                break;
            } else {
                throw new LorisException(
                    "Notifications have not been defined for the ".
                    "$module_name $operation_type operation."
                );
                break;
            }
        default:
            throw new LorisException(
                "Notifications have not been defined for this module and operation."
            );
                break;
        }
    }

    /**
     * Getter for user issuing notification
     *
     * @return string   User issuing notification
     */
    public function getNotifier()
    {
        return $this->_notifier;
    }

    /**
     * Getter for users receiving notification
     *
     * @return array    Users receiving notifications from this module
     */
    public function getNotified()
    {
        return $this->_notified;
    }

    /**
     * Gets information of logged in user and returns a name-email string combination
     *
     * @return string   string in the form `First Last <email@domain.com>`
     */
    private function _getLoggedInUser()
    {
        $user        =& User::singleton();
        $concat_name = $user->getFullname().' <'.$user->getData('Email').'>';
        return $concat_name;
    }

    /**
     * Gets information of admin user and returns a name-email string combination
     *
     * @return string   string in the form `First Last <email@domain.com>`
     */
    private function _getAdminUser()
    {
        $DB          = Database::singleton();
        $result      = $DB->pselectRow(
            "SELECT Real_name, Email FROM users WHERE UserID='admin'",
            array()
        );
        $concat_name = $result['Real_name'].' <'.$result['Email'].'>';
        return $concat_name;
    }

    /**
     * Gets 2D list of user emails/phone numbers from database grouped by
     * notification service
     *
     * @return array   2D list of user emails and/or phone numbers grouped by
     *                 available service.
     */
    private function _get2DListToNotify()
    {
        $DB   = Database::singleton();
        $user =& User::singleton();
        $site_concerned =  $user->getCenterID();
        // query needs to take into account the notified user permissions.
        $query  = "SELECT 
                    u.Real_name as name
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
                   "nm"  => $this->_module,
                   "ot"  => $this->_operation,
                   "cid" => $site_concerned,
                  );
        $result = $DB->pselect($query, $params);

        //parse $result and create 2D array
        $notification_list =array();
        foreach ($result as $k=>$row) {
            if ($row['email']==='Y') {
                $notification_list['email'][$row['name']] = $row['emailAddress'];
            }
            if ($row['sms']==='Y') {
                $notification_list['sms'][$row['name']] = $row['phoneNum'];
            }
            if ($row['phone']==='Y') {
                $notification_list['phone'][$row['name']] = $row['phoneNum'];
            }
        }
        return $notification_list;
    }


    /**
     * Function to be overridden by module using the notification system
     *
     * @param bool   $adminNotifier  when true, sends notification as if
     *                  triggered by administrator not user.
     * @param string $custom_message message overriding module-defined message
     * @param array  $extra_tpl_data additional variables to be sent to the template.
     *
     * @return void
     */
    public function notify(
        $adminNotifier=false,
        $custom_message=null,
        $extra_tpl_data=array()
    ) {
        $this->_tpl_data = $this->_tpl_data + $extra_tpl_data;

        if (!empty($custom_message)) {
            $this->_template ="notifier_custom.tpl";
        }
        if ($adminNotifier) {
            $this->_notifier =$this->_adminNotifier;
        }

        if (!empty($this->_notified['email'])) {
            $this->_sendEmails();
        }
        if (!empty($this->_notified['sms'])) {
            $this->_sendSMS();
        }
        if (!empty($this->_notified['phone'])) {
            $this->_sendPhone();
        }
    }

    /**
     * Send emails to concerned users.
     *
     * @return void
     *
     * TODO add validation for email sent/failed
     */
    private function _sendEmails()
    {
        foreach ($this->_notified['email'] as $name=>$email) {
            $this->_tpl_data['notified_user'] =$name." <".$email.">";
            $this->_tpl_data['notifier_user'] =$this->_notifier;
            Email::send(
                $email,
                $this->_template,
                $this->_tpl_data
            );
        }
    }

    /**
     * Send sms to concerned users.
     *
     * @return void
     *
     * TODO add validation
     */
    private function _sendSMS()
    {

    }

    /**
     * Send phone call to concerned users.
     *
     * @return void
     *
     * TODO add validation
     */
    private function _sendPhone()
    {

    }
}