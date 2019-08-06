. .\inject-job-variables.ps1
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Invoke-WebRequest $ITInventoryRoot/api/job/UpdateRenewalDates -Method PATCH -Headers @{"token"=$JobsAuthToken}