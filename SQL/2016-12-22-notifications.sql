-- PRE-REQS
ALTER TABLE users ADD COLUMN `Phone` varchar(15) default NULL;


-- Associates modules with the service available for each
DROP TABLE IF EXISTS `notification_modules`;
CREATE TABLE `notification_modules` (
      `ID` int(10) unsigned auto_increment NOT NULL,
      `module_name` varchar(100) NOT NULL,
      `operation_type` varchar(100) NOT NULL,
      `description` varchar(255) DEFAULT NULL,
      `email_service` enum('Y','N') default 'N' NOT NULL,
      `sms_service` enum('Y','N') default 'N' NOT NULL,
      `phone_service` enum('Y','N') default 'N' NOT NULL,
      PRIMARY KEY (`ID`),
      KEY (`module_name`),
      UNIQUE(module_name,operation_type)
) ENGINE=InnoDB DEFAULT CHARSET='utf8';

-- saves users preferences for notification type
DROP TABLE IF EXISTS `users_notifications_rel`;
CREATE TABLE `users_notifications_rel` (
      -- `ID` int(10) unsigned NOT NULL auto_increment,
      `user_id` int(10) unsigned NOT NULL,
      `notification_id` int(10) unsigned NOT NULL,
      `email` enum('Y','N') default 'N' NOT NULL,
      `sms` enum('Y','N') default 'N' NOT NULL,
      `phone` enum('Y','N') default 'N' NOT NULL,
      PRIMARY KEY (`user_id`,`notification_id`),
      CONSTRAINT `FK_notifications_users_rel_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`ID`),
      CONSTRAINT `FK_notifications_users_rel_2` FOREIGN KEY (`notification_id`) REFERENCES `notification_modules` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET='utf8';
