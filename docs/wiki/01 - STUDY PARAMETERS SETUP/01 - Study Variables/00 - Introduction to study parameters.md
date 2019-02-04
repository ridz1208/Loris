
# Study Parameters Setup

### Overview
This page covers how to set up Loris with basic parameters for research data. 

Most configuration settings are managed via LORIS' front-end Configuration Module (Admin menu). These configuration settings are stored and loaded from the Database `Config` and `ConfigSettings` tables. Some other configuration settings are also found in the file _project/config.xml_.  

  > Note: Settings found in _config.xml_ take precedence over the Configuration Module.  Older projects should ensure there is no overlap in settings between this file and the ConfigSettings table.


#### Troubleshooting Tips

   If Loris is having trouble with critical path settings impacting the front-end (e.g. finding the main codebase or the css), it may be difficult to use the front-end Configuration module to correct these path settings.  These path variables can also be accessed and updated via the back-end, where they are stored in the Config database table.  

   To view all configuration settings from the back-end, the following query can be run in the MySQL command line: 
   
   ```sql
      SELECT c.ConfigID, cs.Name, cs.Label, c.Value, cs.Description FROM Config c LEFT JOIN ConfigSettings cs ON (cs.ID=c.ConfigID);
   ```

> For setup troubleshooting, ConfigSettings under the `Paths` and `WWW` sections are important

To view **path** settings (subset of configuration settings), the following query can be run in the MySQL command line: 

   ```sql
      SELECT c.ConfigID, cs.Name, cs.Label, c.Value, cs.Description FROM Config c LEFT JOIN ConfigSettings cs ON (c.ConfigID = cs.ID) JOIN ConfigSettings csp ON (cs.Parent = csp.ID) WHERE csp.Name = 'paths';
   ```

To view all **www** settings (subset of configuration settings), using the following query: 
   
   ```sql
      SELECT c.ConfigID, cs.Name, cs.Label, c.Value, cs.Description FROM Config c LEFT JOIN ConfigSettings cs ON (c.ConfigID = cs.ID) JOIN ConfigSettings csp ON (cs.Parent = csp.ID) WHERE csp.Name = 'www';
   ```

   You may also need to change your URL and HOST settings, which you can do with these commands:
   
   ```sql
      UPDATE Config SET Value='$yourURL' WHERE ConfigID=(SELECT ID FROM ConfigSettings WHERE Name='url');
      UPDATE Config SET Value='$yourHostName' WHERE ConfigID=(SELECT ID FROM ConfigSettings WHERE Name='host');
   ```


 - ConfigSetting **host** value should not terminate in a slash.  E.g. "http://localhost" not "http://localhost/". To fix, run: (for http) 
`UPDATE Config SET Value='http://localhost' WHERE ConfigID=(SELECT ID FROM ConfigSettings WHERE Name='host');

 - If you get an error after clicking "Submit" or "Save data" on a form, check that ***url*** Config setting is set for your host. (Previous iterations of LORIS recommended setting this to the empty string)  Run: `UPDATE Config SET Value='$yourhost' WHERE ConfigID=(SELECT ID FROM ConfigSettings WHERE Name='url');`
 
 - If your dashboard loads but no other modules load, ensure that your `/var/apache2/apache2.conf` file is set to `AllowOverride All` in the section `<Directory /var/www/>` to enable re-write rules (based on `htdocs/.htaccess`)
 
 - Ensure your `smarty/templates_c` directory is Apache-writable by running `composer update`. This will also update your dependencies.
