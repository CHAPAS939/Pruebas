import AppKit
import SwiftUI

@MainActor
private final class StudioVisibility: ObservableObject { @Published var active=true }

@MainActor
final class MochiStudioWindowController: NSWindowController, NSWindowDelegate {
    static let shared=MochiStudioWindowController()
    private let visibility=StudioVisibility()
    private init(){super.init(window:nil)}
    required init?(coder:NSCoder){return nil}
    func open(state:AppState){
        if window == nil {
            let view=NSWindow(contentRect:NSRect(x:0,y:0,width:1120,height:780),styleMask:[.titled,.closable,.miniaturizable,.resizable],backing:.buffered,defer:false)
            view.title="Mochi Studio — Coucou";view.minSize=NSSize(width:760,height:560)
            view.isReleasedWhenClosed=false;view.backgroundColor=NSColor(calibratedRed:0.09,green:0.10,blue:0.11,alpha:1)
            view.contentView=NSHostingView(rootView:StudioWindowContent(state:state,visibility:visibility));view.delegate=self;view.center();window=view
        }
        visibility.active=true;showWindow(nil);window?.makeKeyAndOrderFront(nil);NSApp.activate(ignoringOtherApps:true)
    }
    func windowWillClose(_ notification:Notification){visibility.active=false}
    func windowDidMiniaturize(_ notification:Notification){visibility.active=false}
    func windowDidDeminiaturize(_ notification:Notification){visibility.active=true}
    func windowDidChangeOcclusionState(_ notification:Notification){visibility.active=window?.occlusionState.contains(.visible)==true}
}

private struct StudioWindowContent: View {
    @ObservedObject var state:AppState
    @ObservedObject var visibility:StudioVisibility
    var body:some View { MochiRoomView(state:state,standalone:true,windowActive:visibility.active).frame(maxWidth:.infinity,maxHeight:.infinity) }
}
