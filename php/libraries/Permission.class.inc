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
