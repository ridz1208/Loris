SET FOREIGN_KEY_CHECKS=0;
TRUNCATE TABLE `parameter_type_category_rel`;
LOCK TABLES `parameter_type_category_rel` WRITE;
INSERT INTO `parameter_type_category_rel` (`ParameterTypeID`, `ParameterTypeCategoryID`) VALUES (2,3);
INSERT INTO `parameter_type_category_rel` (`ParameterTypeID`, `ParameterTypeCategoryID`) VALUES (3,3);
INSERT INTO `parameter_type_category_rel` (`ParameterTypeID`, `ParameterTypeCategoryID`) VALUES (4,3);
INSERT INTO `parameter_type_category_rel` (`ParameterTypeID`, `ParameterTypeCategoryID`) VALUES (5,3);
INSERT INTO `parameter_type_category_rel` (`ParameterTypeID`, `ParameterTypeCategoryID`) VALUES (6,3);
INSERT INTO `parameter_type_category_rel` (`ParameterTypeID`, `ParameterTypeCategoryID`) VALUES (7,3);
INSERT INTO `parameter_type_category_rel` (`ParameterTypeID`, `ParameterTypeCategoryID`) VALUES (8,3);
INSERT INTO `parameter_type_category_rel` (`ParameterTypeID`, `ParameterTypeCategoryID`) VALUES (9,3);
UNLOCK TABLES;
SET FOREIGN_KEY_CHECKS=1;
