SET FOREIGN_KEY_CHECKS=0;
TRUNCATE TABLE `LorisMenu`;
LOCK TABLES `LorisMenu` WRITE;
INSERT INTO `LorisMenu` (`ID`, `Parent`, `Label`, `Link`, `Visible`, `OrderNumber`) VALUES (1,NULL,'Candidate',NULL,NULL,1);
INSERT INTO `LorisMenu` (`ID`, `Parent`, `Label`, `Link`, `Visible`, `OrderNumber`) VALUES (2,NULL,'Clinical',NULL,NULL,2);
INSERT INTO `LorisMenu` (`ID`, `Parent`, `Label`, `Link`, `Visible`, `OrderNumber`) VALUES (3,NULL,'Imaging',NULL,NULL,3);
INSERT INTO `LorisMenu` (`ID`, `Parent`, `Label`, `Link`, `Visible`, `OrderNumber`) VALUES (4,NULL,'Reports',NULL,NULL,4);
INSERT INTO `LorisMenu` (`ID`, `Parent`, `Label`, `Link`, `Visible`, `OrderNumber`) VALUES (5,NULL,'Tools',NULL,NULL,5);
INSERT INTO `LorisMenu` (`ID`, `Parent`, `Label`, `Link`, `Visible`, `OrderNumber`) VALUES (6,NULL,'Admin',NULL,NULL,6);
INSERT INTO `LorisMenu` (`ID`, `Parent`, `Label`, `Link`, `Visible`, `OrderNumber`) VALUES (7,1,'New Profile','new_profile/',NULL,1);
INSERT INTO `LorisMenu` (`ID`, `Parent`, `Label`, `Link`, `Visible`, `OrderNumber`) VALUES (8,1,'Access Profile','candidate_list/',NULL,2);
INSERT INTO `LorisMenu` (`ID`, `Parent`, `Label`, `Link`, `Visible`, `OrderNumber`) VALUES (9,2,'Reliability','reliability/',NULL,1);
INSERT INTO `LorisMenu` (`ID`, `Parent`, `Label`, `Link`, `Visible`, `OrderNumber`) VALUES (10,2,'Conflict Resolver','conflict_resolver/',NULL,2);
INSERT INTO `LorisMenu` (`ID`, `Parent`, `Label`, `Link`, `Visible`, `OrderNumber`) VALUES (11,2,'Examiner','examiner/',NULL,3);
INSERT INTO `LorisMenu` (`ID`, `Parent`, `Label`, `Link`, `Visible`, `OrderNumber`) VALUES (12,2,'Training','training/',NULL,4);
INSERT INTO `LorisMenu` (`ID`, `Parent`, `Label`, `Link`, `Visible`, `OrderNumber`) VALUES (13,2,'Media','media/',NULL,5);
INSERT INTO `LorisMenu` (`ID`, `Parent`, `Label`, `Link`, `Visible`, `OrderNumber`) VALUES (14,3,'DICOM Archive','dicom_archive/',NULL,1);
INSERT INTO `LorisMenu` (`ID`, `Parent`, `Label`, `Link`, `Visible`, `OrderNumber`) VALUES (15,3,'Imaging Browser','imaging_browser/',NULL,2);
INSERT INTO `LorisMenu` (`ID`, `Parent`, `Label`, `Link`, `Visible`, `OrderNumber`) VALUES (16,3,'MRI Violated Scans','mri_violations/',NULL,3);
INSERT INTO `LorisMenu` (`ID`, `Parent`, `Label`, `Link`, `Visible`, `OrderNumber`) VALUES (17,3,'Imaging Uploader','imaging_uploader/',NULL,4);
INSERT INTO `LorisMenu` (`ID`, `Parent`, `Label`, `Link`, `Visible`, `OrderNumber`) VALUES (18,4,'Statistics','statistics/',NULL,1);
INSERT INTO `LorisMenu` (`ID`, `Parent`, `Label`, `Link`, `Visible`, `OrderNumber`) VALUES (19,4,'Data Query Tool','dataquery/',NULL,2);
INSERT INTO `LorisMenu` (`ID`, `Parent`, `Label`, `Link`, `Visible`, `OrderNumber`) VALUES (20,5,'Data Dictionary','datadict/',NULL,1);
INSERT INTO `LorisMenu` (`ID`, `Parent`, `Label`, `Link`, `Visible`, `OrderNumber`) VALUES (21,5,'Document Repository','document_repository/',NULL,2);
INSERT INTO `LorisMenu` (`ID`, `Parent`, `Label`, `Link`, `Visible`, `OrderNumber`) VALUES (22,5,'Data Integrity Flag','data_integrity_flag/',NULL,3);
INSERT INTO `LorisMenu` (`ID`, `Parent`, `Label`, `Link`, `Visible`, `OrderNumber`) VALUES (23,5,'Data Team Helper','data_team_helper/',NULL,4);
INSERT INTO `LorisMenu` (`ID`, `Parent`, `Label`, `Link`, `Visible`, `OrderNumber`) VALUES (24,5,'Instrument Builder','instrument_builder/',NULL,5);
INSERT INTO `LorisMenu` (`ID`, `Parent`, `Label`, `Link`, `Visible`, `OrderNumber`) VALUES (25,5,'Genomic Browser','genomic_browser/',NULL,6);
INSERT INTO `LorisMenu` (`ID`, `Parent`, `Label`, `Link`, `Visible`, `OrderNumber`) VALUES (26,5,'Data Release','data_release/',NULL,7);
INSERT INTO `LorisMenu` (`ID`, `Parent`, `Label`, `Link`, `Visible`, `OrderNumber`) VALUES (27,5,'Acknowledgements','acknowledgements/',NULL,8);
INSERT INTO `LorisMenu` (`ID`, `Parent`, `Label`, `Link`, `Visible`, `OrderNumber`) VALUES (28,5,'Issue Tracker','issue_tracker/',NULL,9);
INSERT INTO `LorisMenu` (`ID`, `Parent`, `Label`, `Link`, `Visible`, `OrderNumber`) VALUES (29,6,'User Accounts','user_accounts/',NULL,1);
INSERT INTO `LorisMenu` (`ID`, `Parent`, `Label`, `Link`, `Visible`, `OrderNumber`) VALUES (30,6,'Survey Module','survey_accounts/',NULL,2);
INSERT INTO `LorisMenu` (`ID`, `Parent`, `Label`, `Link`, `Visible`, `OrderNumber`) VALUES (31,6,'Help Editor','help_editor/',NULL,3);
INSERT INTO `LorisMenu` (`ID`, `Parent`, `Label`, `Link`, `Visible`, `OrderNumber`) VALUES (32,6,'Instrument Manager','instrument_manager/',NULL,4);
INSERT INTO `LorisMenu` (`ID`, `Parent`, `Label`, `Link`, `Visible`, `OrderNumber`) VALUES (33,6,'Configuration','configuration/',NULL,5);
INSERT INTO `LorisMenu` (`ID`, `Parent`, `Label`, `Link`, `Visible`, `OrderNumber`) VALUES (34,6,'Server Processes Manager','server_processes_manager/',NULL,6);
INSERT INTO `LorisMenu` (`ID`, `Parent`, `Label`, `Link`, `Visible`, `OrderNumber`) VALUES (35,5,'Quality Control','quality_control/',NULL,10);
INSERT INTO `LorisMenu` (`ID`, `Parent`, `Label`, `Link`, `Visible`, `OrderNumber`) VALUES (36,4,'Publications','publication/',NULL,3);
UNLOCK TABLES;
SET FOREIGN_KEY_CHECKS=1;
