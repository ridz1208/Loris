<?php
require_once(__DIR__ . '/../php/NDB_Form_new_profile.class.inc');
//strictly for convenience client-side; real check is made in getPiiAccessToken.php
//user must be from a site that is allowed to talk to the PII

$new_profile = new NDB_Form_New_Profile();

header("content-type:application/json");
echo json_encode($new_profile->user_site_has_pii_access());