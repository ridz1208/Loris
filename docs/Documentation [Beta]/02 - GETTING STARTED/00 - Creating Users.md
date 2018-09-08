# Loris Users

### Adding users from the front end
The installation script adds admin user/password, associated with a dummy email address which should be changed. Additional users and permissions are added in the User Accounts page. For clarity and uniqueness, it is recommended to use an email address as username. 
* To set/reset a user password, use the script [tools/resetpassword.php](https://github.com/aces/Loris/blob/master/tools/resetpassword.php)

For any user to be able to log in to LORIS, their account record in the _users_ table must contain: 
* _Active_ = 'Y'
* _Pending_approval_ = 'N'
* _Password_expiry_ column value is later than today's date
 

### Adding users from SQL
_TODO_ 

### Adding users from the API
 _not yet available. See [API documentation](../../../API/) for latest additions_