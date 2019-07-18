. .\inject-job-variables.ps1
Invoke-WebRequest $ITInventoryRoot/api/job/costbreakdown -Method PATCH -Headers @{"token"=$JobsAuthToken}

