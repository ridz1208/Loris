# Overview 


### 3. Create back-end accounts 

   Two types of back-end accounts are useful for administering Loris: MySQL accounts and Unix account.

   It is good practice to create a new MySQL user for developer purposes (e.g. lorisDBadmin) to execute all back-end transactions, both in configuration and in day-to-day operations (i.e. not MySQL root).  This account should be distinct from the MySQL root user as well as distinct from the _lorisuser_ account which the install script created with limited permissions for executing all transactions coming from Loris' PHP code (i.e. from front-end users' activity). 

   ```sql
   GRANT ALTER, DROP, CREATE, UPDATE, INSERT, SELECT, DELETE, CREATE TEMPORARY TABLES, LOCK TABLES  on $dbname.* to 'lorisDBadmin'@'$dbhost' IDENTIFIED BY '$newpassword' WITH GRANT OPTION ;
   ```

_lorisadmin_ is the Loris administrator Unix account.  Developers may wish to have their own individual accounts.
