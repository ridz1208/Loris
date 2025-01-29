<?php
/**
 * This file provides an implementation of the NullProjectOrUserProjectMatch filter.
 *
 * PHP Version 7
 *
 * @category   Data
 * @package    Main
 * @subpackage Data
 * @author     Rida Abou-Haidar <rida.abou-haidar@mcin.ca>
 * @license    http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link       https://www.github.com/aces/Loris/
 */
namespace LORIS\Data\Filters;

/**
 * NullProjectOrUserProjectMatch filters out data for any resource which is not part
 * of one of the user's projects unless the project is null. For a DataInstance to be
 * compatible with the NullProjectOrUserProjectMatch filter, it must implement a
 * getProjectIDs or getProjectID method which returns an integer (or array) of
 * ProjectIDs that the data belongs to or NULL.
 *
 * @category   Data
 * @package    Main
 * @subpackage Data
 * @author     Rida Abou-Haidar <rida.abou-haidar@mcin.ca>
 * @license    http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link       https://www.github.com/aces/Loris/
 */
class NullProjectOrUserProjectMatch implements \LORIS\Data\Filter
{
    protected array $permissions;

    /**
     * Constructor
     *
     * @param string[] $permissions An array of permission objects.
     */
    public function __construct(array $permissions)
    {
        $this->permissions = $permissions;
    }

    /**
     * Implements the \LORIS\Data\Filter interface
     *
     * @param \User                    $user     The user that the data is being
     *                                           filtered for.
     * @param \LORIS\Data\DataInstance $resource The data being filtered.
     *
     * @return bool true if the user has a project in common with the data
     */
    public function filter(\User $user, \Loris\Data\DataInstance $resource) : bool
    {
        // phan only understands method_exists on simple variables, not
        // Assigning to a variable is the a workaround
        // for false positive 'getCenterIDs doesn't exist errors suggested
        // in https://github.com/phan/phan/issues/2628
        $res = $resource;
        '@phan-var object $res';

        if (!method_exists($res, 'getProjectIDs')
            && !method_exists($res, 'getProjectID')
            && $user->hasAnyPermission($this->permissions)
            ) {
                // Check if no project methods are defined but theuser has
                // the permission to see null project resource
                return true;
        }
        
        // COPY of UserProjectMatch but since we are expecting some resources to
        // have null projects, the code removes exceptions for null projects.
        if (method_exists($res, 'getProjectIDs')) {
            // If the Resource belongs to multiple ProjectIDs, the user can
            // access the data if the user is part of any of those projects.
            $resourceProjects = $res->getProjectIDs();
            foreach ($resourceProjects as $project) {
                if ($user->hasProject($project)) {
                    return true;
                }
            }
            return false;
        } elseif (method_exists($res, 'getProjectID')) {
            $resourceProject = $res->getProjectID();
            if (!is_null($resourceProject)) {
                return $user->hasProject(
                    new \ProjectID(strval($resourceProject))
                );
            }
            return false;
        }
        return false;
    }
}
