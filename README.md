# MSSQL to MongoDB Migration Tool JS Translator Module
**by Anthony Chavez / CP+B**

This codebase is, at it's core, a **data translator and transport** system for moving SQL data (MSSQL, MySQL, PostregeSQL) to MongoDB.



### Logging
Logging levels are set to NPM standard and will log at the set level and any higher order of priority.  i.e. setting log level to 5 (silly) will guarantee all logs are output.
```javascript
{ error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
```
and can be set for the **Console** and **File** transports respectively via environmental vars :

```./.env

LOG_TO_CONSOLE=true
LOG_PRIORITY_CONSOLE=4

LOG_TO_FILE=false
LOG_PRIORITY_FILE=3

```
