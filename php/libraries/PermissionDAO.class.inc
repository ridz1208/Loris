<?php

/**
 * The Loris Permission Data Access Object class
 *
 * @category Main
 * @package  Loris
 * @author   Rida Abou-Haidar <rida.loris@gmail.com>
 *           Tara Campbell <tara.campbell@mail.mcgill.ca>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/Loris/
 */

class PermissionDAO extends EntityDAOAbstract
{
    /**
     * Stores Database being used
     *
     * @var    $DB Database
     * @access private
     */
    private $DB;

    // TODO: do DAOs communicate with each other ???
    /**
     * Stores the Role Data Access Object used in some functions
     *
     * @var $roleDAO RoleDAO
     * @access private
     */
    private $roleDAO;

    /**
     * Permission constructor
     *
     * @param Database $database database used for querying
     */
    function __construct(Database $database)
    {
        $this->DB = $database;
        $this->classType = Permission::class;
    }

    /**
     * Gets the full list of permissions from the database lazily
     * The lazy instantiation does not instantiate the following objects:
     *  - roles affiliated with permission
     *  - users affiliated with permission
     *
     * @return array Permission objects instantiated from database query
     */
    function getListLazy() : array
    {
        $permissions = array();
        $DBPermissions = $this->DB->pselect(
            "SELECT permID, code, description FROM permissions",
            array()
        );

        foreach ($DBPermissions as $DBPermission) {
            $permission = new Permission();
            $permission->setID($DBPermission['permID']);
            $permission->setName($DBPermission['code']);
            $permission->setLabel($DBPermission['description']);
            $permissions[] = $permission;
        }

        return $permissions;
    }

    /**
     * Gets the full list of permissions from the database eagerly
     * The eager instantiation instantiates the following objects:
     *  - roles affiliated with permission
     *  - users affiliated with permission
     *
     * @return array Permission objects instantiated from database query
     */
    function getListEager() : array
    {
        $permissions = array();

        // get permissions lazily
        $lazyPermissions = $this->getListLazy();

        // get permission-role relationships
        $DBPermissionRoles = $this->DB->pselect(
            "SELECT RoleID, PermissionID FROM role_permission_rel",
            array()
        );

        // get permission-user relationships
        $DBPermissionUsers = $this->DB->pselect(
            "SELECT userID, permID FROM user_perm_rel",
            array()
        );

        foreach ($lazyPermissions as $permission) {
            // clone the permission to keep original array immutable
            $newPermission = clone $permission;

            // load roles
            $roles=array();
            foreach ($DBPermissionRoles as $row) {
                if ($row['PermissionID']===$newPermission->getID()) {
                    $roles[] = $this->roleDAO->getSingleItemFromIDLazy(
                        $row['RoleID']
                    );
                }
            }

            //load users
            $users=array();
            foreach ($DBPermissionUsers as $row) {
                if ($row['permID']===$newPermission->getID()) {
                    $users[] = User::factory(
                        User::getUsernameFromID($row['userID'])
                    );
                }
            }

            $newPermission->setRoles($roles);
            $newPermission->setUsers($users);
            $permissions[] = $newPermission;
        }

        return $permissions;
    }

    /**
     * Gets the permission with ID specified in the parameter
     * The lazy instantiation does not instantiate the following objects:
     *  - roles affiliated with permission
     *  - users affiliated with permission
     *
     * @param int $permissionID unique Identifier for the permission
     *
     * @return Permission single object instantiated from database query.
     */
    function getSingleItemFromIDLazy($permissionID) : Permission
    {
        $DBPermission = $this->DB->pselectRow(
            "SELECT permID, code, description 
             FROM permissions
             WHERE permID=:PID",
            array("PID" => $permissionID)
        );
        $permission = new Permission();
        $permission->setID($DBPermission['permID']);
        $permission->setName($DBPermission['code']);
        $permission->setLabel($DBPermission['description']);
        $permissions[] = $permission;

        return $permission;
    }

    /**
     * Gets the permission with ID specified in the parameter
     * The eager instantiation instantiates the following objects:
     *  - roles affiliated with permission
     *  - users affiliated with permission
     *
     * @param int $permissionID unique Identifier for the permission
     *
     * @return Permission single object instantiated from database query.
     */
    function getSingleItemFromIDEager($permissionID) : Permission
    {
        $permission = clone $this->getSingleItemFromIDLazy($permissionID);

        // get permission-role relationships
        $DBPermissionRoles = $this->DB->pselect(
            "SELECT RoleID, PermissionID FROM role_permission_rel WHERE permID=:PID",
            array("PID" => $permissionID)
        );

        // get permission-user relationships
        $DBPermissionUsers = $this->DB->pselect(
            "SELECT userID, permID FROM user_perm_rel WHERE permID=:PID",
            array("PID" => $permissionID)
        );

        // load roles
        $roles=array();
        foreach ($DBPermissionRoles as $row) {
            $roles[] = $this->roleDAO->getSingleItemFromIDLazy($row['RoleID']);
        }

        //load users
        $users=array();
        foreach ($DBPermissionUsers as $row) {
            $users[] = User::factory(User::getUsernameFromID($row['userID']));
        }

        $permission->setRoles($roles);
        $permission->setUsers($users);
        return $permission;
    }

    /**
     * Gets the permission with Name specified in the parameter
     *
     * @param string $permissionName unique Name for the permission
     *
     * @return Permission single object instantiated from database query.
     */
    function getSingleItemFromNameLazy($permissionName) : Permission
    {
        $DBPermission = $this->DB->pselectRow(
            "SELECT permID, code, description 
             FROM permissions
             WHERE permID=:PID",
            array("code" => $permissionName)
        );
        $permission = new Permission();
        $permission->setID($DBPermission['permID']);
        $permission->setName($DBPermission['code']);
        $permission->setLabel($DBPermission['description']);
        $permissions[] = $permission;

        return $permission;
    }

    /**
     * Implements create function to add a new permission to the database
     *
     * @param EntityObjectInterface $permission
     *
     * @return bool Successful creation confirmation
     */
    function concreteCreate(EntityObjectInterface $permission) : bool
    {
        //Define database tables involved
        $permissionTable = 'permissions';
        $permissionRoleTable = 'role_permission_rel';
        $permissionUserTable = 'user_perm_rel';

        //Ignore ID if forcibly set since it is an auto-increment in the database
        //Breakdown the object into it's destination tables

        $permissionData = array();
        $permissionData['code'] = $permission->getName();
        $permissionData['description'] = $permission->getLabel();

        try {
            $this->DB->insert($permissionTable, $permissionTable);
        } catch (DatabaseException $e) {
            return false;
        }

        //gets the ID used in the rest of the function
        $insertionID = $this->DB->getLastInsertId();

        foreach ($permission->getRoles() as $role) {
            $newRow['RoleID'] = $role->getID();
            $newRow['PermissionID'] = $insertionID;
            try {
                $this->DB->insert($permissionRoleTable, $newRow);
            } catch (DatabaseException $e) {
                return false;
            }
        }

        //TODO: USER - change to proper OOP when user class is updated
        foreach ($permission->getUsers() as $user) {
            $newRow['userID'] = $user->getId();
            $newRow['permID'] = $insertionID;
            try {
                $this->DB->insert($permissionUserTable, $newRow);
            } catch (DatabaseException $e) {
                return false;
            }
        }

        return true;
    }

    /**
     * Implements update function to update values for a permission
     * already in the database
     *
     * @param EntityObjectInterface $postUpdate
     *
     * @return bool Successful update confirmation
     */
    function concreteUpdate(EntityObjectInterface $postUpdate) : bool
    {
        // TODO: breakdown code below into independent functions by concern

        // Given that ID is not modifiable once set, this ID will be the same as
        // the original one.
        $permissionID = $postUpdate->getID();

        // Define database tables involved
        $permissionTable = 'permissions';
        $permissionRoleTable = 'role_permission_rel';
        $permissionUserTable = 'user_perm_rel';

        // get original values to compare
        $preUpdate = $this->getSingleItemFromIDLazy($postUpdate->getID());

        // Start - compute differences for roles and users
        $preRoles = $preUpdate->getRoles();
        $postRoles = $postUpdate->getRoles();
        // This check can definitely be improved.
        $roleDiff = array_merge(
            array_diff($preRoles, $postRoles),
            array_diff($postRoles, $preRoles)
        );

        $preUsers = $preUpdate->getRoles();
        $postUsers = $postUpdate->getRoles();
        // This check can definitely be improved.
        $userDiff = array_merge(
            array_diff($preUsers, $postUsers),
            array_diff($postUsers, $preUsers)
        );

        if (!empty($roleDiff)) {
            //delete all entries with this permission id and re-insert new values
            try {
                $this->DB->delete(
                    $permissionRoleTable,
                    array('PermissionID'=>$permissionID)
                );
            } catch (DatabaseException $e) {
                return false;
            }
            foreach ($postRoles as $role) {
                $newRow['RoleID'] = $role->getID();
                $newRow['PermissionID'] = $permissionID;
                try {
                    $this->DB->insert($permissionRoleTable, $newRow);
                } catch (DatabaseException $e) {
                    return false;
                }
            }
        }

        if (!empty($userDiff)) {
            //delete all entries with this permission id and re-insert new values
            try {
                $this->DB->delete(
                    $permissionUserTable,
                    array('permID'=>$permissionID)
                );
            } catch (DatabaseException $e) {
                return false;
            }
            //TODO: USER - change to proper OOP when user class is updated
            foreach ($postUsers as $user) {
                $newRow['userID'] = $user;
                $newRow['permID'] = $permissionID;
                try {
                    $this->DB->insert($permissionUserTable, $newRow);
                } catch (DatabaseException $e) {
                    return false;
                }
            }
        }
        // End - compute differences for roles and users

        // Start - entity table update
        $permissionData = array();
        if ($preUpdate->getName() !== $postUpdate->getName()) {
            $permissionData['code'] = $postUpdate->getName();
        }
        if ($preUpdate->getLabel() !== $postUpdate->getLabel()) {
            $permissionData['description'] = $postUpdate->getLabel();
        }

        if (!empty($permissionData)) {
            try {
                $this->DB->update(
                    $permissionTable,
                    $permissionData,
                    array('permID'=>$permissionID)
                );
            } catch (DatabaseException $e) {
                return false;
            }
        }
        // End - entity table update

        return true;
    }

    /**
     * Implements delete function to removes a permission from the database
     *
     * @param EntityObjectInterface $permission
     *
     * @return bool Successful deletion confirmation
     */
    function concreteDelete(EntityObjectInterface $permission) : bool
    {
        // Given that ID is not modifiable once set, this ID will be the same as
        // the original one.
        $permissionID = $permission->getID();

        // Define database tables involved
        $permissionTable = 'permissions';
        $permissionRoleTable = 'role_permission_rel';
        $permissionUserTable = 'user_perm_rel';

        try {
            $this->DB->delete(
                $permissionUserTable,
                array('permID' => $permissionID)
            );
            $this->DB->delete(
                $permissionRoleTable,
                array('PermissionID' => $permissionID)
            );
            $this->DB->delete(
                $permissionTable,
                array('permID' => $permissionID)
            );
        } catch (DatabaseException $e) {
            return false;
        }

        return true;
    }
}