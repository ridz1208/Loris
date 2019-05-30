SET FOREIGN_KEY_CHECKS=0;
TRUNCATE TABLE `mri_protocol_checks`;
LOCK TABLES `mri_protocol_checks` WRITE;
INSERT INTO `mri_protocol_checks` (`ID`, `Scan_type`, `Severity`, `Header`, `ValidRange`, `ValidRegex`) VALUES (1,45,'warning','echo_time','0.49-0.528',NULL);
INSERT INTO `mri_protocol_checks` (`ID`, `Scan_type`, `Severity`, `Header`, `ValidRange`, `ValidRegex`) VALUES (2,66,'warning','repetition_time','12.8',NULL);
INSERT INTO `mri_protocol_checks` (`ID`, `Scan_type`, `Severity`, `Header`, `ValidRange`, `ValidRegex`) VALUES (3,66,'warning','repetition_time','13.3',NULL);
INSERT INTO `mri_protocol_checks` (`ID`, `Scan_type`, `Severity`, `Header`, `ValidRange`, `ValidRegex`) VALUES (4,66,'warning','echo_time','0.1020',NULL);
INSERT INTO `mri_protocol_checks` (`ID`, `Scan_type`, `Severity`, `Header`, `ValidRange`, `ValidRegex`) VALUES (5,65,'warning','repetition_time','11.1000',NULL);
INSERT INTO `mri_protocol_checks` (`ID`, `Scan_type`, `Severity`, `Header`, `ValidRange`, `ValidRegex`) VALUES (6,65,'warning','repetition_time','11.2000',NULL);
INSERT INTO `mri_protocol_checks` (`ID`, `Scan_type`, `Severity`, `Header`, `ValidRange`, `ValidRegex`) VALUES (7,65,'warning','echo_time','0.102-0.103',NULL);
INSERT INTO `mri_protocol_checks` (`ID`, `Scan_type`, `Severity`, `Header`, `ValidRange`, `ValidRegex`) VALUES (8,66,'warning','slice_thickness','2',NULL);
INSERT INTO `mri_protocol_checks` (`ID`, `Scan_type`, `Severity`, `Header`, `ValidRange`, `ValidRegex`) VALUES (9,66,'warning','time','26',NULL);
INSERT INTO `mri_protocol_checks` (`ID`, `Scan_type`, `Severity`, `Header`, `ValidRange`, `ValidRegex`) VALUES (10,65,'warning','time','65',NULL);
INSERT INTO `mri_protocol_checks` (`ID`, `Scan_type`, `Severity`, `Header`, `ValidRange`, `ValidRegex`) VALUES (11,63,'warning','repetition_time','0.667',NULL);
INSERT INTO `mri_protocol_checks` (`ID`, `Scan_type`, `Severity`, `Header`, `ValidRange`, `ValidRegex`) VALUES (12,44,'warning','echo_time','0.0030-0.0040',NULL);
INSERT INTO `mri_protocol_checks` (`ID`, `Scan_type`, `Severity`, `Header`, `ValidRange`, `ValidRegex`) VALUES (13,44,'warning','slice_thickness','1',NULL);
UNLOCK TABLES;
SET FOREIGN_KEY_CHECKS=1;
