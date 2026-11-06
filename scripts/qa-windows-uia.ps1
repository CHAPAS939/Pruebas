param([ValidateSet('tree','invoke')][string]$Action, [long]$Handle, [string]$Pattern)
$ErrorActionPreference='Stop'
[Console]::OutputEncoding=[Text.UTF8Encoding]::new($false)
Add-Type -AssemblyName UIAutomationClient,UIAutomationTypes
$Root=if($Handle -eq 0){[System.Windows.Automation.AutomationElement]::RootElement}else{[System.Windows.Automation.AutomationElement]::FromHandle([IntPtr]::new($Handle))}
if(-not $Root){throw 'Native UI Automation root is unavailable'}
$Items=$Root.FindAll([System.Windows.Automation.TreeScope]::Descendants,[System.Windows.Automation.Condition]::TrueCondition)
$Rows=@()
foreach($Item in $Items){
 try{
  $Current=$Item.Current
  if($Current.Name){$Rows+=@{name=$Current.Name;type=$Current.ControlType.ProgrammaticName;offscreen=$Current.IsOffscreen;enabled=$Current.IsEnabled;rect=@{x=$Current.BoundingRectangle.X;y=$Current.BoundingRectangle.Y;width=$Current.BoundingRectangle.Width;height=$Current.BoundingRectangle.Height}}}
  if($Action -eq 'invoke' -and $Current.Name -match $Pattern -and $Current.IsEnabled -and $Current.ControlType.ProgrammaticName -match 'Button|TabItem|MenuItem|CheckBox'){
   $Control=$null
   if($Item.TryGetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern,[ref]$Control)){$Control.Invoke();@{invoked=$Current.Name;method='native InvokePattern'}|ConvertTo-Json -Compress;return}
   if($Item.TryGetCurrentPattern([System.Windows.Automation.SelectionItemPattern]::Pattern,[ref]$Control)){$Control.Select();@{invoked=$Current.Name;method='native SelectionItemPattern'}|ConvertTo-Json -Compress;return}
   throw "Native control does not expose an invocation pattern: $($Current.Name)"
  }
 }catch [System.Windows.Automation.ElementNotAvailableException]{}
}
if($Action -eq 'invoke'){throw "Native control not found: $Pattern. Available: $(($Rows|ForEach-Object{$_.name}) -join ', ')"}
ConvertTo-Json -InputObject @($Rows) -Depth 5 -Compress
