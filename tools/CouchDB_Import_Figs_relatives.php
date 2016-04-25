<?php

/**
 * Created by PhpStorm.
 * User: Rida Abou-Haidar
 * Date: 25/04/16
 * Time: 12:24 PM
 */
require_once __DIR__ . "/../vendor/autoload.php";
require_once 'generic_includes.php';
require_once 'CouchDB.class.inc';
require_once 'Database.class.inc';
class CouchDB_Import_Figs_relatives{
    var $SQLDB; // reference to the database handler, store here instead
    // of using Database::singleton in case it's a mock.
    var $CouchDB; // reference to the CouchDB database handler


}