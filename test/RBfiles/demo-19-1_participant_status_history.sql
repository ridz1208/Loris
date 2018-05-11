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
-- Dumping data for table `participant_status_history`
--

LOCK TABLES `participant_status_history` WRITE;
/*!40000 ALTER TABLE `participant_status_history` DISABLE KEYS */;
TRUNCATE TABLE `participant_status_history`; INSERT INTO `participant_status_history` (`ID`, `CandID`, `entry_staff`, `data_entry_date`, `participant_status`, `reason_specify`, `reason_specify_status`, `participant_subOptions`) VALUES (1,400484,'admin','2016-06-21 20:29:10',4,NULL,NULL,NULL),(2,300256,'admin','2016-06-21 20:31:30',5,NULL,NULL,8),(3,300126,'admin','2016-06-21 20:31:45',6,NULL,NULL,11),(4,300126,'admin','2016-06-21 20:32:47',1,NULL,NULL,NULL),(5,587630,'admin','2016-06-23 20:51:24',5,NULL,NULL,9),(6,587630,'admin','2016-06-23 20:51:50',5,NULL,'not_answered',9),(7,587630,'admin','2016-06-23 20:52:11',2,'as',NULL,NULL),(8,300147,'admin','2016-08-15 19:58:11',2,NULL,NULL,NULL),(9,300322,'admin','2016-08-15 19:58:41',2,NULL,NULL,NULL),(10,400287,'admin','2016-08-15 19:59:02',2,NULL,NULL,NULL),(11,300192,'admin','2016-08-16 23:19:27',1,NULL,NULL,0),(12,300324,'admin','2016-08-16 23:19:35',1,NULL,NULL,0),(13,300210,'admin','2016-08-16 23:19:37',1,NULL,NULL,NULL),(14,300203,'admin','2016-08-16 23:19:39',1,NULL,NULL,0),(15,587630,'admin','2016-09-09 22:23:27',1,NULL,NULL,NULL),(16,300001,'admin','2016-09-24 06:12:50',1,NULL,NULL,NULL),(17,300003,'admin','2016-09-30 17:46:35',3,NULL,NULL,NULL),(18,300005,'admin','2016-09-30 17:47:01',2,NULL,NULL,NULL),(19,300007,'admin','2016-09-30 17:47:39',4,'as',NULL,NULL),(20,300007,'admin','2016-09-30 17:49:02',4,'as',NULL,NULL),(21,300007,'admin','2016-09-30 17:49:14',5,NULL,NULL,9),(22,300007,'admin','2016-09-30 17:49:40',5,NULL,NULL,9),(23,300007,'admin','2016-09-30 17:49:50',5,NULL,NULL,9),(24,300007,'admin','2016-09-30 17:50:30',5,NULL,NULL,9),(25,300007,'admin','2016-09-30 17:50:41',3,NULL,NULL,NULL),(26,300007,'admin','2016-09-30 17:51:43',1,NULL,NULL,NULL),(27,300007,'admin','2016-09-30 17:53:02',3,NULL,NULL,NULL),(28,300007,'admin','2016-09-30 17:53:24',2,NULL,NULL,NULL),(29,300010,'admin','2016-09-30 17:54:04',2,NULL,NULL,NULL),(30,300010,'admin','2016-09-30 17:54:41',6,NULL,NULL,12),(31,300005,'admin','2016-10-08 01:02:24',5,'as',NULL,9);
/*!40000 ALTER TABLE `participant_status_history` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-05-11 10:31:46
