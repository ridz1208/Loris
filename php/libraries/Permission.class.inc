<?php
/**
 * This file contains the Permission class.
 *
 * PHP Version 7
 *
 * @category Main
 * @package  Loris
 * @author   Rida Abou-Haidar <rida.loris@gmail.com>
 *           Tara Campbell <tara.campbell@mail.mcgill.ca>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/Loris/
 */

/**
 * The Loris Permission class
 *
 * @category Main
 * @package  Loris
 * @author   Rida Abou-Haidar <rida.loris@gmail.com>
 *           Tara Campbell <tara.campbell@mail.mcgill.ca>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/Loris/
 */
class Permission implements EntityObjectInterface
{
    /**
     * @var $ID int Identifier of the permission
     */
    private $ID;

    /**
     * @var $name string Shorthand Name of the permission
     */
    private $name;

    /**
     * @var $label string Front-end Name of the permission
     */
    private $label;

    /**
     * @var $roles array All roles this permission is affiliated with
     */
    private $roles;

    /**
     * @var $users array All users this permission is affiliated with
     */
    private $users;

    /**
     * Getter for the Identifier
     *
     * @return int $ID the Identifier
     */
    function getID() {
        return $this->ID;
    }

    /**
     * Setter for the Identifier
     *
     * @param $ID int Identifier
     *
     * @throws LorisException when the field is already set to avoid user altering
     *                        its value and trying to update or deleting it.
     *
     * @return void
     */
    function setID(int $ID) {
        // Limit accessibility to this value.
        // Prevent setting it to null or changing its value once it has been set,
        // this will prevent a user from modifying the ID before running it through
        // the update and/or delete functions.

        if (isset($this->ID)) {
            throw new LorisException(
                "The ID field can not be altered once it is set"
            );
        }
        $this->ID = $ID;
    }

    /**
     * Getter for the Name
     *
     * @return string $name Name of the permission
     */
    function getName() {
        return $this->name;
    }

    /**
     * Setter for the Name
     *
     * @param $name string Name of the permission
     *
     * @return void
     */
    function setName(string $name) {
        $this->name = $name;
    }

    /**
     * Getter for the Label
     *
     * @return string $label label of the permission
     */
    function getLabel() {
        return $this->label;
    }

    /**
     * Setter for the Label
     *
     * @param string $label Label of the permission
     *
     * @return void
     */
    function setLabel(string $label) {
        $this->label = $label;
    }

    /**
     * Getter for the Roles
     *
     * @return array $roles all roles affiliated with this permission
     */
    function getRoles() {
        return $this->roles;
    }

    /**
     * Setter for the Roles
     *
     * @param array $roles all roles affiliated with this permission
     *
     * @return void
     */
    function setRoles(array $roles) {
        $this->roles = $roles;
    }

    /**
     * Getter for the Users
     *
     * @return array $users all users affiliated with this permission
     */
    function getUsers() {
        return $this->users;
    }

    /**
     * Setter for the Roles
     *
     * @param array $users all users affiliated with this permission
     *
     * @return void
     */
    function setUsers(array $users) {
        $this->users = $users;
    }

    /**
     * Implements the php Magic Method __toString()
     *
     * @return string
     */
    function __toString() : string
    {
        $description =
            "This permission has 
                ID: $this->ID, 
                Name: $this->name, 
                Label: $this->label.";

        if (!empty($this->roles)) {
            //Should never get stuck in infinite loop if children are always
            //instantiated lazily
            $description .= "\nRoles affiliated with this permission are: \n";
            $description .= print_r($this->roles,true);
        }
        if (!empty($this->users)) {
            //Should never get stuck in infinite loop if children are always
            //instantiated lazily
            $description .= "\nUsers affiliated with this permission are: \n";
            $description .= print_r($this->users,true);
        }
        return $description;
    }

    /**
     * Implements the php Magic Method __clone()
     *
     * @return void
     */
    function __clone()
    {
        // No deep clones necessary for permissions
    }

    /**
     * Implements JsonSerializable::jsonSerialize to serialize the entire object
     *
     * @return array
     */
    function jsonSerialize() : array
    {
        $data = array();
        $data['ID'] = $this->ID;
        $data['name'] = $this->name;
        $data['label'] = $this->label;
        $data['roles'] = $this->roles;
        $data['users'] = $this->users;

        return $data;
    }
}