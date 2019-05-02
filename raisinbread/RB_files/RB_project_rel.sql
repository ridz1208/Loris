SET FOREIGN_KEY_CHECKS=0;
TRUNCATE TABLE `project_rel`;
LOCK TABLES `project_rel` WRITE;
INSERT INTO `project_rel` (`ProjectSubprojectID`, `ProjectID`, `SubprojectID`) VALUES (1,1,1);
INSERT INTO `project_rel` (`ProjectSubprojectID`, `ProjectID`, `SubprojectID`) VALUES (2,1,2);
INSERT INTO `project_rel` (`ProjectSubprojectID`, `ProjectID`, `SubprojectID`) VALUES (3,2,3);
INSERT INTO `project_rel` (`ProjectSubprojectID`, `ProjectID`, `SubprojectID`) VALUES (4,2,4);
INSERT INTO `project_rel` (`ProjectSubprojectID`, `ProjectID`, `SubprojectID`) VALUES (5,3,1);
INSERT INTO `project_rel` (`ProjectSubprojectID`, `ProjectID`, `SubprojectID`) VALUES (6,3,3);
UNLOCK TABLES;
SET FOREIGN_KEY_CHECKS=1;
