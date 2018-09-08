# Projects

## Overview
The **Project** represents a study in LORIS and can have different subprojects (see [Subproject setup](./Subprojects.md) page) which, in turn, can be affiliated with different visits (see [Visits setup](./Visits.md) page). **Projects** are not required in LORIS but it is recommended to enable this feature when possible.

**Projects** are defined in the `Project` table of the database.
         
## Adding Options

### Front End (Recommended)
Projects are defined in the Configuration module, which can be found in LORIS under the **Admin** menu tab. Follow the steps below to create your own study Projects.

1. Enable multi-project support: In the Configuration module under the "Study variables" section, set the field "Use Projects" to true.  After changing this setting, be sure to refresh the Configuration module page.

2. To define Project labels and recruitment targets, within the Configuration module click on the link at the top of the page indicating _To configure study projects click here_.

3. For each project, enter the Project label and (optional) recruitment target, and click _save_. Deleting a defined project can only be done through the project table in the MySQL back end. 
   
> Note: Clicking _save_ more than once will register a duplicate project ID.

### SQL
Projects can be added directly in SQL using the following command. The `recruitmentTarget` field is optional but should be set when the information is available.

```sql
INSERT INTO Project (Name, recruitmentTarget) VALUES('%PROJECT_NAME%', NULL);
```


### API
 _not yet available. See [API documentation](../../../API/) for latest additions_
 
## Interaction With LORIS
_none_