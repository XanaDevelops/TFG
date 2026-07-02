@echo off
setlocal

set "SERVER_PATH=C:\Users\danie\AppData\local\xampp\htdocs"
set "FAILED=0"

rem Mirror specific folders into the XAMPP htdocs directory.
rem /MIR makes the destination match the source exactly (copies new/changed
rem files and deletes files removed from the source), same effect as
rem rsync --delete for each included path.
rem /NFL /NDL /NJH /NJS = quieter output (no file/dir lists, no job header/summary)
rem Robocopy exit codes 0-7 mean success; 8+ means a real error occurred.

set "RC_OPTS=/MIR /R:2 /W:2 /NFL /NDL /NJH /NJS"

robocopy ".\img"       "%SERVER_PATH%\img"       %RC_OPTS%
if %ERRORLEVEL% GEQ 8 set "FAILED=1"

robocopy ".\files"     "%SERVER_PATH%\files"     %RC_OPTS%
if %ERRORLEVEL% GEQ 8 set "FAILED=1"

robocopy ".\fonts"     "%SERVER_PATH%\fonts"     %RC_OPTS%
if %ERRORLEVEL% GEQ 8 set "FAILED=1"

robocopy ".\js"        "%SERVER_PATH%\js"        %RC_OPTS%
if %ERRORLEVEL% GEQ 8 set "FAILED=1"

robocopy ".\snd"       "%SERVER_PATH%\snd"       %RC_OPTS%
if %ERRORLEVEL% GEQ 8 set "FAILED=1"

robocopy ".\scenes"    "%SERVER_PATH%\scenes"    %RC_OPTS%
if %ERRORLEVEL% GEQ 8 set "FAILED=1"

robocopy ".\templates" "%SERVER_PATH%\templates" %RC_OPTS%
if %ERRORLEVEL% GEQ 8 set "FAILED=1"

rem Single files: use plain "copy" instead of robocopy - simpler and avoids
rem robocopy's source-dir + filename-pattern syntax, which is easy to break.
rem "copy" returns 0 on success, 1 on failure.

copy /Y "index.html" "%SERVER_PATH%\index.html" >nul
if %ERRORLEVEL% NEQ 0 set "FAILED=1"

copy /Y "backend.php" "%SERVER_PATH%\backend.php" >nul
if %ERRORLEVEL% NEQ 0 set "FAILED=1"

if "%FAILED%"=="0" (
	echo deploy ok
) else (
	echo deploy err
)

endlocal