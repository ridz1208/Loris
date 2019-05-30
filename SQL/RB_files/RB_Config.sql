SET FOREIGN_KEY_CHECKS=0;
TRUNCATE TABLE `Config`;
LOCK TABLES `Config` WRITE;
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (1,2,'1');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (2,3,'LORIS Demonstration Database');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (3,42,'<h3>Example Study Description</h3>\r\n <p>This is a sample description for this study, because it is a new LORIS install that has not yet customized this text.</p>\r\n <p>A LORIS administrator can customize this text in the configuration module, under the configuration option labeled \"Study Description\"</p>\r\n <h3>Useful Links</h3>\r\n <ul>\r\n <li><a href=\"https://github.com/aces/Loris\" >LORIS GitHub Repository</a></li>\r\n <li><a href=\"https://github.com/aces/Loris/wiki/Setup\" >LORIS Setup Guide</a></li>\r\n <li><a href=\"https://www.youtube.com/watch?v=2Syd_BUbl5A\" >A video of a loris on YouTube</a></li>\r\n </ul>');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (4,4,'images/LORIS_logo.png');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (5,5,'true');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (6,6,'5');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (7,7,'99');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (8,8,'true');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (9,9,'false');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (10,10,'2016');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (11,11,'2028');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (12,13,'false');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (13,14,'false');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (14,15,'false');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (15,16,'false');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (16,20,'false');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (17,21,'true');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (18,22,'true');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (19,23,'0');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (20,24,'Modify this to your project\'s citation policy');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (22,12,'YMd');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (23,27,'/data/demo/data');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (24,28,'/var/www/loris/');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (25,29,'/data/demo/data');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (26,30,'/PATH/TO/EXTERNAL/LIBRARY/');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (27,31,'/data/demo/data');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (28,32,'/data/download/');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (29,33,'tools/logs/');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (30,34,'/data/incoming/');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (31,35,'/data/demo/bin/mri/');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (32,36,'/data/incoming/');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (33,37,'/data/genomics/');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (34,38,'/data/mediaUploads/');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (35,40,'main.css');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (36,41,'25');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (37,44,'localhost');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (38,45,'http://localhost');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (39,48,'This database provides an on-line mechanism to store both imaging and behavioral data collected from various locations. Within this framework, there are several tools that will make this process as efficient and simple as possible. For more detailed information regarding any aspect of the database, please click on the Help icon at the top right. Otherwise, feel free to contact us at the DCC. We strive to make data collection almost fun.');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (40,51,'[a-zA-Z]{3}[0-9]{4}_[0-9]{6}_[vV][0-9]+');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (41,52,'(?i).');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (42,53,'(?i)phantom');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (43,54,'(?i)phantom');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (44,55,'true');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (45,56,'t1');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (46,56,'t2');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (47,58,'radiology_review');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (48,58,'mri_parameter_form');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (49,60,'no-reply@example.com');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (50,61,'no-reply@example.com');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (51,62,'Produced by LorisDB');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (52,66,'S3cret');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (53,71,'demo');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (54,72,'yourname@example.com');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (55,73,'/data/demo/bin/mri/dicom-archive/get_dicom_info.pl');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (56,74,'1');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (57,75,'1');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (58,76,'dcm2mnc');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (59,77,'/data/demo/data/tarchive');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (60,78,'PatientName');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (61,79,'1');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (62,80,'1');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (64,82,'65');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (65,83,'t1');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (66,84,'19');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (67,85,'/opt/niak-0.6.4.1/');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (68,86,'INTERLACE_outputDWIFileNameSuffix');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (69,18,'aosi');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (70,18,'bmi');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (72,18,'medical_history');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (73,18,'mri_parameter_form');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (74,18,'radiology_review');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (75,87,'/issue_tracker');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (76,88,'localizer');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (77,88,'scout');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (78,89,'true');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (79,90,'0');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (80,91,'mri_parameter_form');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (82,92,'prod');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (83,93,'environment');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (84,95,'flair');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (85,95,'t1');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (86,95,'t2');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (87,95,'pd');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (88,96,'/data/publication_uploads/');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (89,97,'/data/publication_uploads/to_be_deleted/');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (90,98,'t1');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (91,99,'flair');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (92,99,'t1');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (93,99,'t2');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (94,99,'pd');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (95,49,'1000');
INSERT INTO `Config` (`ID`, `ConfigID`, `Value`) VALUES (96,70,'/data/demo/data');
UNLOCK TABLES;
SET FOREIGN_KEY_CHECKS=1;
