<?php declare(strict_types=1);
/**
 * This class takes on the role of both controller and DAO of users while trying
 * to use the user object as a data instance only
 */

use \LORIS\StudyEntities\User;

class UserController extends \LORIS\Data\ProvisionerInstance
{
    private \Database $db;

    public function __construct()
    {
        $this->db = \NDB_Factory::singleton()->database();
    }

    public function getUserFromUsername(string $username) : User
    {
        $mainQuery = $this->getBaseQuery();
        $query = $mainQuery." WHERE username=:un";

        $userRow = $this->db->pselectRow($query,["un"=>$username]);
        if(empty($userRow)) {
            throw new \NotFound("User with username: $username not found");
        }

        $user = $this->getInstanceFromSQL($userRow);
        $user = $this->withNestedEntities($user);

        return $user;
    }

    protected function getAllInstances(): \Traversable
    {
        $mainQuery=$this->getBaseQuery();
        $userData = $this->db->pselectWithIndexKey($mainQuery,[],'ID');

        $users = [];
        foreach ($userData as $id=>$userInfo) {
            $user = $this->getInstanceFromSQL($userInfo);
            $user = $this->withNestedEntities($user);

            $users[$id] = $user;
        }

        return new \ArrayIterator($users);

    }

    protected function getBaseQuery() : string
    {
        return 'SELECT
                ID,
                UserID as username
                First_name,
                Last_name,
                Institution,
                Email,
                Active,
                PasswordChangeRequired,
                Pending_approval,
                account_request_date
             FROM users
            ';
    }

    protected function withNestedEntities($user) : User
    {
        $eagerUser = clone $user;
        // This makes for 3 queries per user, it might be better to query all the
        // data and group it in the future to avoid 3n+1 queries
        $siteQuery = 'SELECT
                         p.CenterID,
                         Name
                      FROM psc p
                         JOIN user_psc_rel USING (CenterID)
                      WHERE UserID=:UID';
        $projectQuery = 'SELECT
                         p.ProjectID,
                         Name
                      FROM Project p
                         JOIN user_project_rel USING (ProjectID)
                      WHERE UserID=:UID';
        $permissionQuery = 'SELECT
                                p.permID,
                                code
                            FROM permissions p
                                JOIN user_perm_rel pr USING (permID)
                            WHERE pr.userID=:UID';

        $siteDB = $this->db->pselectColWithIndexKey(
            $siteQuery,
            ["UID"=>$user->ID],
            'CenterID'
        );
        $projectDB = $this->db->pselectColWithIndexKey(
            $projectQuery,
            ["UID"=>$user->ID],
            'ProjectID'
        );
        $permissionDB = $this->db->pselectColWithIndexKey(
            $permissionQuery,
            ["UID"=>$user->ID],
            'PermID'
        );

        $sites = [];
        foreach ($siteDB as $centerID=>$centerName) {
            $sites[] = \Site::singleton($centerID);
        }
        $projects = [];
        foreach ($projectDB as $projectID=>$projectName) {
            $projects[] = \Project::singleton($projectName);
        }
        $permissions = [];
        foreach ($permissionDB as $permissionID=>$code) {
            $permissions[] = \Permission::singleton($permissionID);
        }

        $eagerUser->setSites($sites);
        $eagerUser->setProjects($projects);
        $eagerUser->setPermissions($permissions);

        return $eagerUser;
    }

    protected function getInstanceFromSQL($userInfo) : User
    {
        $user = new User();
        $user->ID = $userInfo['ID'];
        $user->username = $userInfo['username'];
        $user->firstName = $userInfo['First_name'];
        $user->lastName = $userInfo['Last_name'];
        $user->institution = $userInfo['Institution'];
        $user->email = $userInfo['Email'];
        $user->active = $userInfo['Active'] === 'Y';
        $user->passwordChangeRequired = $userInfo['PasswordChangeRequired'] === 1;
        $user->pendingApproval = $userInfo['Pending_approval'] === 'Y';
        $user->accountRequestDate = $userInfo['account_request_date'];

        return $user;
    }
}
