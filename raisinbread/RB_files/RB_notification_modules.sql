SET FOREIGN_KEY_CHECKS=0;
TRUNCATE TABLE `notification_modules`;
LOCK TABLES `notification_modules` WRITE;
INSERT INTO `notification_modules` (`id`, `module_name`, `operation_type`, `as_admin`, `template_file`, `description`) VALUES (7,'media','upload','N','notifier_media_upload.tpl','Media: New File Uploaded');
INSERT INTO `notification_modules` (`id`, `module_name`, `operation_type`, `as_admin`, `template_file`, `description`) VALUES (8,'media','download','N','notifier_media_download.tpl','Media: File Downloaded');
INSERT INTO `notification_modules` (`id`, `module_name`, `operation_type`, `as_admin`, `template_file`, `description`) VALUES (9,'document_repository','new_category','N','notifier_document_repository_new_category.tpl','Document Repository: New Category');
INSERT INTO `notification_modules` (`id`, `module_name`, `operation_type`, `as_admin`, `template_file`, `description`) VALUES (10,'document_repository','upload','N','notifier_document_repository_upload.tpl','Document Repository: New Document Uploaded');
INSERT INTO `notification_modules` (`id`, `module_name`, `operation_type`, `as_admin`, `template_file`, `description`) VALUES (11,'document_repository','delete','N','notifier_document_repository_delete.tpl','Document Repository: Document Deleted');
INSERT INTO `notification_modules` (`id`, `module_name`, `operation_type`, `as_admin`, `template_file`, `description`) VALUES (12,'document_repository','edit','N','notifier_document_repository_edit.tpl','Document Repository: Document Edited');
INSERT INTO `notification_modules` (`id`, `module_name`, `operation_type`, `as_admin`, `template_file`, `description`) VALUES (13,'publication','submission','N','notifier_publication_submission.tpl','Publication: Submission Received');
INSERT INTO `notification_modules` (`id`, `module_name`, `operation_type`, `as_admin`, `template_file`, `description`) VALUES (14,'publication','review','N','notifier_publication_review.tpl','Publication: Proposal has been reviewed');
INSERT INTO `notification_modules` (`id`, `module_name`, `operation_type`, `as_admin`, `template_file`, `description`) VALUES (15,'publication','edit','N','notifier_publication_edit.tpl','Publication: Proposal has been edited');
UNLOCK TABLES;
SET FOREIGN_KEY_CHECKS=1;
