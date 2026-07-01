'  ------------------------------------------------------------------------
'  glpi-agent-deployment.vbs
'  Copyright (C) 2010-2017 by the FusionInventory Development Team.
'  Copyright (C) 2021-2024 by the Teclib SAS
'  ------------------------------------------------------------------------
'
'  LICENSE
'
'  This file is part of GLPI Agent project.
'
'  This file is free software; you can redistribute it and/or modify it
'  under the terms of the GNU General Public License as published by the
'  Free Software Foundation; either version 2 of the License, or (at your
'  option) any later version.
'
'
'  This file is distributed in the hope that it will be useful, but WITHOUT
'  ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
'  FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
'  more details.
'
'  You should have received a copy of the GNU General Public License
'  along with this program; if not, write to the Free Software Foundation,
'  Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA,
'  or see <http://www.gnu.org/licenses/>.
'
'  ------------------------------------------------------------------------
'
'  @package   GLPI Agent
'  @version   1.18
'  @file      contrib/windows/glpi-agent-deployment.vbs
'  @author(s) Benjamin Accary <meldrone@orange.fr>
'             Christophe Pujol <chpujol@gmail.com>
'             Marc Caissial <marc.caissial@zenitique.fr>
'             Tomas Abad <tabadgp@gmail.com>
'             Guillaume Bougard <gbougard@teclib.com>
'  @copyright Copyright (c) 2010-2017 FusionInventory Team
'             Copyright (c) 2021-2024 Teclib SAS
'  @license   GNU GPL version 2 or (at your option) any later version
'             http://www.gnu.org/licenses/old-licenses/gpl-2.0-standalone.html
'  @link      http://www.glpi-project.org/
'  @since     2021
'
'  ------------------------------------------------------------------------
'

'
'
' Purpose:
'      GLPI Agent Unattended Deployment.
'
'

Option Explicit
Dim Reconfigure, Repair, Verbose
Dim Setup, SetupArchitecture, SetupLocation, SetupNightlyLocation, SetupOptions, SetupVersion, RunUninstallFusionInventoryAgent, UninstallOcsAgent

'
'
' USER SETTINGS
'
'

' SetupVersion
'      Setup version with the pattern <major>.<minor>.<release>[-<package>]
'
SetupVersion = "1.17"

' SetupLocation
SetupLocation = "C:\GLPI"

' SetupArchitecture
SetupArchitecture = "Auto"

' CORREÇÃO CRÍTICA AQUI: Removidas as aspas simples problemáticas e corrigido o escapamento do caminho com espaço usando duas aspas duplas ("")
SetupOptions = "/passive /norestart RUNNOW=1 REINSTALLMODE=vamus SERVER=http://130.1.61.200/front/inventory.php HTTPD_PORT=62354 TAG=MATRIZ TASKS=inventory LOGGER=file LOGFILE=""C:\Program Files\GLPI-Agent\glpi-agent.log"" LOGFILE_MAXSIZE=16 DEBUG=0"

' Setup
Setup = "GLPI-Agent-" & SetupVersion & "-" & SetupArchitecture & ".msi"

' Reconfigure
Reconfigure = "Yes"

' Repair
Repair = "No"

' Verbose
Verbose = "Yes"

' RunUninstallFusionInventoryAgent
RunUninstallFusionInventoryAgent = "No"

' UninstallOcsAgent
UninstallOcsAgent = "No"

'
'
' DO NOT EDIT BELOW
'
'

