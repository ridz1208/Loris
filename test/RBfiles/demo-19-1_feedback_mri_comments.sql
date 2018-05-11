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
-- Dumping data for table `feedback_mri_comments`
--

LOCK TABLES `feedback_mri_comments` WRITE;
/*!40000 ALTER TABLE `feedback_mri_comments` DISABLE KEYS */;
TRUNCATE TABLE `feedback_mri_comments`; INSERT INTO `feedback_mri_comments` (`CommentID`, `FileID`, `SeriesUID`, `EchoTime`, `SessionID`, `CommentTypeID`, `PredefinedCommentID`, `Comment`, `ChangeTime`) VALUES (9,77,'1.3.12.2.1107.5.2.32.35182.2009060916513929723684064.0.0.0',0.499,NULL,2,4,NULL,'2016-08-19 18:32:31'),(10,77,'1.3.12.2.1107.5.2.32.35182.2009060916513929723684064.0.0.0',0.499,NULL,2,7,NULL,'2016-08-19 18:32:31'),(11,77,'1.3.12.2.1107.5.2.32.35182.2009060916513929723684064.0.0.0',0.499,NULL,3,8,NULL,'2016-08-19 18:32:32'),(12,77,'1.3.12.2.1107.5.2.32.35182.2009060916513929723684064.0.0.0',0.499,NULL,3,10,NULL,'2016-08-19 18:32:32'),(13,77,'1.3.12.2.1107.5.2.32.35182.2009060916513929723684064.0.0.0',0.499,NULL,4,12,NULL,'2016-08-19 18:32:32'),(14,77,'1.3.12.2.1107.5.2.32.35182.2009060916513929723684064.0.0.0',0.499,NULL,5,16,NULL,'2016-08-19 18:32:32'),(15,77,'1.3.12.2.1107.5.2.32.35182.2009060916513929723684064.0.0.0',0.499,NULL,5,18,NULL,'2016-08-19 18:32:32'),(16,77,'1.3.12.2.1107.5.2.32.35182.2009060916513929723684064.0.0.0',0.499,NULL,8,30,NULL,'2016-08-19 18:32:33'),(17,80,'1.3.12.2.1107.5.2.32.35140.2009052917543037919128386.0.0.0',0.102,NULL,2,4,NULL,'2016-08-19 18:39:13'),(18,80,'1.3.12.2.1107.5.2.32.35140.2009052917543037919128386.0.0.0',0.102,NULL,3,10,NULL,'2016-08-19 18:39:13'),(19,80,'1.3.12.2.1107.5.2.32.35140.2009052917543037919128386.0.0.0',0.102,NULL,4,13,NULL,'2016-08-19 18:39:14'),(20,80,'1.3.12.2.1107.5.2.32.35140.2009052917543037919128386.0.0.0',0.102,NULL,5,15,NULL,'2016-08-19 18:39:14'),(21,80,'1.3.12.2.1107.5.2.32.35140.2009052917543037919128386.0.0.0',0.102,NULL,5,20,NULL,'2016-08-19 18:39:14'),(22,79,'1.3.12.2.1107.5.2.32.35140.200905291749582811927772.0.0.0',0.499,NULL,2,4,NULL,'2016-08-19 18:39:51'),(28,2,'1.3.12.2.1107.5.2.32.35182.2009060916562675500084624.0.0.0',0.102,NULL,3,9,NULL,'2016-08-19 18:55:07'),(29,2,'1.3.12.2.1107.5.2.32.35182.2009060916562675500084624.0.0.0',0.102,NULL,3,11,NULL,'2016-08-19 18:55:07'),(30,2,'1.3.12.2.1107.5.2.32.35182.2009060916562675500084624.0.0.0',0.102,NULL,4,13,NULL,'2016-08-19 18:55:07'),(31,2,'1.3.12.2.1107.5.2.32.35182.2009060916562675500084624.0.0.0',0.102,NULL,5,14,NULL,'2016-08-19 18:55:08'),(32,2,'1.3.12.2.1107.5.2.32.35182.2009060916562675500084624.0.0.0',0.102,NULL,5,17,NULL,'2016-08-19 18:55:08'),(33,8,'1.3.12.2.1107.5.2.32.35182.2009061017352175993704344.0.0.0',0.102,NULL,2,1,NULL,'2016-08-19 18:56:01'),(34,8,'1.3.12.2.1107.5.2.32.35182.2009061017352175993704344.0.0.0',0.102,NULL,2,4,NULL,'2016-08-19 18:56:01'),(35,8,'1.3.12.2.1107.5.2.32.35182.2009061017352175993704344.0.0.0',0.102,NULL,2,7,NULL,'2016-08-19 18:56:01'),(36,8,'1.3.12.2.1107.5.2.32.35182.2009061017352175993704344.0.0.0',0.102,NULL,3,8,NULL,'2016-08-19 18:56:02'),(37,8,'1.3.12.2.1107.5.2.32.35182.2009061017352175993704344.0.0.0',0.102,NULL,4,12,NULL,'2016-08-19 18:56:02'),(38,6,'1.3.12.2.1107.5.2.32.35182.2009061017242624316903196.0.0.0',0.00316,NULL,2,1,NULL,'2016-08-19 18:56:56'),(39,6,'1.3.12.2.1107.5.2.32.35182.2009061017242624316903196.0.0.0',0.00316,NULL,2,4,NULL,'2016-08-19 18:56:57'),(40,6,'1.3.12.2.1107.5.2.32.35182.2009061017242624316903196.0.0.0',0.00316,NULL,2,7,NULL,'2016-08-19 18:56:57'),(41,6,'1.3.12.2.1107.5.2.32.35182.2009061017242624316903196.0.0.0',0.00316,NULL,3,9,NULL,'2016-08-19 18:56:57'),(42,6,'1.3.12.2.1107.5.2.32.35182.2009061017242624316903196.0.0.0',0.00316,NULL,4,12,NULL,'2016-08-19 18:56:57'),(43,6,'1.3.12.2.1107.5.2.32.35182.2009061017242624316903196.0.0.0',0.00316,NULL,5,14,NULL,'2016-08-19 18:56:57'),(44,6,'1.3.12.2.1107.5.2.32.35182.2009061017242624316903196.0.0.0',0.00316,NULL,5,17,NULL,'2016-08-19 18:56:58'),(45,7,'1.3.12.2.1107.5.2.32.35182.2009061017305782912703842.0.0.0',0.499,NULL,2,2,NULL,'2016-08-19 18:57:32'),(46,7,'1.3.12.2.1107.5.2.32.35182.2009061017305782912703842.0.0.0',0.499,NULL,2,27,NULL,'2016-08-19 18:57:32'),(47,7,'1.3.12.2.1107.5.2.32.35182.2009061017305782912703842.0.0.0',0.499,NULL,2,28,NULL,'2016-08-19 18:57:33'),(48,7,'1.3.12.2.1107.5.2.32.35182.2009061017305782912703842.0.0.0',0.499,NULL,3,9,NULL,'2016-08-19 18:57:33'),(49,7,'1.3.12.2.1107.5.2.32.35182.2009061017305782912703842.0.0.0',0.499,NULL,3,11,NULL,'2016-08-19 18:57:33'),(50,7,'1.3.12.2.1107.5.2.32.35182.2009061017305782912703842.0.0.0',0.499,NULL,4,12,NULL,'2016-08-19 18:57:33');
/*!40000 ALTER TABLE `feedback_mri_comments` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed
