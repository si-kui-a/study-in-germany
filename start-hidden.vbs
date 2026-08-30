Option Explicit
Dim fso, shell, baseDir, logDir, logFile, command
Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")
baseDir = fso.GetParentFolderName(WScript.ScriptFullName)
logDir = fso.BuildPath(baseDir, "logs")
If Not fso.FolderExists(logDir) Then fso.CreateFolder(logDir)
logFile = fso.BuildPath(logDir, "dev-server.log")
shell.CurrentDirectory = baseDir
command = "cmd.exe /d /c cd /d """ & baseDir & """ && npm.cmd run dev -- --host 127.0.0.1 >> """ & logFile & """ 2>&1"
shell.Run command, 0, False
Set shell = Nothing
Set fso = Nothing