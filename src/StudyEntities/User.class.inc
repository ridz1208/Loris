<?php declare(strict_types=1);

namespace LORIS\StudyEntities;

class User implements \LORIS\Data\DataInstance
{
    public int $ID;
    public string $username;
    public string $firstName;
    public string $lastName;
    public string $institution;
    public string $email;
    public bool $active;
    public bool $passwordChangeRequired;
    public bool $pendingApproval;
    public string $accountRequestDate;
    protected array $sites;
    protected array $projects;
    protected array $permissions;

    public function jsonSerialize()
    {
        $obj = [
            'username'               => $this->username,
            'firstName'              => $this->firstName,
            'lastName'               => $this->lastName,
            'institution'            => $this->institution,
            'email'                  => $this->email,
            'active'                 => $this->active,
            'passwordChangeRequired' => $this->passwordChangeRequired,
            'pendingApproval'        => $this->pendingApproval,
            'accountRequestDate'     => $this->accountRequestDate,
            'sites'                  => $this->sites,
            'projects'               => $this->projects,
            'permissions'            => $this->permissions,
        ];

        return $obj;
    }

    public function setSites(array $sites) : void
    {
        foreach ($sites as $site) {
            if (!$site instanceof \Site) {
                throw new \LorisException("Incorrect Site parameter");
            }
        }

        $this->sites = $sites;
    }

    public function setProjects(array $projects) : void
    {
        foreach ($projects as $project) {
            if (!$project instanceof \Project) {
                throw new \LorisException("Incorrect Project parameter");
            }
        }

        $this->projects = $projects;
    }

    public function setPermissions(array $permissions) : void
    {
        foreach ($permissions as $permission) {
            if (!$permission instanceof \Permission) {
                throw new \LorisException("Incorrect Permission parameter");
            }
        }

        $this->permissions = $permissions;
    }


}

