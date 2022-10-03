<?php declare(strict_types=1);

class Permission implements \JsonSerializable
{
    public int $ID;
    public string $code;
    public string $description;




    public function jsonSerialize()
    {
        // TODO: Implement jsonSerialize() method.
    }
}
