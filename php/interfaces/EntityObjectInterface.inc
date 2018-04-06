<?php

/**
 * This class contains the functions to be implemented by any LORIS Entity Object
 *
 * PHP Version 7
 *
 * @category Main
 * @package  Loris
 * @author   Rida Abou-Haidar <rida.loris@gmail.com>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/Loris/
 */
interface EntityObjectInterface extends JsonSerializable
{
    /**
     * JsonSerializable::jsonSerialize to serialize the entire object
     *
     * @link http://php.net/manual/en/jsonserializable.jsonserialize.php
     *
     * @return array
     */
    function jsonSerialize() : array;

    /**
     * PHP Magic Method __toString()
     * This function is not called directly but is magically used by
     * PHP when the object is used as a string parameter
     *
     * @link http://php.net/manual/en/language.oop5.magic.php
     *
     * @return string
     */
    function __toString() : string;

    /**
     * PHP Magic Method __clone()
     * This function is not called directly but is magically used by
     * PHP when the object is used as a parameter of `clone`
     *
     * @link official http://php.net/manual/en/language.oop5.cloning.php
     * @link http://jacob-walker.com/blog/php-clone-and-shallow-vs-deep-copying.html
     *
     * @return void
     */
    function __clone();
}