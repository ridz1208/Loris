# APACHE sizes


### 6. Useful Apache configuration options

   Session timeout, file upload maximum size, and other parameters can be configured in Apache by adding the following lines to your _php.ini_ file:

   ```
+session.gc_maxlifetime 10800
+max_execution_time     10800
+upload_max_filesize    1024M
+post_max_size          1024M
   ```