Function removeOCSAgents()
   On error resume next

   Dim Uninstall
   On error resume next
   Uninstall = WshShell.RegRead("HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\OCS Inventory Agent\UninstallString")
   If err.number = 0 then
      WshShell.Run "CMD.EXE /C net stop ""OCS INVENTORY SERVICE""",0,True
      WshShell.Run "CMD.EXE /C """ & Uninstall & """ /S /NOSPLASH",0,True
      WshShell.Run "CMD.EXE /C rmdir ""%ProgramFiles%\OCS Inventory Agent"" /S /Q",0,True
      WshShell.Run "CMD.EXE /C rmdir ""%SystemDrive%\ocs-ng"" /S /Q",0,True
      WshShell.Run "CMD.EXE /C sc delete ""OCS INVENTORY""",0,True
   End If

   On error resume next
   Uninstall = WshShell.RegRead("HKEY_LOCAL_MACHINE\SOFTWARE\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\OCS Inventory Agent\UninstallString")
   If err.number = 0 then
      WshShell.Run "CMD.EXE /C net stop ""OCS INVENTORY SERVICE""",0,True
      WshShell.Run "CMD.EXE /C """ & Uninstall & """ /S /NOSPLASH",0,True
      WshShell.Run "CMD.EXE /C rmdir ""%ProgramFiles(x86)%\OCS Inventory Agent"" /S /Q",0,True
      WshShell.Run "CMD.EXE /C rmdir ""%SystemDrive%\ocs-ng"" /S /Q",0,True
      WshShell.Run "CMD.EXE /C sc delete ""OCS INVENTORY""",0,True
   End If

   On error resume next
   Uninstall = WshShell.RegRead("HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\OCS Inventory NG Agent\UninstallString")
   If err.number = 0 then
      WshShell.Run "CMD.EXE /C net stop ""OCS INVENTORY SERVICE""",0,True
      WshShell.Run "CMD.EXE /C taskkill /F /IM ocssystray.exe",0,True
      WshShell.Run "CMD.EXE /C """ & Uninstall & """ /S /NOSPLASH",0,True
      WshShell.Run "CMD.EXE /C rmdir ""%ProgramFiles%\OCS Inventory Agent"" /S /Q",0,True
      WshShell.Run "CMD.EXE /C rmdir ""%SystemDrive%\ocs-ng"" /S /Q",0,True
      WshShell.Run "CMD.EXE /C sc delete ""OCS INVENTORY""",0,True
   End If

   On error resume next
   Uninstall = WshShell.RegRead("HKLM\SOFTWARE\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\OCS Inventory NG Agent\UninstallString")
   If err.number = 0 then
      WshShell.Run "CMD.EXE /C net stop ""OCS INVENTORY SERVICE""",0,True
      WshShell.Run "CMD.EXE /C taskkill /F /IM ocssystray.exe",0,True
      WshShell.Run "CMD.EXE /C """ & Uninstall & """ /S /NOSPLASH",0,True
      WshShell.Run "CMD.EXE /C rmdir ""%ProgramFiles%\OCS Inventory Agent"" /S /Q",0,True
      WshShell.Run "CMD.EXE /C rmdir ""%SystemDrive%\ocs-ng"" /S /Q",0,True
      WshShell.Run "CMD.EXE /C sc delete ""OCS INVENTORY""",0,True
   End If
End Function

Function hasOption(opt)
   Dim regEx
   Set regEx = New RegExp
   regEx.Global = true
   regEx.IgnoreCase = False
   regEx.Pattern = "\b" & opt & "=.+\b"
   hasOption = regEx.Test(SetupOptions)
End Function

