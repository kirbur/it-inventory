. .\inject-job-variables.ps1
Invoke-WebRequest $ITInventoryRoot/api/job/lowresource -Method PATCH -Headers @{"token"=$JobsAuthToken}

