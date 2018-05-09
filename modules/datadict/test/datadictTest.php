<?php
/**
 * Datadict automated integration tests
 *
 * PHP Version 5
 *
 * @category Test
 * @package  Loris
 * @author   Ted Strauss <ted.strauss@mcgill.ca>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://github.com/aces/Loris
 */

require_once __DIR__ .
             "/../../../test/integrationtests/LorisIntegrationTest.class.inc";
/**
 * Datadict automated integration tests
 *
 * PHP Version 5
 *
 * @category Test
 * @package  Loris
 * @author   Ted Strauss <ted.strauss@mcgill.ca>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://github.com/aces/Loris
 */
class DatadictTestIntegrationTest extends LorisIntegrationTest
{
    /**
     * UI elements and locations
     * breadcrumb - 'Access Profile'
     * Table headers
     */
    private $_loadingUI
        =  array(
            'Data Dictionary' => '#bc2 > a:nth-child(2) > div',
            'SourceFrom'      => '#dynamictable > thead > tr > th:nth-child(2)',
            'Name'            => '#dynamictable > thead > tr > th:nth-child(3)',
            'SourceField'     => '#dynamictable > thead > tr > th:nth-child(4)',
            'Description'     => '#dynamictable > thead > tr > th:nth-child(5)',
           );

    /**
     * Inserting testing data
     *
     * @return void
     */
    function setUp()
    {
        parent::setUp();
        $this->DB->insert(
            "parameter_type",
            array(
             'Name'        => 'TestParameterNotRealMAGICNUMBER335',
             'Type'        => 'varchar(255)',
             'Description' => 'I am a fake description used only for testing'.
                                      ' you should not see me. MAGICNUMBER335',
             'SourceFrom'  => 'nowhere',
             'SourceField' => 'imaginary',
             'Queryable'   => true,
             'IsFile'      => 0,
            )
        );
    }
    /**
     * Deleting testing data
     *
     * @return void
     */
    function tearDown()
    {
        parent::tearDown();
        print_r(
            $this->DB->pselect(
                "SELECT * FROM parameter_type_category_rel",
                array()
            )
        );

        $this->DB->delete(
            'parameter_type',
            array('Name' => 'TestParameterNotRealMAGICNUMBER335')
        );
    }
    /**
     * Tests that, when loading the datadict module, some
     * text appears in the body.
     *
     * @return void
     */
    function testDatadictDoespageLoad()
    {
        $this->webDriver->get($this->url . "/datadict/");
                $this->webDriver->wait(120, 1000)->until(
                    WebDriverExpectedCondition::presenceOfElementLocated(
                        WebDriverBy::Name("keyword")
                    )
                );

                $bodyText = $this->webDriver->findElement(
                    WebDriverBy::cssSelector("body")
                )->getText();
                $this->assertContains("Data Dictionary", $bodyText);
    }
    /**
     * Testing keyword filter with testing data
     *
     * @return void
     */
    function testDataDictSearchKeywordFilters()
    {
        $this->webDriver->get($this->url . "/datadict/");

        $searchKey = $this->webDriver->findElements(
            WebDriverBy::Name("keyword")
        );

        $searchKey[0]->sendKeys("NotRealMAGICNUMBER335");
        $searchButton = $this->webDriver->findElement(
            WebDriverBy::Name("filter")
        );
        //search exist data
        $searchButton->click();

        $name = $this->webDriver->executescript(
            "return document.querySelector".
                  "('#dynamictable > tbody > tr > td:nth-child(3)').textContent"
        );
            $this->assertContains("TestParameterNotRealMAGICNUMBER335", $name);
    }
    /**
     * Testing keyword filter with testing data not case-sensitive
     *
     * @return void
     */
    function testDataDictSearchKeywordFiltersnotCaseSensitvie()
    {
        $this->webDriver->get($this->url . "/datadict/");

        $searchKey = $this->webDriver->findElements(
            WebDriverBy::Name("keyword")
        );

        $searchKey[0]->sendKeys("notrealMAGICNUMBER335");
        $searchButton = $this->webDriver->findElement(
            WebDriverBy::Name("filter")
        );
        //search exist data
        $searchButton->click();

        $name = $this->webDriver->executescript(
            "return document.querySelector".
                  "('#dynamictable > tbody > tr > td:nth-child(3)').textContent"
        );
            $this->assertContains("TestParameterNotRealMAGICNUMBER335", $name);
    }
    /**
     * Testing keyword filter without testing data
     *
     * @return void
     */
    function testDataDictSearchKeywordFiltersWithoutData()
    {
        $this->webDriver->get($this->url . "/datadict/");

        $searchKey = $this->webDriver->findElements(
            WebDriverBy::Name("keyword")
        );

        $searchKey[0]->sendKeys("noExist");
        $searchButton = $this->webDriver->findElement(
            WebDriverBy::Name("filter")
        );
        //search exist data
        $searchButton->click();

        $res = $this->webDriver->executescript(
            "return document.querySelector".
                  "('#datatable > div > strong').textContent"
        );
        $this->assertContains("No result found.", $res);

    }

    /**
      * Testing UI elements when page loads
      *
      * @return void
      */
    function testPageUIs()
    {
        $this->safeGet($this->url . "/datadict/");
        foreach ($this->_loadingUI as $key => $value) {
            $text = $this->webDriver->executescript(
                "return document.querySelector('$value').textContent"
            );
            $this->assertContains($key, $text);
        }
    }
}
?>
