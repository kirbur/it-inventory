. .\inject-job-variables.ps1
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Invoke-WebRequest $ITInventoryRoot/api/job/costbreakdown -Method PATCH -Headers @{"token"=$JobsAuthToken}

