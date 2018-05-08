<?php

/**
 * The Loris Permission Controller class
 *
 * @category Main
 * @package  Loris
 * @author   Rida Abou-Haidar <rida.loris@gmail.com>
 *           Tara Campbell <tara.campbell@mail.mcgill.ca>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/Loris/
 */
class PermissionController
{
    /**
     * Stores the Data Access Object for Permissions
     *
     * @var $permissionDAO PermissionDAO
     * @access private
     */
    private $permissionDAO;

    /**
     * Permission constructor.
     *
     * @param Database $database database
     */
    function __construct(Database $database)
    {
        $this->permissionDAO = new PermissionDAO($database);
    }

    /**
     * Gets the list of permissions in the database. Eager function, Users and Roles
     * affiliated with this permission are instantiated.
     *
     * @return array Associative array in the form $permissionID=>$permissionName
     */
    function getAll()
    {
        return $this->permissionDAO->getListEager();
    }

    /**
     * Gets the list of permission labels in the database.
     *
     * @return array Associative array in the form $permissionID=>$permissionLabel
     */
    function getLabels()
    {
        $permissions = $this->permissionDAO->getListLazy();
        $labels = array();
        foreach ($permissions as $permission) {
            $labels[$permission->getID()] = $permission->getLabel();
        }

        return $labels;
    }

    /**
     * Gets the list of permission names in the database.
     *
     * @return array Associative array in the form $permissionID=>$permissionName
     */
    function getNames()
    {
        $permissions = $this->permissionDAO->getListLazy();
        $names = array();
        foreach ($permissions as $permission) {
            $labels[$permission->getID()] = $permission->getName();
        }

        return $names;
    }

    /**
     * Gets the role names associated with a permission
     *
     * @param Permission $permission the permission
     *
     * @return array Associative array in the form $roleID=>$roleName
     */
    function getRoleNames($permission)
    {
        $roleNames = array();
        foreach ($permission->getRoles() as $role) {
            $roleIDs[$role->getID()] = $role->getName();
        }

        return $roleNames;
    }

    /**
     * Gets the user names associated with a permission
     *
     * @param Permission $permission the permission
     *
     * @return array Associative array in the form $userID=>$userName
     */
    function getUserNames($permission)
    {
        $userNames = array();
        foreach ($permission->getUsers() as $user) {
            //TODO: USER - Convert to new format when user class is updated
            //current implementation, users are just IDs
            $userNames[$user] = User::getUsernameFromID($user);
        }

        return $userNames;
    }















    /**
     * Gets the ID of a permission given its name
     *
     * @param string $permissionName the permission name for which the ID is needed
     *
     * @throws LorisException if permission does not exist
     *
     * @return int
     */
    function getPermissionIDFromName($permissionName)
    {
        if (!$this->isPermission($permissionName)) {
            throw new LorisException(
                "Could not retrieve the permission ID for 
                permission '$permissionName'"
            );
        }

        $permissionID = $this->DB->pselectOne(
            "SELECT permID
         FROM permissions
         WHERE code=:PN",
            array("PN" => $permissionName)
        );
        return $permissionID;
    }

    /**
     * Gets the NAME of a permission given its ID
     *
     * @param int $permissionID the permission ID for which the name is needed
     *
     * @throws LorisException if permission ID does not exist
     *
     * @return string
     */
    function getPermissionNameFromID($permissionID)
    {
        $permissionName = $this->DB->pselectOne(
            "SELECT code
         FROM permissions
         WHERE permID=:PID",
            array("PID" => $permissionID)
        );

        if (empty($permissionName)) {
            throw new LorisException(
                "Could not retrieve the permission name for 
                permission ID '$permissionID'"
            );
        }
        return $permissionName;
    }

    /**
     * Checks if the string is a permission within the database
     *
     * @param string $permissionName the permission to be checked
     *
     * @return boolean
     */
    function isPermission($permissionName)
    {
        $permissions = $this->getPermissions();
        if (in_array($permissionName, $permissions, true)) {
            return true;
        }
        return false;
    }

    /**
     * Gets all the users' permissions based on their roles
     *
     * @param array $roleIDs role set associated with a user
     *
     * @return array associative array ($permissionID=>$permissionName) of
     *               permissions associated with the given permission set
     */
    function getPermissionsFromRoles($roleIDs)
    {
        $roleObject  = new \Role($this->DB);
        $permissions = $this->getPermissions();

        $userPermissions = array();

        foreach ($roleIDs as $roleID) {
            $rolePermissions = $roleObject->getRolePermissionIDs($roleID);
            foreach ($rolePermissions as $permissionID) {
                //if permissions overlap between roles, this will
                //just overwrite data with the same data
                $userPermissions[$permissionID] = $permissions[$permissionID];
            }
        }

        return $userPermissions;
    }
}