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
-- Dumping data for table `ConfigSettings`
--

LOCK TABLES `ConfigSettings` WRITE;
/*!40000 ALTER TABLE `ConfigSettings` DISABLE KEYS */;
TRUNCATE TABLE `ConfigSettings`; INSERT INTO `ConfigSettings` (`ID`, `Name`, `Description`, `Visible`, `AllowMultiple`, `DataType`, `Parent`, `Label`, `OrderNumber`) VALUES (1,'study','Settings related to details of the study',1,0,NULL,NULL,'Study',1),(2,'additional_user_info','Display additional user profile fields on the User accounts page (e.g. Institution, Position, Country, Address)',1,0,'boolean',1,'Additional user information',15),(3,'title','Full descriptive title of the study',1,0,'text',1,'Study title',1),(4,'studylogo','Filename containing logo of the study. File should be located under the htdocs/images/ folder',1,0,'text',1,'Study logo',2),(5,'useEDC','Use EDC (Expected Date of Confinement) for birthdate estimations if the study involves neonatals',1,0,'boolean',1,'Use EDC',12),(6,'ageMin','Minimum candidate age in years (0+)',1,0,'text',1,'Minimum candidate age',7),(7,'ageMax','Maximum candidate age in years',1,0,'text',1,'Maximum candidate age',8),(8,'multipleSites','Enable if there is there more than one site in the project',1,0,'boolean',1,'Multiple sites',3),(9,'useFamilyID','Enable if family members are recruited for the study',1,0,'boolean',1,'Use family',10),(10,'startYear','Start year for study recruitment or data collection',1,0,'text',1,'Start year',5),(11,'endYear','End year for study recruitment or data collection',1,0,'text',1,'End year',6),(12,'dobFormat','Format of the Date of Birth',1,0,'text',1,'DOB Format',9),(13,'useExternalID','Enable if data is used for blind data distribution, or from external data sources',1,0,'boolean',1,'Use external ID',12),(14,'useProband','Enable for proband data collection',1,0,'boolean',1,'Use proband',10),(15,'useProjects','Enable if the study involves more than one project, where each project has multiple cohorts/subprojects',1,0,'boolean',1,'Use projects',4),(16,'useScreening','Enable if there is a Screening stage with its own distinct instruments, administered before the Visit stage',1,0,'boolean',1,'Use screening',14),(17,'excluded_instruments','Instruments to be excluded from the Data Dictionary and download via the Data Query Tool',1,1,'instrument',1,'Excluded instruments',16),(18,'DoubleDataEntryInstruments','Instruments for which double data entry should be enabled',1,1,'instrument',1,'Double data entry instruments',17),(19,'InstrumentResetting','Allows resetting of instrument data',1,0,'boolean',1,'Instrument Resetting',18),(20,'SupplementalSessionStatus','Display supplemental session status information on Timepoint List page',1,0,'boolean',1,'Use Supplemental Session Status',19),(21,'useScanDone','Used for identifying timepoints that have (or should have) imaging data',1,0,'boolean',1,'Use Scan Done',20),(22,'allowPrenatalTimepoints','Determines whether creation of timepoints prior to Date of Birth is allowed',1,0,'boolean',1,'Allow Prenatal Timepoints',21),(23,'ImagingUploaderAutoLaunch','Allows running the ImagingUpload pre-processing scripts',1,0,'boolean',1,'ImagingUploader Auto Launch',22),(24,'citation_policy','Citation Policy for Acknowledgements module',1,0,'textarea',1,'Citation Policy',23),(25,'CSPAdditionalHeaders','Extensions to the Content-security policy allow only for self-hosted content',1,0,'text',1,'Content-Security Extensions',24),(26,'paths','Specify directories where LORIS-related files are stored or created. Take care when editing these fields as changing them incorrectly can cause certain modules to lose functionality.',1,0,NULL,NULL,'Paths',2),(27,'imagePath','Path to images for display in Imaging Browser (e.g. /data/$project/data/) ',1,0,'text',26,'Images',9),(28,'base','The base filesystem path where LORIS is installed',1,0,'text',26,'Base',1),(29,'data','Path to main imaging data directory (e.g. /data/$project/data/) ',1,0,'text',26,'Imaging data',5),(30,'extLibs','Path to external libraries',1,0,'text',26,'External libraries',3),(31,'mincPath','Path to MINC files (e.g. /data/$project/data/)',1,0,'text',26,'MINC files',8),(32,'DownloadPath','Where files are downloaded',1,0,'text',26,'Downloads',4),(33,'log','Path to logs (relative path starting from /var/www/$projectname)',1,0,'text',26,'Logs',2),(34,'IncomingPath','Path for imaging data transferred to the project server (e.g. /data/incoming/$project/)',1,0,'text',26,'Incoming data',7),(35,'MRICodePath','Path to directory where Loris-MRI (git) code is installed',1,0,'text',26,'LORIS-MRI code',6),(36,'MRIUploadIncomingPath','Path to the Directory of Uploaded Scans',1,0,'text',26,'MRI-Upload Directory',7),(37,'GenomicDataPath','Path to Genomic data files',1,0,'text',26,'Genomic Data Path',8),(38,'mediaPath','Path to uploaded media files',1,0,'text',26,'Media',9),(39,'gui','Settings related to the overall display of LORIS',1,0,NULL,NULL,'GUI',3),(40,'css','CSS file used for rendering (default main.css)',1,0,'text',39,'CSS file',1),(41,'rowsPerPage','Number of table rows to display per page',1,0,'text',39,'Table rows per page',2),(42,'StudyDescription','Description of the Study',1,0,'textarea',39,'Study Description',2),(43,'www','Web address settings',1,0,NULL,NULL,'WWW',4),(44,'host','Host',1,0,'text',43,'Host',1),(45,'url','Main URL where LORIS can be accessed',1,0,'text',43,'Main LORIS URL',2),(46,'mantis_url','Bug tracker URL',1,0,'text',43,'Bug tracker URL',3),(47,'dashboard','Settings that affect the appearance of the dashboard and its charts',1,0,NULL,NULL,'Dashboard',5),(48,'projectDescription','Description of the study displayed in main dashboard panel',1,0,'textarea',47,'Project Description',1),(49,'recruitmentTarget','Target number of participants for the study',1,0,'text',47,'Target number of participants',2),(50,'imaging_modules','DICOM Archive and Imaging Browser settings',1,0,NULL,NULL,'Imaging Modules',6),(51,'patientIDRegex','Regex for masking the Patient ID header field',1,0,'text',50,'Patient ID regex',1),(52,'patientNameRegex','Regex for masking the Patient Name header field',1,0,'text',50,'Patient name regex',2),(53,'LegoPhantomRegex','Regex for identifying a Lego Phantom scan header',1,0,'text',50,'Lego phantom regex',3),(54,'LivingPhantomRegex','Regex to be used on Living Phantom scan header',1,0,'text',50,'Living phantom regex',4),(55,'showTransferStatus','Show transfer status in the DICOM Archive table',1,0,'boolean',50,'Show transfer status',5),(56,'tblScanTypes','Scan types from the mri_scan_type table that the project wants to see displayed in Imaging Browser table',1,1,'scan_type',50,'Imaging Browser Tabulated Scan Types',6),(57,'statistics','Statistics module settings',1,0,NULL,NULL,'Statistics',7),(58,'excludedMeasures','Instruments to be excluded from Statistics calculations',1,1,'instrument',57,'Excluded instruments',1),(59,'mail','LORIS email settings for notifications sent to users',1,0,NULL,NULL,'Email',8),(60,'From','Sender email address header (e.g. admin@myproject.loris.ca)',1,0,'email',59,'From',1),(61,'Reply-to','Reply-to email address header (e.g. admin@myproject.loris.ca)',1,0,'email',59,'Reply-to',2),(62,'X-MimeOLE','X-MimeOLE',1,0,'text',59,'X-MimeOLE',3),(63,'uploads','Settings related to file uploading',1,0,NULL,NULL,'Uploads',9),(64,'FileGroup','Determines the group permission for new subdirectories created for uploaded files',1,0,'text',63,'File Group for Uploads',1),(65,'APIKeys','Specify any API keys required for LORIS',1,0,NULL,NULL,'API Keys',10),(66,'JWTKey','Secret key for signing JWT tokens on this server. This should be unique and never shared with anyone. ',1,0,'text',65,'JWT Secret Key',1),(67,'reCAPTCHAPrivate','Private Key for Google reCAPTCHA',1,0,'text',65,'reCAPTCHA Private Key',2),(68,'reCAPTCHAPublic','Public Key for Google reCaptcha',1,0,'text',65,'reCAPTCHA Public Key',3),(69,'imaging_pipeline','Imaging Pipeline settings',1,0,NULL,NULL,'Imaging Pipeline',12),(70,'dataDirBasepath','Base Path to the data directory of Loris-MRI',1,0,'text',69,'Loris-MRI Data Directory',1),(71,'prefix','Study prefix or study name',1,0,'text',69,'Study Name',2),(72,'mail_user','User to be notified during imaging pipeline execution',1,0,'text',69,'User to notify when executing the pipeline',3),(73,'get_dicom_info','Full path to get_dicom_info.pl',1,0,'text',69,'Full path to get_dicom_info.pl script',4),(74,'horizontalPics','Generate horizontal pictures',1,0,'boolean',69,'Horizontal pictures creation',5),(75,'no_nii','Create NIFTII files if set to 0',1,0,'boolean',69,'NIFTII file creation',6),(76,'converter','If converter is set to dcm2mnc, the c-version of dcm2mnc will be used. If however you want to use any of the various versions of the converter, you will have to specify what it is called and the uploader will try to invoke it',1,0,'text',69,'dcm2mnc binary to use when converting',7),(77,'tarchiveLibraryDir','Location of storing the library of used tarchives. If this is not set, they will not be moved',1,0,'text',69,'Path to Tarchives',8),(78,'lookupCenterNameUsing','The element of the tarchive table to be used in getPSC(), being either PatientID or PatientName',1,0,'text',69,'Center name lookup variable',9),(79,'createCandidates','Creation of candidates if set to 1',1,0,'boolean',69,'Upload creation of candidates',10),(80,'is_qsub','Do not use batch management if qsub is set to 0',1,0,'boolean',69,'Project batch management used',11),(81,'if_site','Use site if set to 1',1,0,'boolean',69,'If site is used',12),(82,'DTI_volumes','Number of volumes in native DTI acquisitions',1,0,'text',69,'Number of volumes in native DTI acquisitions',13),(83,'t1_scan_type','Scan type of native T1 acquisition (as in the mri_scan_type table)',1,0,'text',69,'Scan type of native T1 acquisition',14),(84,'reject_thresh','Max number of directions that can be rejected to PASS QC',1,0,'text',69,'Max number of DTI rejected directions for passing QC',15),(85,'niak_path','Path to niak quarantine to use if mincdiffusion will be run (option -runMincdiffusion set when calling DTIPrep_pipeline.pl)',1,0,'text',69,'NIAK Path',16),(86,'QCed2_step','DTIPrep protocol step at which a secondary QCed dataset is produced (for example one without motion correction and eddy current correction would be saved at INTERLACE_outputDWIFileNameSuffix step of DTIPrep)',1,0,'text',69,'Secondary QCed dataset',17);
/*!40000 ALTER TABLE `ConfigSettings` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed
