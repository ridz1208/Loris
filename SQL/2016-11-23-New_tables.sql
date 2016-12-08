-- Cleanup TO DELETE
ALTER TABLE session DROP FOREIGN KEY `FK_visits_session_rel_1`;
ALTER TABLE Visit_Windows DROP FOREIGN KEY `FK_visits_Visit_Windows_rel_1`;
ALTER TABLE session DROP COLUMN VisitID;
ALTER TABLE Visit_Windows DROP COLUMN VisitID;
DROP TABLE IF EXISTS `visits_subproject_project_rel`;
DROP TABLE IF EXISTS `visits`;

-- TABLES ARE REQUIRED TO BE INNODB
-- subproject
-- Project
-- visits
-- session
-- visit windows


-- Create a table for visits where ID is the primary key, 
-- legacy_label being the currently used "visit_label",
-- label being the front end presentation of the visit
DROP TABLE IF EXISTS `visits`;
CREATE TABLE `visits` (
	`ID` int(10) unsigned NOT NULL auto_increment,
	`label` varchar(255) NOT NULL,
	`legacy_label` varchar(255) DEFAULT NULL,
	`imaging` enum('Y','N') DEFAULT 'N' NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY (`legacy_label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `visits_subproject_project_rel`;
CREATE TABLE `visits_subproject_project_rel` (
  `VisitID` int(10) unsigned NOT NULL,
  `SubprojectID` int(10) unsigned NOT NULL,
  `ProjectID` int(2) DEFAULT NULL,
  PRIMARY KEY  (`visitID`,`subprojectID`),
  KEY `FK_visits_subproject_rel_1` (`subprojectID`),
  CONSTRAINT `FK_visits_subproject_rel_2` FOREIGN KEY (`VisitID`) REFERENCES `visits` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_visits_subproject_rel_3` FOREIGN KEY (`SubprojectID`) REFERENCES `subproject` (`SubprojectID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_visits_subproject_rel_4` FOREIGN KEY (`ProjectID`) REFERENCES `Project` (`ProjectID`) ON DELETE CASCADE ON UPDATE CASCADE
  )ENGINE=InnoDB DEFAULT CHARSET=utf8;


-- POPULATE TABLES USING SCRIPT



-- add column to session to use visits ID
ALTER TABLE session ADD COLUMN VisitID int(10) unsigned;
UPDATE session s SET VisitID=(SELECT ID from visits v WHERE v.legacy_label=s.Visit_label);
ALTER TABLE session ADD CONSTRAINT `FK_visits_session_rel_1` FOREIGN KEY (`VisitID`) REFERENCES `visits` (`ID`);

-- add column to Visit_Windows to use visit ID
ALTER TABLE Visit_Windows ADD COLUMN VisitID int(10) unsigned NOT NULL;
UPDATE Visit_Windows vw SET VisitID=(SELECT ID from visits v WHERE v.legacy_label=vw.Visit_label);
ALTER TABLE Visit_Windows ADD CONSTRAINT `FK_visits_Visit_Windows_rel_1` FOREIGN KEY (`VisitID`) REFERENCES `visits` (`ID`);

