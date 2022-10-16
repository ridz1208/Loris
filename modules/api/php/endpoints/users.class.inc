<?php declare(strict_types=1);
/**
 * This implements the Users endpoint class
 */
namespace LORIS\api\Endpoints;

use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Message\ResponseInterface;
use \LORIS\api\Endpoint;
use \LORIS\Data\Filters\HasAnyPermissionOrUserSiteMatch;

/**
 * A class for handling the /users endpoint.
 *
 */
class Users extends Endpoint implements \LORIS\Middleware\ETagCalculator
{
    /**
     * A cache of the results of the endpoint, so that it doesn't
     * need to be recalculated for the ETag and handler
     */
    private $_cache;

    /**
     * Permission checks
     *
     * @param \User $user The requesting user
     *
     * @return boolean true if access is permitted
     */
    private function _hasAccess(\User $user)
    {
        return (
            $user->hasPermission('user_accounts') || $user->hasPermission('user_accounts')
        );
    }

    /**
     * Return which methods are supported by this endpoint.
     *
     * @return array supported HTTP methods
     */
    protected function allowedMethods() : array
    {
        return [
            'GET',
            'POST',
        ];
    }

    /**
     * Versions of the LORIS API which are supported by this
     * endpoint.
     *
     * @return array a list of supported API versions.
     */
    protected function supportedVersions() : array
    {
        return [
            "v0.0.3",
            "v0.0.4-dev",
        ];
    }

    /**
     * Handles a request starts with /candidates
     *
     * @param ServerRequestInterface $request The incoming PSR7 request
     *
     * @return ResponseInterface The outgoing PSR7 response
     */
    public function handle(ServerRequestInterface $request) : ResponseInterface
    {
        $controller = new \UserController();
        $LoggedInUser = $request->getAttribute('user');
        if ($LoggedInUser instanceof \LORIS\AnonymousUser) {
            return new \LORIS\Http\Response\JSON\Unauthorized();
        }

        if (!$this->_hasAccess($LoggedInUser)) {
            return new \LORIS\Http\Response\JSON\Forbidden();
        }

        $pathparts = $request->getAttribute('pathparts');

        if (count($pathparts) === 1) {
            switch ($request->getMethod()) {
            case 'GET':
                return $this->_handleGET($request);
            case 'POST':
                return $this->_handlePOST($request);
            case 'OPTIONS':
                return (new \LORIS\Http\Response())
                    ->withHeader('Allow', $this->allowedMethods());
            default:
                return new \LORIS\Http\Response\JSON\MethodNotAllowed(
                    $this->allowedMethods()
                );
            }
        }

        // Delegate to specific endpoint.
        try {
            $targetUser = $controller->getUserFromUsername($pathparts[1]);
        } catch (\DomainException $e) {
            $apiversion = $request->getAttribute("LORIS-API-Version") ?? "unknown";
            if ($apiversion != "v0.0.4-dev") {
                return new \LORIS\Http\Response\JSON\NotFound('User not found');
            }

            $loris  = $request->getAttribute('loris');
            $db     = $loris->getDatabaseConnection();
            $foundID = $db->pselect(
                "SELECT ID FROM users WHERE UserID=:uid",
                ["uid" => $pathparts[1]]
            );

            if (count($foundID) === 0) {
                return new \LORIS\Http\Response\JSON\NotFound('User not found');
            } else if (count($foundID) > 1) {
                return new \LORIS\Http\Response\JSON\BadRequest(
                    'Username is not unique'
                );
            }
        }

        $endpoint = new User\User($targetUser);

        $pathparts = array_slice($pathparts, 2);
        $request   = $request->withAttribute('pathparts', $pathparts);

        return $endpoint->process($request, $endpoint);
    }

    /**
     * Generates a list of all users visible to a user fitting this endpoint
     * response format.
     *
     * @param ServerRequestInterface $request The incoming PSR7 request
     *
     * @return ResponseInterface
     */
    private function _handleGET(ServerRequestInterface $request): ResponseInterface
    {
        if (isset($this->_cache)) {
            return $this->_cache;
        }

        $filter = new HasAnyPermissionOrUserSiteMatch(
            ['user_accounts_multisite']
        );

        $provisioner = (new \UserController())
            ->filter($filter)
            ->filter(new \LORIS\Data\Filters\UserProjectMatch());

        $users = (new \LORIS\Data\Table())
            ->withDataFrom($provisioner)
            ->toArray($request->getAttribute('user'));

        $this->_cache = new \LORIS\Http\Response\JsonResponse(
            ['Users' => $users]
        );

        return $this->_cache;
    }

    /**
     * Create a user with the provided data
     *
     * @param ServerRequestInterface $request The incoming PSR7 request
     *
     * @return ResponseInterface
     */
    private function _handlePOST(ServerRequestInterface $request): ResponseInterface
    {
        $user = $request->getAttribute('user');
        $data = json_decode((string) $request->getBody(), true);

        if (!isset($data['User'])) {
            return new \LORIS\Http\Response\JSON\BadRequest(
                'There is no Candidate object in the POST data'
            );
        }

        $usersites = $user->getSiteNames();
        // check if editor has access to all submitted sites
        if (count(array_intersect($data['User']['Sites'],$usersites)===count($data['User']['Sites']))) {
            return new \LORIS\Http\Response\JSON\Forbidden(
                "You are not affiliated with the all the user's site"
            );
        }

        $projectname = $data['User']['Projects'];
        try {
            $project = \NDB_Factory::singleton()->project($projectname);
        } catch (\NotFound $e) {
            return new \LORIS\Http\Response\JSON\BadRequest($e->getMessage());
        }

        $centerid = array_search(
            $data['Candidate']['Site'],
            \Utility::getSiteList()
        );

        $pscid = $data['Candidate']['PSCID'] ?? null;

        $sex = new Sex($data['Candidate']['Sex']);

        try {
            $candid = \Candidate::createNew(
                new \CenterID("$centerid"),
                $data['Candidate']['DoB'],
                $data['Candidate']['EDC'],
                $sex,
                $pscid,
                $project->getId()
            );
        } catch (\LorisException $e) {
            return new \LORIS\Http\Response\JSON\BadRequest($e->getMessage());
        }

        $candidate = \NDB_Factory::singleton()->candidate($candid);

        $body = (new \LORIS\api\Views\Candidate($candidate))->toArray()['Meta'];
        $link = '/'. $request->getURI()->getPath() . '/' . $candid;

        return (new \LORIS\Http\Response\JsonResponse($body))
            ->withStatus(201)
            ->withHeader('Content-Location', $link);
    }

    /**
     * Implements the ETagCalculator interface
     *
     * @param ServerRequestInterface $request The PSR7 incoming request.
     *
     * @return string etag summarizing value of this request.
     */
    public function ETag(ServerRequestInterface $request) : string
    {
        return md5(json_encode($this->_handleGet($request)->getBody()));
    }
}