Function uninstallFusionInventoryAgent()
   Dim Uninstall, getValue

   If not hasOption("SERVER") then
      On error resume next
      getValue = WshShell.RegRead("HKEY_LOCAL_MACHINE\SOFTWARE\FusionInventory-Agent\server")
      If err.number = 0 And getValue <> "" then
         SetupOptions = SetupOptions & " SERVER='" & getValue & "'"
      End If
   End If
   If not hasOption("LOCAL") then
      On error resume next
      getValue = WshShell.RegRead("HKEY_LOCAL_MACHINE\SOFTWARE\FusionInventory-Agent\local")
      If err.number = 0 And getValue <> "" then
         SetupOptions = SetupOptions & " LOCAL='" & getValue & "'"
      End If
   End If

   On error resume next
   Uninstall = WshShell.RegRead("HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\FusionInventory-Agent\UninstallString")
   If err.number = 0 then
      WshShell.Run "CMD.EXE /C net stop FusionInventory-Agent",0,True
      WshShell.Run "CMD.EXE /C """ & Uninstall & """ /S /NOSPLASH",0,True
      WshShell.Run "CMD.EXE /C rmdir ""%ProgramFiles%\FusionInventory-Agent"" /S /Q",0,True
   End If

   On error resume next
   Uninstall = WshShell.RegRead("HKEY_LOCAL_MACHINE\SOFTWARE\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\FusionInventory-Agent\UninstallString")
   If err.number = 0 then
      WshShell.Run "CMD.EXE /C net stop FusionInventory-Agent",0,True
      WshShell.Run "CMD.EXE /C """ & Uninstall & """ /S /NOSPLASH",0,True
      WshShell.Run "CMD.EXE /C rmdir ""%ProgramFiles(x86)%\FusionInventory-Agent"" /S /Q",0,True
   End If
End Function

Function AdvanceTime(nMinutes)
   Dim nMinimalMinutes, dtmTimeFuture
   nMinimalMinutes = 5
   If nMinutes < nMinimalMinutes Then
      nMinutes = nMinimalMinutes
   End If
   dtmTimeFuture = DateAdd ("n", nMinutes, Time)
   AdvanceTime = Hour(dtmTimeFuture) & ":" & Minute(dtmTimeFuture)
End Function

Function baseName (strng)
   Dim regEx
   Set regEx = New RegExp
   regEx.Global = true
   regEx.IgnoreCase = True
   regEx.Pattern = ".*[/\\]([^/\\]+)$"
   baseName = regEx.Replace(strng,"$1")
End Function

Function GetSystemArchitecture()
   Dim strSystemArchitecture
   Err.Clear
   On Error Resume Next
   strSystemArchitecture = CreateObject("WScript.Shell").ExpandEnvironmentStrings("%PROCESSOR_ARCHITECTURE%")
   If Err.Number = 0 Then
      Select Case strSystemArchitecture
         Case "x86"
            GetSystemArchitecture = "x86"
         Case "AMD64"
            GetSystemArchitecture = "x64"
         Case Else
            GetSystemArchitecture = "NotSupported"
      End Select
   Else
      GetSystemArchitecture = "Unknown"
   End If
End Function

Function isHttp(strng)
   Dim regEx, matches
   Set regEx = New RegExp
   regEx.Global = true
   regEx.IgnoreCase = True
   regEx.Pattern = "^(http(s?)).*"
   If regEx.Execute(strng).count > 0 Then
      isHttp = True
   Else
      isHttp = False
   End If
   Exit Function
End Function

Function isNightly(strng)
   Dim regEx, matches
   Set regEx = New RegExp
   regEx.Global = true
   regEx.IgnoreCase = True
   regEx.Pattern = "-(git[0-9a-f]{8})$"
   If regEx.Execute(strng).count > 0 Then
      isNightly = True
   Else
      isNightly = False
   End If
   Exit Function
End Function

Function doesNotSupportX86(strng)
   Dim regEx, matches, major, minor
   Set regEx = New RegExp
   regEx.Global = true
   regEx.Pattern = "^([0-9]+)\.([0-9]+)"
   Set matches = regEx.Execute(strng)
   doesNotSupportX86 = False
   If matches.count > 0 Then
      major = matches(0).SubMatches(0)
      minor = matches(0).SubMatches(1)
      If major = 1 And minor > 7 Then
         doesNotSupportX86 = True
      End If
   End If
   Exit Function
End Function

Function IsInstallationNeeded(strSetupVersion, strSetupArchitecture, strSystemArchitecture)
   Dim strCurrentSetupVersion
   If strSystemArchitecture = "x86" Then
      On error resume next
      strCurrentSetupVersion = WshShell.RegRead("HKEY_LOCAL_MACHINE\SOFTWARE\GLPI-Agent\Installer\Version")
      If Err.Number = 0 Then
         If strCurrentSetupVersion <> strSetupVersion Then
            ShowMessage("Installation needed: " & strCurrentSetupVersion & " -> " & strSetupVersion)
            IsInstallationNeeded = True
         End If
         Exit Function
      Else
         Err.Clear
         ShowMessage("Installation needed: " & strSetupVersion)
         IsInstallationNeeded = True
      End If
   Else
      On error resume next
      strCurrentSetupVersion = WshShell.RegRead("HKEY_LOCAL_MACHINE\SOFTWARE\Wow6432Node\GLPI-Agent\Installer\Version")
      If Err.Number = 0 Then
         If strCurrentSetupVersion <> strSetupVersion Then
            ShowMessage("Installation needed: " & strCurrentSetupVersion & " -> " & strSetupVersion)
            IsInstallationNeeded = True
         End If
         Exit Function
      Else
         Err.Clear
         On error resume next
         strCurrentSetupVersion = WshShell.RegRead("HKEY_LOCAL_MACHINE\SOFTWARE\GLPI-Agent\Installer\Version")
         If Err.Number = 0 Then
            If strCurrentSetupVersion <> strSetupVersion Then
               ShowMessage("Installation needed: " & strCurrentSetupVersion & " -> " & strSetupVersion)
               IsInstallationNeeded = True
            End If
            Exit Function
         Else
            Err.Clear
            ShowMessage("Installation needed: " & strSetupVersion)
            IsInstallationNeeded = True
         End If
      End If
   End If
End Function

Function IsSelectedReconfigure()
   If LCase(Reconfigure) <> "no" Then
      ShowMessage("Installation reconfigure: " & SetupVersion)
      IsSelectedReconfigure = True
   Else
      IsSelectedReconfigure = False
   End If
End Function

Function IsSelectedRepair()
   If LCase(Repair) <> "no" Then
      ShowMessage("Installation repairing: " & SetupVersion)
      IsSelectedRepair = True
   Else
      IsSelectedRepair = False
   End If
End Function

Function SaveWebBinary(strSetupLocation, strSetup)
   Const adTypeBinary = 1
   Const adSaveCreateOverWrite = 2
   Const ForWriting = 2
   Dim web, varByteArray, strData, strBuffer, lngCounter, ado, strUrl
   strUrl = strSetupLocation & "/" & strSetup
   Err.Clear
   Set web = Nothing
   Set web = CreateObject("WinHttp.WinHttpRequest.5.1")
   If web Is Nothing Then Set web = CreateObject("WinHttp.WinHttpRequest")
   If web Is Nothing Then Set web = CreateObject("MSXML2.ServerXMLHTTP")
   If web Is Nothing Then Set web = CreateObject("Microsoft.XMLHTTP")
   web.Open "GET", strURL, False
   web.Send
   If Err.Number <> 0 Then
      SaveWebBinary = False
      Set web = Nothing
      Exit Function
   End If
   If web.Status <> "200" Then
      SaveWebBinary = False
      Set web = Nothing
      Exit Function
   End If
   varByteArray = web.ResponseBody
   Set web = Nothing
   On Error Resume Next
   Set ado = Nothing
   Set ado = CreateObject("ADODB.Stream")
   If ado Is Nothing Then
      Set fs = CreateObject("Scripting.FileSystemObject")
      Set ts = fs.OpenTextFile(baseName(strUrl), ForWriting, True)
      strData = ""
      strBuffer = ""
      For lngCounter = 0 to UBound(varByteArray)
         ts.Write Chr(255 And Ascb(Midb(varByteArray,lngCounter + 1, 1)))
      Next
      ts.Close
   Else
      ado.Type = adTypeBinary
      ado.Open
      ado.Write varByteArray
      ado.SaveToFile CreateObject("WScript.Shell").ExpandEnvironmentStrings("%TEMP%") & "\" & strSetup, adSaveCreateOverWrite
      ado.Close
   End If
   SaveWebBinary = True
End Function

Function ShowMessage(strMessage)
   If LCase(Verbose) <> "no" Then
      WScript.Echo strMessage
   End If
End Function

Function MsiServerAvailable()
   Dim loopCount, objWMIService, oMsiServer, oServicePath, errExecMethod
   MsiServerAvailable = false
   Const maxLoops = 120
   loopCount = 0
   Set objWMIService = GetObject("winmgmts:\\.\root\CIMV2")
   Do While loopCount < maxLoops
      If loopCount > 0 Then
         WScript.Sleep 1000
      End If
      Set oMsiServer = GetObject("winmgmts:Win32_Service='MsiServer'")
      If oMsiServer.State = "Stopped" Then
         MsiServerAvailable = true
         Exit Function
      End If
      Set oServicePath = oMsiServer.Path_
      Set errExecMethod = objWMIService.ExecMethod(oServicePath, "StopService")
      If errExecMethod.ReturnValue = 0 Then
         MsiServerAvailable = true
         Exit Function
      End If
      loopCount = loopCount + 1
   Loop
End Function

Function MsiExec(strOptions)
   Dim loopCount
   Const maxLoops = 3
   loopCount = 0
   Do While loopCount < maxLoops
      If loopCount > 0 Then
         ShowMessage("Next attempt in 30 seconds...")
         WScript.Sleep 30000
      End If
      If MsiServerAvailable() Then
         ShowMessage("Running: MsiExec.exe " & strOptions)
         MsiExec = WshShell.Run("MsiExec.exe " & strOptions, 1, True)
         If MsiExec <> 1618 Then
            Exit Do
         End If
      Else
         MsiExec = 1618
      End If
      loopCount = loopCount + 1
   Loop
   If MsiExec = 0 Then
      ShowMessage("Deployment done!")
   ElseIf MsiExec = 1618 Then
      ShowMessage("Deployment failed: MSI Installer is busy!")
   Else
      ShowMessage("Deployment failed! (Err=" & MsiExec & ")")
   End If
End Function

'
' MAIN
'

Dim nMinutesToAdvance, strCmd, strSystemArchitecture, strTempDir, WshShell, strInstallOrRepair, bInstall
Set WshShell = WScript.CreateObject("WScript.shell")

nMinutesToAdvance = 5

If UninstallOcsAgent = "Yes" Then
   removeOCSAgents()
End If

If RunUninstallFusionInventoryAgent = "Yes" Then
   uninstallFusionInventoryAgent()
End If

strSystemArchitecture = GetSystemArchitecture()
If (strSystemArchitecture <> "x86") And (strSystemArchitecture <> "x64") Then
   ShowMessage("The system architecture is unknown or not supported.")
   ShowMessage("Deployment aborted!")
   WScript.Quit 1
Else
   ShowMessage("System architecture detected: " & strSystemArchitecture)
End If

Select Case LCase(SetupArchitecture)
   Case "x86"
      SetupArchitecture = "x86"
      Setup = Replace(Setup, "x86", SetupArchitecture, 1, 1, vbTextCompare)
      ShowMessage("Setup architecture: " & SetupArchitecture)
   Case "x64"
      SetupArchitecture = "x64"
      Setup = Replace(Setup, "x64", SetupArchitecture, 1, 1, vbTextCompare)
      ShowMessage("Setup architecture: " & SetupArchitecture)
   Case "auto"
      SetupArchitecture = strSystemArchitecture
      Setup = Replace(Setup, "Auto", SetupArchitecture, 1, 1, vbTextCompare)
      ShowMessage("Setup architecture detected: " & SetupArchitecture)
   Case Else
      ShowMessage("The setup architecture '" & SetupArchitecture & "' is not supported.")
      WScript.Quit 2
End Select

If (strSystemArchitecture = "x86") And (SetupArchitecture = "x64") Then
   ShowMessage("It isn't possible to execute a 64-bit setup on a 32-bit operative system.")
   ShowMessage("Deployment aborted!")
   WScript.Quit 3
End If

If (SetupArchitecture = "x86") And doesNotSupportX86(SetupVersion) Then
   ShowMessage("GLPI-Agent v" & SetupVersion & " doesn't support installation on a 32-bit operative system.")
   ShowMessage("Deployment aborted!")
   WScript.Quit 4
End If

bInstall = False
strInstallOrRepair = "/i"

If IsInstallationNeeded(SetupVersion, SetupArchitecture, strSystemArchitecture) Then
   bInstall = True
ElseIf IsSelectedRepair() Then
   strInstallOrRepair = "/fa"
   bInstall = True
ElseIf IsSelectedReconfigure() Then
   ' CORREÇÃO DEFINITIVA: Mudado para REINSTALL=ALL para garantir a reconfiguração completa das chaves e arquivos locais
   If not hasOption("REINSTALL") Then
      SetupOptions = SetupOptions & " REINSTALL=ALL"
   End If
   bInstall = True
End If

If bInstall Then
   If isHttp(SetupLocation) Then
      ShowMessage("Downloading: " & SetupLocation & "/" & Setup)
      If SaveWebBinary(SetupLocation, Setup) Then
         strCmd = WshShell.ExpandEnvironmentStrings("%ComSpec%")
         strTempDir = WshShell.ExpandEnvironmentStrings("%TEMP%")
         MsiExec(strInstallOrRepair & " """ & strTempDir & "\" & Setup & """ " & SetupOptions)
         ShowMessage("Scheduling: DEL /Q /F """ & strTempDir & "\" & Setup & """")
         WshShell.Run "AT.EXE " & AdvanceTime(nMinutesToAdvance) & " " & strCmd & " /C ""DEL /Q /F """"" & strTempDir & "\" & Setup & """""", 0, True
      Else
         ShowMessage("Error downloading '" & SetupLocation & "\" & Setup & "'!")
      End If
   Else
      If SetupLocation <> "" And SetupLocation <> "." Then
         Setup = SetupLocation & "\" & Setup
      End If
      MsiExec(strInstallOrRepair & " """ & Setup & """ " & SetupOptions)
   End If
Else
   ShowMessage("It isn't needed the installation of '" & Setup & "'.")
End If