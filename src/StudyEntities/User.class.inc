<?php declare(strict_types=1);

namespace LORIS\StudyEntities;

class User implements \LORIS\Data\DataInstance
{
    public readonly int $ID;
    public string $username;
    public string $firstName;
    public string $lastName;
    public string $institution;
    public string $email;
    public string $labPosition;
    public string $labPI;
    public ?string $reasonForRequest = null;
    public bool $active = false;
    public bool $passwordChangeRequired = false;
    public bool $pendingApproval = false;
    public \DateTime $accountRequestDate;
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
            'labPosition'            => $this->labPosition,
            'labPI'                  => $this->labPI,
            'reasonForRequest'       => $this->reasonForRequest,
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

    public function toArray()
    {
        return $this->jsonSerialize();
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

    public function getSites() : array
    {
        return $this->sites;
    }
    public function getProjects() : array
    {
        return $this->projects;
    }
    public function getPermissions() : array
    {
        return $this->permissions;
    }


}

