CREATE TABLE `role` (
 `RoleID` INTEGER unsigned NOT NULL AUTO_INCREMENT,
 `RoleName` varchar(191),
 `RoleLabel` varchar(191),
 PRIMARY KEY (`RoleID`),
 UNIQUE KEY `UK_Name` (`RoleName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `role_permission_rel` (
  `RoleID` INTEGER unsigned NOT NULL,
  `PermissionID` INTEGER unsigned NOT NULL,
  PRIMARY KEY  (`RoleID`,`PermissionID`),
  CONSTRAINT `FK_role_permission_rel_RoleID` FOREIGN KEY (`RoleID`) REFERENCES `role` (`RoleID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_role_permission_rel_PermissionID` FOREIGN KEY (`PermissionID`) REFERENCES `permissions` (`permID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `user_role_rel` (
  `UserID` INTEGER unsigned NOT NULL,
  `RoleID` INTEGER unsigned NOT NULL,
  PRIMARY KEY  (`UserID`,`RoleID`),
  CONSTRAINT `FK_user_role_rel_userID` FOREIGN KEY (`UserID`) REFERENCES `users` (`ID`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `FK_user_role_rel_RoleID` FOREIGN KEY (`RoleID`) REFERENCES `role` (`RoleID`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;