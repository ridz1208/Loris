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
-- Dumping data for table `mri_violations_log`
--

LOCK TABLES `mri_violations_log` WRITE;
/*!40000 ALTER TABLE `mri_violations_log` DISABLE KEYS */;
TRUNCATE TABLE `mri_violations_log`; INSERT INTO `mri_violations_log` (`LogID`, `TimeRun`, `SeriesUID`, `TarchiveID`, `MincFile`, `PatientName`, `CandID`, `Visit_label`, `CheckID`, `Scan_type`, `Severity`, `Header`, `Value`, `ValidRange`, `ValidRegex`) VALUES (1,'2016-08-15 19:06:21','1.3.12.2.1107.5.2.32.35182.2011081518290483992141556.0.0.0',17,'assembly/300135/V1/mri/native/loris_300135_V1_t1_001.mnc','MTL135_300135_V1',300135,'V1',NULL,NULL,'warning','Manual Caveat Set by admin',NULL,NULL,NULL),(2,'2016-08-15 19:06:56','1.3.12.2.1107.5.2.32.35182.2011081518290483992141556.0.0.0',17,'assembly/300135/V1/mri/native/loris_300135_V1_t1_001.mnc','MTL135_300135_V1',300135,'V1',NULL,NULL,'warning','Manual Caveat Set by admin',NULL,NULL,NULL),(3,'2016-08-15 19:06:58','1.3.12.2.1107.5.2.32.35182.2011081518290483992141556.0.0.0',17,'assembly/300135/V1/mri/native/loris_300135_V1_t1_001.mnc','MTL135_300135_V1',300135,'V1',NULL,NULL,'warning','Manual Caveat Set by admin',NULL,NULL,NULL);
/*!40000 ALTER TABLE `mri_violations_log` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed
