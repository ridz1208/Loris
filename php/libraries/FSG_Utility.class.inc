<?php

class FSG_Utility
{
    const participant_status_active = 1;
    const participant_status_screen_failure = 14;
    const participant_status_passed_screening = 15;

    public static function array_any($predicate, $array)
    {
        foreach ($array as $element) {
            if ($predicate($element)) {
                return true;
            }
        }
        return false;
    }

    public static function update_participant_status($candID, $status, $suboption = null, $reason = '')
    {
        $currentUser =& User::singleton($_SESSION['State']->getUsername());
        $user_id = $currentUser->getData("UserID");

        $updateValues = [
            'participant_status' => $status,
            'participant_suboptions' => $suboption,
            'reason_specify' => $reason,
            'CandID' => $candID,
            'entry_staff' => $user_id,
        ];

        $db = Database::singleton();
        $exists = $db->pselectOne(
            "SELECT * from participant_status WHERE CandID=:candid",
            ['candid' => $candID]
        );

        if ($exists === null || empty($exists)) {
            $db->insert('participant_status', $updateValues);
        } else {
            $db->update(
                'participant_status',
                $updateValues,
                ['CandID' => $candID]
            );
        }

        $db->insert('participant_status_history', $updateValues);
    }

    public static function get_candidate_status($candID) {
        $db = Database::singleton();
        $status    = $db->pselectOne(
            "SELECT participant_status 
        FROM participant_status WHERE CandID=:candid",
            array('candid' => $candID)
        );

        if (!$status) {
            $status = self::participant_status_active;
        }

        return $status;
    }

    //returns a CSRF token based on the user's password
    //so will not change very often...
    public static function get_user_csrf_token() {
        //get the user's password hash as the secret key
        $key = User::singleton()->getData('Password_hash');
        //TODO: is there a better secret to use? maybe a random one stored in the session?
        return hash_hmac('sha256', 'loris-csrf', $key, false);
    }

    public static function verify_user_csrf_token($token) {
        $correctToken = self::get_user_csrf_token();
//        //remove unprintable characters (... not sure why, perhaps UTF8 BOM?)
//        $token = preg_replace('/[[:^print:]]/', '', $token);
        return hash_equals($correctToken, $token);
    }


}