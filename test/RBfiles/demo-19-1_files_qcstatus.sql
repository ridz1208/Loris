-- MySQL dump 10.16  Distrib 10.1.32-MariaDB, for Linux (x86_64)
--
-- Host: 192.168.122.1    Database: Demo
-- ------------------------------------------------------
-- Server version	5.1.73

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping data for table `files_qcstatus`
--

LOCK TABLES `files_qcstatus` WRITE;
/*!40000 ALTER TABLE `files_qcstatus` DISABLE KEYS */;
TRUNCATE TABLE `files_qcstatus`; INSERT INTO `files_qcstatus` (`FileQCID`, `FileID`, `SeriesUID`, `EchoTime`, `QCStatus`, `QCFirstChangeTime`, `QCLastChangeTime`, `Selected`) VALUES (1,87,'1.3.12.2.1107.5.2.32.35182.2009060916513929723684064.0.0.0',0.499,'Pass',1471018917,1471018924,'false'),(2,2,'1.3.12.2.1107.5.2.32.35182.2009060916562675500084624.0.0.0',0.102,'Fail',1471018969,1471018974,'false'),(3,8,'1.3.12.2.1107.5.2.32.35182.2009061017352175993704344.0.0.0',0.102,'Fail',1471019016,1471019017,'false'),(4,6,'1.3.12.2.1107.5.2.32.35182.2009061017242624316903196.0.0.0',0.00316,'Fail',1471019016,1471019017,'false'),(5,7,'1.3.12.2.1107.5.2.32.35182.2009061017305782912703842.0.0.0',0.499,'Fail',1471019017,1471019017,'false'),(6,76,'1.3.12.2.1107.5.2.32.35140.30000011102100020854600001141',0.102,'Fail',1471271493,1471271494,'false'),(7,74,'1.3.12.2.1107.5.2.32.35140.30000011102100020854600000953',0.00316,'Fail',1471271494,1471271494,'false'),(8,75,'1.3.12.2.1107.5.2.32.35140.30000011102100020854600001114',0.497,'Fail',1471271494,1471271494,'false'),(9,77,'1.3.12.2.1107.5.2.32.35182.2009060916513929723684064.0.0.0',0.499,'Fail',1471271972,1471271972,'true'),(10,86,'1.3.12.2.1107.5.2.32.35140.2009052917543037919128386.0.0.0',0.102,'Pass',1471272190,1471272192,'true'),(11,84,'1.3.12.2.1107.5.2.32.35140.2009052917432457017327126.0.0.0',0.00316,'Pass',1471272191,1471272192,'true'),(12,85,'1.3.12.2.1107.5.2.32.35140.200905291749582811927772.0.0.0',0.499,'Pass',1471272191,1471272192,'true'),(13,80,'1.3.12.2.1107.5.2.32.35140.2009052917543037919128386.0.0.0',0.102,'Fail',1471272585,1471272626,'true'),(14,78,'1.3.12.2.1107.5.2.32.35140.2009052917432457017327126.0.0.0',0.00316,'Pass',1471272585,1471272626,'true'),(15,79,'1.3.12.2.1107.5.2.32.35140.200905291749582811927772.0.0.0',0.499,'Pass',1471272585,1471272626,'true'),(16,31,'1.3.12.2.1107.5.2.32.35182.2010072119312637979261856.0.0.0',0.102,'Pass',1471272851,1471272852,'true'),(17,29,'1.3.12.2.1107.5.2.32.35182.2010072119084773753458944.0.0.0',0.00316,'Pass',1471272851,1471272852,'true'),(18,30,'1.3.12.2.1107.5.2.32.35182.201007211916479414159648.0.0.0',0.497,'Pass',1471272852,1471272852,'false'),(19,5,'1.3.12.2.1107.5.2.32.35008.30000009052723063231200000325',0.499,'Pass',1471273437,1471273437,'false'),(20,49,'1.3.12.2.1107.5.2.32.35182.201108151849501321944477.0.0.0',0.102,'Fail',1471273580,1471273619,'false'),(21,47,'1.3.12.2.1107.5.2.32.35182.2011081518290483992141556.0.0.0',0.00316,'Pass',1471273580,1471273619,'false'),(22,48,'1.3.12.2.1107.5.2.32.35182.2011081518365932968942260.0.0.0',0.497,'Pass',1471273580,1471273619,'true'),(23,37,'1.3.12.2.1107.5.2.32.35182.2010072119545043870778658.0.0.0',0.102,'Pass',1471376595,1471376596,'true'),(24,35,'1.3.12.2.1107.5.2.32.35182.2010072119435812850477366.0.0.0',0.00316,'Pass',1471376596,1471376596,'false'),(25,36,'1.3.12.2.1107.5.2.32.35182.2010072119502421398278012.0.0.0',0.497,'Pass',1471376596,1471376596,'true');
/*!40000 ALTER TABLE `files_qcstatus` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed
