# Job Scripts

There are two PowerShell scripts that invoke web requests (like `curl`) which send email notifications.

* `invoke-job-costbreakdown.ps1` will send an email with the cost breakdown.
* `invoke-job-lowresourse.ps1` will send and email if there are low resources.

In order for the two scripts to work, `ITInventoryRoot` and `JobsAuthToken` need to be specified in `inject-job-variables.ps1`.
