
Create PROCEDURE ChangeRenewal
AS
BEGIN
	-- shows how many rows are affected
	SET NOCOUNT OFF;

	--rows start at 1 so the loop runs at least once
	DECLARE @rows INT = 1;
	--loop while rows is greater than 0 to update the program by adding the necessary number of months to the date
	--if the renewal date is passed
	WHILE (@rows > 0)
	BEGIN
		UPDATE Program
			SET RenewalDate = DATEADD(MONTH, MonthsPerRenewal, RenewalDate)
		WHERE RenewalDate < GETDATE()
	
		--setting rows to the number of rows changed so that the loop will keep going until there is no rows that were changed
		SELECT @rows = @@ROWCOUNT
	END

	--same thing but this time with the plugin table
	DECLARE @rows2 INT = 1;
	
	WHILE (@rows2 > 0)
	BEGIN
		UPDATE Plugins
			SET RenewalDate = DATEADD(MONTH, MonthsPerRenewal, RenewalDate)
		WHERE RenewalDate < GETDATE()
	
		SELECT @rows2 = @@ROWCOUNT
	END

	
END