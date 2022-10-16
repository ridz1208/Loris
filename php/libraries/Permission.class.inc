<?php declare(strict_types=1);

class Permission implements \JsonSerializable
{
    public int $ID;
    public string $code;
    public string $description;

    public static function singleton(int $permID) : \Permission
    {
        $db = \NDB_Factory::singleton()->database();

        $data = $db->pselectRow(
            'SELECT code, description FROM permission WHERE permID=:pid',
            ["pid"=>$permID]
        );

        if (empty($data)) {
            throw new \NotFound("Permission with ID $permID not found");
        }

        $obj = new \Permission();
        $obj->ID = $permID;
        $obj->code = $data['code'];
        $obj->description = $data['description'];

        return $obj;
    }

    public static function getPermissionFromCode(string $code) : \Permission
    {
        $db = \NDB_Factory::singleton()->database();
        $permID = $db->pselectOne(
            "SELECT permID FROM permission WHERE code=:code",
            ["code"=>$code]
        );

        if (empty($permID)) {
            throw new \NotFound("Permission with code $code not found");
        }

        return SELF::singleton(intval($permID));
    }

    public function jsonSerialize()
    {
        $obj = [
            'code' => $this->code,
            'description' => $this->description,
        ];

        return $obj;
    }
}
