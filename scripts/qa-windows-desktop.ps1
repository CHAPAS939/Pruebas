param([ValidateSet('fixture','prepare-desktop','state','drag','move','close','minimize','show','hover','click','desktop-shortcut','context','capture','record','sample')][string]$Action, [string]$Out, [int]$AppPid, [long]$Handle, [int]$X, [int]$Y, [int]$EndX, [int]$EndY)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms,System.Drawing
Add-Type @'
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;
public class MochiQA {
  public delegate bool EnumProc(IntPtr h, IntPtr l);
  [StructLayout(LayoutKind.Sequential)] public struct Rect { public int Left,Top,Right,Bottom; }
  public class Win { public long handle; public string title; public int x,y,width,height; public bool visible,minimized; }
  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumProc p,IntPtr l);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h,out uint p);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h,out Rect r);
  [DllImport("user32.dll",CharSet=CharSet.Unicode)] public static extern int GetWindowText(IntPtr h,StringBuilder s,int n);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h);
  [DllImport("user32.dll")] public static extern void keybd_event(byte key,byte scan,uint flags,UIntPtr extra);
  [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr h);
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x,int y);
  [DllImport("user32.dll")] public static extern void mouse_event(uint flags,uint dx,uint dy,uint data,UIntPtr extra);
  [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr h,IntPtr after,int x,int y,int w,int ht,uint flags);
  [DllImport("user32.dll")] public static extern bool PostMessage(IntPtr h,uint m,IntPtr w,IntPtr l);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h,int c);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern IntPtr SetThreadDpiAwarenessContext(IntPtr c);
  [StructLayout(LayoutKind.Sequential)] public struct MouseInput { public int dx,dy;public uint mouseData,flags,time;public UIntPtr extra; }
  [StructLayout(LayoutKind.Explicit)] public struct InputUnion { [FieldOffset(0)] public MouseInput mouse; }
  [StructLayout(LayoutKind.Sequential)] public struct Input { public uint type;public InputUnion data; }
  [DllImport("user32.dll",SetLastError=true)] public static extern uint SendInput(uint count,Input[] input,int size);
  [DllImport("user32.dll")] public static extern int GetSystemMetrics(int index);
  [DllImport("user32.dll")] public static extern short GetAsyncKeyState(int key);
  public static void Pointer(int x,int y,uint flags) {
    var mi=new MouseInput {dx=(int)Math.Round(x*65535.0/(GetSystemMetrics(0)-1)),dy=(int)Math.Round(y*65535.0/(GetSystemMetrics(1)-1)),flags=flags|0x8000};
    var input=new Input {type=0,data=new InputUnion {mouse=mi}};
    if(SendInput(1,new[]{input},Marshal.SizeOf<Input>())!=1)throw new Exception("Native SendInput rejected mouse input: "+Marshal.GetLastWin32Error());
  }
  public static Win[] Windows(int owner) {
    var list=new List<Win>();
    EnumWindows((h,l)=>{uint p;GetWindowThreadProcessId(h,out p);if(owner!=0 && p!=(uint)owner)return true;
      Rect r;GetWindowRect(h,out r);var s=new StringBuilder(512);GetWindowText(h,s,512);
      list.Add(new Win {handle=h.ToInt64(),title=s.ToString(),x=r.Left,y=r.Top,width=r.Right-r.Left,height=r.Bottom-r.Top,visible=IsWindowVisible(h),minimized=IsIconic(h)});return true;
    },IntPtr.Zero);return list.ToArray();
  }
}
'@
[MochiQA]::SetThreadDpiAwarenessContext([IntPtr]::new(-4)) | Out-Null
function Save-Screen([string]$Path) {
  $Bounds=[System.Windows.Forms.Screen]::PrimaryScreen.Bounds
  $Bitmap=[System.Drawing.Bitmap]::new($Bounds.Width,$Bounds.Height)
  $Graphics=[System.Drawing.Graphics]::FromImage($Bitmap)
  try {$Graphics.CopyFromScreen($Bounds.Location,[System.Drawing.Point]::Empty,$Bounds.Size);$Bitmap.Save($Path,[System.Drawing.Imaging.ImageFormat]::Png)}
  finally {$Graphics.Dispose();$Bitmap.Dispose()}
}
switch ($Action) {
  'fixture' {
    $Bounds=[System.Windows.Forms.Screen]::PrimaryScreen.Bounds
    $Forms=@()
    foreach ($Item in @(@('Design notes',120,290),@('Preview',520,170))) {
      $Form=[System.Windows.Forms.Form]::new();$Form.Text=$Item[0];$Form.StartPosition='Manual'
      $Form.Location=[System.Drawing.Point]::new([int]$Item[1],[int]$Item[2]);$Form.Size=[System.Drawing.Size]::new([Math]::Min(460,$Bounds.Width-140),300)
      $Form.BackColor=[System.Drawing.ColorTranslator]::FromHtml('#eee9df')
      $Label=[System.Windows.Forms.Label]::new();$Label.Text="Coucou contributor demo`n`nNative Windows test window`n`nMochi follows the exposed top edge.";$Label.Font=[System.Drawing.Font]::new('Segoe UI',15);$Label.Dock='Fill';$Label.Padding=[System.Windows.Forms.Padding]::new(28);$Form.Controls.Add($Label)
      $Form.Show();$Forms+=$Form
    }
    foreach($Form in $Forms){
      # A hidden console startup flag may suppress the first Form.Show().
      # Explicitly show the real fixture, then bring its normal window forward.
      [MochiQA]::ShowWindow($Form.Handle,9)|Out-Null
      [MochiQA]::SetWindowPos($Form.Handle,[IntPtr]::Zero,0,0,0,0,0x43)|Out-Null
      $Form.BringToFront();$Form.Activate()
    }
    $Forms | ForEach-Object { @{handle=$_.Handle.ToInt64();title=$_.Text;x=$_.Left;y=$_.Top;width=$_.Width;height=$_.Height} } | ConvertTo-Json | Set-Content $Out
    $Timer=[System.Windows.Forms.Timer]::new();$Timer.Interval=500;$Timer.Add_Tick({if(Test-Path ($Out+'.stop')){[System.Windows.Forms.Application]::Exit()}});$Timer.Start()
    [System.Windows.Forms.Application]::Run()
  }
  'prepare-desktop' {
    $Changed=@()
    foreach($Window in [MochiQA]::Windows(0)){
      if($Window.visible -and $Window.title -eq 'System Properties'){[MochiQA]::PostMessage([IntPtr]::new($Window.handle),0x10,[IntPtr]::Zero,[IntPtr]::Zero)|Out-Null;$Changed+=$Window.title}
      elseif($Window.visible -and $Window.title -like '*GitHub*Host*'){[MochiQA]::ShowWindow([IntPtr]::new($Window.handle),6)|Out-Null;$Changed+=$Window.title}
    }
    ConvertTo-Json -InputObject @($Changed) -Compress
  }
  'state' { ConvertTo-Json -InputObject @([MochiQA]::Windows($AppPid)) -Depth 4 -Compress }
  'drag' {
    [MochiQA]::Pointer($X,$Y,1);Start-Sleep -Milliseconds 1400
    [MochiQA]::Pointer($X,$Y,3);Start-Sleep -Milliseconds 450
    $Pressed=([MochiQA]::GetAsyncKeyState(1) -band 0x8000) -ne 0
    try {for($i=1;$i -le 40;$i++){[MochiQA]::Pointer([int]($X+($EndX-$X)*$i/40),[int]($Y+($EndY-$Y)*$i/40),1);Start-Sleep -Milliseconds 55}}
    finally {[MochiQA]::Pointer($EndX,$EndY,5)}
    Start-Sleep -Milliseconds 900
    [MochiQA]::SetCursorPos(30,600)|Out-Null
    @{method='Win32 SendInput';leftButtonObservedDown=$Pressed;from=@($X,$Y);to=@($EndX,$EndY)}|ConvertTo-Json -Compress
  }
  'move' { [MochiQA]::SetWindowPos([IntPtr]::new($Handle),[IntPtr]::Zero,$X,$Y,0,0,0x15)|Out-Null }
  'close' { [MochiQA]::PostMessage([IntPtr]::new($Handle),0x10,[IntPtr]::Zero,[IntPtr]::Zero)|Out-Null }
  'minimize' { [MochiQA]::ShowWindow([IntPtr]::new($Handle),6)|Out-Null }
  'show' { [MochiQA]::ShowWindow([IntPtr]::new($Handle),9)|Out-Null;[MochiQA]::SetForegroundWindow([IntPtr]::new($Handle))|Out-Null }
  'hover' { [MochiQA]::SetCursorPos($X,$Y)|Out-Null;Start-Sleep -Milliseconds 800 }
  'desktop-shortcut' {
    try {foreach($Key in @(17,18,68)){[MochiQA]::keybd_event([byte]$Key,0,0,[UIntPtr]::Zero);Start-Sleep -Milliseconds 80}}
    finally {foreach($Key in @(68,18,17)){[MochiQA]::keybd_event([byte]$Key,0,2,[UIntPtr]::Zero)}}
    Start-Sleep -Milliseconds 1200
  }
  'click' { [MochiQA]::SetCursorPos($X,$Y)|Out-Null;Start-Sleep -Milliseconds 150;[MochiQA]::mouse_event(2,0,0,0,[UIntPtr]::Zero);[MochiQA]::mouse_event(4,0,0,0,[UIntPtr]::Zero);Start-Sleep -Milliseconds 300 }
  'context' { [MochiQA]::SetCursorPos($X,$Y)|Out-Null;Start-Sleep -Milliseconds 200;[MochiQA]::mouse_event(8,0,0,0,[UIntPtr]::Zero);[MochiQA]::mouse_event(16,0,0,0,[UIntPtr]::Zero);Start-Sleep -Milliseconds 300 }
  'capture' { Save-Screen $Out }
  'record' {
    New-Item -ItemType Directory -Path $Out -Force|Out-Null
    $Clock=[System.Diagnostics.Stopwatch]::StartNew();$Rows=[System.Collections.Generic.List[object]]::new();$Index=0
    while($Clock.Elapsed.TotalSeconds -lt 70 -and -not (Test-Path (Join-Path $Out 'stop'))) {
      $Time=$Clock.Elapsed.TotalSeconds;$Name=('{0:D5}.png' -f $Index);Save-Screen (Join-Path $Out $Name)
      $Rows.Add(@{file=$Name;seconds=$Time});$Index++;Start-Sleep -Milliseconds 100
    }
    ConvertTo-Json -InputObject @($Rows.ToArray()) -Depth 3 | Set-Content (Join-Path $Out 'timing.json')
  }
  'sample' {
    function Snapshot {
      $All=Get-CimInstance Win32_Process;$Ids=[System.Collections.Generic.HashSet[int]]::new();$Ids.Add($AppPid)|Out-Null
      do {$Before=$Ids.Count;foreach($P in $All){if($Ids.Contains([int]$P.ParentProcessId)){$Ids.Add([int]$P.ProcessId)|Out-Null}}} while($Ids.Count -gt $Before)
      $CPU=0.0;$RSS=0L;$Private=0L;$Count=0
      foreach($Id in $Ids){$P=Get-Process -Id $Id -ErrorAction SilentlyContinue;if($P){$CPU+=$P.TotalProcessorTime.TotalSeconds;$RSS+=$P.WorkingSet64;$Private+=$P.PrivateMemorySize64;$Count++}}
      @{cpu=$CPU;workingSetBytes=$RSS;privateBytes=$Private;processCount=$Count}
    }
    $Start=Snapshot;$Clock=[System.Diagnostics.Stopwatch]::StartNew();Start-Sleep -Seconds 5;$End=Snapshot
    @{seconds=$Clock.Elapsed.TotalSeconds;cpuPercentOneCore=[Math]::Max(0,($End.cpu-$Start.cpu)/$Clock.Elapsed.TotalSeconds*100);logicalProcessors=[Environment]::ProcessorCount;workingSetBytes=$End.workingSetBytes;privateBytes=$End.privateBytes;processCount=$End.processCount;scope='Coucou plus descendant processes; GitHub-hosted Windows VM, not a user-device benchmark'}|ConvertTo-Json -Compress
  }
}
