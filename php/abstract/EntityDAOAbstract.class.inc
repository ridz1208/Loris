<?php

/**
 * This abstract class contains functions to be implemented by any
 * LORIS Entity Data Access Object
 *
 * PHP Version 7
 *
 * @category Main
 * @package  Loris
 * @author   Rida Abou-Haidar <rida.loris@gmail.com>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/Loris/
 */
abstract class EntityDAOAbstract
{
    /**
     * Variable storing the type of object this class will be able
     * to create, update and delete. This variable must be set in the class
     * extending this one.
     *
     * @var $classType ???? type of object this class expects
     *
     * //TODO can this be typed ?
     */
    protected $classType;


    /**
     * Gets the complete list of objects from the database lazily
     * The lazy instantiation does not instantiate sub-objects
     *
     * @return array Objects instantiated
     */
    abstract function getListLazy() : array;

    /**
     * Gets the complete list of permissions from the database eagerly
     * The eager instantiation instantiates sub-objects
     *
     * @return array Objects instantiated
     */
    abstract function getListEager() : array;

    /**
     * Create wrapper checks if the object to be created is of the correct type
     * before calling the concrete create function.
     *
     * @param EntityObjectInterface $object
     *
     * @return bool
     */
    function create(EntityObjectInterface $object) {
        $this->checkObjectType($object);
        return $this->concreteCreate($object);
    }

    /**
     * Create a new entry for the entity in the database
     * This function should implement the C from the CRUD functions
     *
     * @param EntityObjectInterface $object to use for the creation
     *
     * @return bool Successful creation confirmation
     */
    abstract protected function concreteCreate(EntityObjectInterface $object) : bool;

    /**
     * Update wrapper checks if the object to be updated is of the correct type
     * before calling the concrete update function.
     *
     * @param EntityObjectInterface $object
     *
     * @return bool
     */
    function update(EntityObjectInterface $object) {
        $this->checkObjectType($object);
        return $this->concreteUpdate($object);
    }

    /**
     * Update an existing entry for the entity in the database
     * This function should implement the U from the CRUD functions
     *
     * @param EntityObjectInterface $object to use for the update
     *
     * @return bool Successful update confirmation
     */
    abstract protected function concreteUpdate(EntityObjectInterface $object) : bool;


    /**
     * Delete wrapper checks if the object to be deleted is of the correct type
     * before calling the concrete delete function.
     *
     * @param EntityObjectInterface $object
     *
     * @return bool
     */
    function delete(EntityObjectInterface $object) {
        $this->checkObjectType($object);
        return $this->concreteDelete($object);
    }

    /**
     * Delete an entry for the entity in the database
     * This function should implement the D from the CRUD functions
     *
     * @param EntityObjectInterface $object to use for the deletion
     *
     * @return bool Successful deletion confirmation
     */
    abstract protected function concreteDelete(EntityObjectInterface $object) : bool;


    /**
     * Checks if the object passed if of the expected type and throws an
     * exception if it is not
     *
     * @param EntityObjectInterface $object
     *
     * @throws LorisIncorrectObjectException
     *
     * @return void
     */
    protected function checkObjectType(EntityObjectInterface $object) {
        if (!$object instanceof $this->classType) {
            $typeExpected = get_class($this->classType);
            $typePassed = get_class($object);
            throw new LorisIncorrectObjectException(
                "This class expects an object of the type $typeExpected 
                but got a $typePassed object."
            );
        }
    }

}