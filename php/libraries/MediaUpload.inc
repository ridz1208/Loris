<?php

/**
 * Media uploader: copied and modified from the media module
 *  easier to reproduce the functionality here than to make an ajax call
 */

/**
 * Handles the media upload process
 *
 * @throws DatabaseException
 *
 * @return string: the Media module path to the uploaded file
 */
function uploadMediaFile($pscid, $visit, $instrument, $site, $dateTaken, $comments, $file)
{
    $uploadNotifier = new NDB_Notifier(
        "media",
        "upload"
    );

    $db = Database::singleton();
    $config = NDB_Config::singleton();
    $user = User::singleton();

    //no need to check this permission: we allow upload and update to anyone who can edit this instrument
//    if (!$user->hasPermission('media_write')) {
//        header("HTTP/1.1 403 Forbidden");
//        exit;
//    }

    // Validate media path and destination folder
    $mediaPath = $config->getSetting('mediaPath');

    if (!isset($mediaPath)) {
        throw new LorisException("Error! Media path is not set in Loris Settings!");
    }

    if (!file_exists($mediaPath)) {
        throw new LorisException("Error! The upload folder '$mediaPath' does not exist!");
    }

    // Process posted data
    //$pscid      = isset($_POST['pscid']) ? $_POST['pscid'] : null;
    //$visit      = isset($_POST['visitLabel']) ? $_POST['visitLabel'] : null;
    //$instrument = isset($_POST['instrument']) ? $_POST['instrument'] : null;
    //$site       = isset($_POST['forSite']) ? $_POST['forSite'] : null;
    //$dateTaken  = isset($_POST['dateTaken']) ? $_POST['dateTaken'] : null;
    //$comments   = isset($_POST['comments']) ? $_POST['comments'] : null;

    // If required fields are not set, show an error
//    if (!isset($_FILES) || !isset($pscid) || !isset($visit) || !isset($site)) {
//        showError("Please fill in all required fields!");
//        return;
//    }

    $fileName = preg_replace('/\s/', '_', $file["name"]);
    $fileType = $file["type"];
    $extension = pathinfo($fileName)['extension'];

    if (empty($extension)) {
        throw new LorisException("Please make sure your file has a valid extension!");
    }

    $userID = $user->getData('UserID');

    $sessionID = $db->pselectOne(
        "SELECT s.ID as session_id FROM candidate c " .
        "LEFT JOIN session s USING(CandID) WHERE c.PSCID = :v_pscid AND " .
        "s.Visit_label = :v_visit_label AND s.CenterID = :v_center_id",
        [
            'v_pscid' => $pscid,
            'v_visit_label' => $visit,
            'v_center_id' => $site,
        ]
    );

    if (!isset($sessionID) || count($sessionID) < 1) {
        throw new LorisException("Error! A session does not exist for candidate '$pscid'' " .
            "and visit label '$visit'.");
    }

    // Build insert query
    $query = [
        'session_id' => $sessionID,
        'instrument' => $instrument,
        'date_taken' => $dateTaken,
        'comments' => $comments,
        'file_name' => $fileName,
        'file_type' => $fileType,
        'data_dir' => $mediaPath,
        'uploaded_by' => $userID,
        'hide_file' => 0,
        'date_uploaded' => date("Y-m-d H:i:s"),
    ];

    if (move_uploaded_file($file["tmp_name"], $mediaPath . $fileName)) {
        $existingFiles = getFilesList();
        $idMediaFile = array_search($fileName, $existingFiles);
        try {
            // Override db record if file_name already exists
            if ($idMediaFile) {
                $db->update('media', $query, ['id' => $idMediaFile]);
            } else {
                $db->insert('media', $query);
            }
            $uploadNotifier->notify(array("file" => $fileName));
        } catch (DatabaseException $e) {
            throw new LorisException("Could not upload the file. Please try again!");
        }
    } else {
        throw new LorisException("Could not upload the file. Please try again!");
    }
    $baseURL = NDB_Factory::singleton()->settings()->getBaseURL();
    return '/media/ajax/FileDownload.php?File=' . urlencode($fileName);  //absolute url without the hostname is fine
}


/**
 * Returns an array of (id, file_name) pairs from media table
 *
 * @return array
 * @throws DatabaseException
 */
function getFilesList()
{
    $db = Database::singleton();
    $fileList = $db->pselect("SELECT id, file_name FROM media", []);

    $mediaFiles = [];
    foreach ($fileList as $row) {
        $mediaFiles[$row['id']] = $row['file_name'];
    }

    return $mediaFiles;
}
