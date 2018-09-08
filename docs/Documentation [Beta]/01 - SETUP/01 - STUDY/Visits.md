# Visits

## Overview
The **Visit** designates the instance in time where a candidate has visited or contacted a site and underwent any sort of data collection.

**Visit** and **Timepoint** are terms used interchangeably in LORIS. **Visits** are defined in the `Visit_Windows` table of the database.

## Adding Options

### Front End
 _not yet available_

### SQL (Recommended)

This table must be populated with visit labels - the Imaging Pipeline critically depends on this.  To populate with visit labels, run tools/populate_visit_windows.php - or manually insert study-specific information:

```sql
INSERT INTO Visit_Windows (Visit_label,  WindowMinDays, WindowMaxDays, OptimumMinDays, OptimumMaxDays, WindowMidpointDays) VALUES ('V1', '0', '100', '40', '60', '50');
```

If age is a not critical factor in study visit scheduling, define Min value as 0, and Max value as 2147483647 (this is the maximum integer size).

### API
 _not yet available. See [API documentation](../../../../API/) for latest additions_
 
## Interaction With LORIS

### Subprojects
 **Visits** Should be assigned to subprojects in order to be able to create timepoints for candidates. This association should be defined in the `config.xml` file of the `%LORIS_ROOT%/project/` directory as follows
 
 ```xml
 <visitLabel subprojectID="1">
   <labelSet>
     <item value="V1">V1 label description</item>   
     <item value="V2">V2 label description</tem>   
   </labelSet>
 </visitLabel>
 <visitLabel subprojectID="2">
   <labelSet>
     <item value="V1">V1 label description</item>   
     <item value="V3">V3 label description</tem>   
   </labelSet>
 </visitLabel>
 ```