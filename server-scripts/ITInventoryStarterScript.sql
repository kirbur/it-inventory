
USE ITInventory;
GO

SET IDENTITY_INSERT [Department] ON 

INSERT [Department] ([DepartmentID], [DefaultHardware], [DefaultPrograms], [DepartmentName], [IsDeleted]) VALUES (1, N'', N'', N'Utilities', 0)
INSERT [Department] ([DepartmentID], [DefaultHardware], [DefaultPrograms], [DepartmentName], [IsDeleted]) VALUES (2, N'', N'', N'Unassigned', 0)
INSERT [Department] ([DepartmentID], [DefaultHardware], [DefaultPrograms], [DepartmentName], [IsDeleted]) VALUES (3, N'', N'', N'IT', 0)

SET IDENTITY_INSERT [Department] OFF
SET IDENTITY_INSERT [Employee] ON

INSERT [Employee] ([EmployeeID], [HireDate], [DepartmentID], [IsDeleted], [FirstName], [LastName], [Email], [Role], [ADGUID], [ArchiveDate], [TextField]) VALUES (1, CAST(N'2004-10-01' AS Date), 3, 0, N'Dan', N'Moynihan', N'dan.moynihan@cqlcorp.com', N'IT Admin', N'811cbf54-2913-4ffc-8f33-6418ddb4e06d', null, N'')

SET IDENTITY_INSERT [Employee] OFF

SET IDENTITY_INSERT [AuthIDserver] ON

INSERT [AuthIDServer] ([AuthorizationSimpleID], [ActiveDirectoryID], [RefreshToken], [IsAdmin]) VALUES (1, N'811cbf54-2913-4ffc-8f33-6418ddb4e06d', N'', 1)

SET IDENTITY_INSERT [AuthIDserver] OFF