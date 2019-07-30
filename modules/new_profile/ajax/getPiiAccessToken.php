<?php
require_once(__DIR__ . '/../php/NDB_Form_new_profile.class.inc');
//authentication
//handled by framework: 401 if not logged-in

$new_profile = new NDB_Form_New_Profile();

//authorization
//check new profile permission, i.e. _hasAccess in the module's main classe
if (!$new_profile->_hasAccess()) {
    header("HTTP/1.1 403 Forbidden");
    exit;
}

//CSRF protection
if (!FSG_Utility::verify_user_csrf_token($_GET['csrf_token'])) {
    header("HTTP/1.1 403 Forbidden");
    echo 'CSRF token missing or incorrect.';
    exit;
}

//must be from a site that is allowed to talk to the PII
if (!$new_profile->user_site_has_pii_access()) {
    header("HTTP/1.1 403 Forbidden");
    echo 'User is not associated with an allowed site.';
    exit;
}


//make the call to the PII
$config = NDB_Config::singleton();
$base_url = $config->getSetting('pii_api_base_url');
$url = $base_url . '/api/get_one_time_token';
$api_key = $config->getSetting('pii_api_key');

$postdata = http_build_query(['api_token' => $api_key]);

$opts = array('http' =>
    array(
        'method' => 'POST',
        'header' => 'Content-type: application/x-www-form-urlencoded',
        'content' => $postdata
    )
);

$context = stream_context_create($opts);

$result = file_get_contents($url, false, $context);

if ($result !== FALSE) {
    echo json_decode($result)->token;
} else {
    throw new \LorisException('Error getting PII access token');
}