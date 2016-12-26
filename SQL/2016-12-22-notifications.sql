-- PRE-REQS
ALTER TABLE LorisMenu ADD KEY(`Label`); -- necessary for notification_modules



-- Associates modules with the service available for each
DROP TABLE IF EXISTS `notification_modules`;
CREATE TABLE `notification_modules` (
      `ID` int(10) unsigned auto_increment NOT NULL,
      `module_name` varchar(100) NOT NULL,
      `operation_type` varchar(100) NOT NULL,
      `description` varchar(255) DEFAULT NULL,
      `loris_service` enum('Y','N') default 'N' NOT NULL,
      `email_service` enum('Y','N') default 'N' NOT NULL,
      `sms_service` enum('Y','N') default 'N' NOT NULL,
      `phone_service` enum('Y','N') default 'N' NOT NULL,
      PRIMARY KEY (`ID`),
      KEY (`module_name`),
      UNIQUE(module_name,operation_type),
      CONSTRAINT `FK_notificationModules_LorisMenu_rel_1` FOREIGN KEY (`module_name`) REFERENCES `LorisMenu` (`Label`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET='utf8';

-- saves users preferences for notification type
DROP TABLE IF EXISTS `users_notifications_rel`;
CREATE TABLE `users_notifications_rel` (
      `ID` int(10) unsigned NOT NULL auto_increment,
      `UserID` int(10) unsigned NOT NULL,
      PRIMARY KEY (`ID`),
      CONSTRAINT `FK_notifications_users_rel_1` FOREIGN KEY (`UserID`) REFERENCES `users` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET='utf8';