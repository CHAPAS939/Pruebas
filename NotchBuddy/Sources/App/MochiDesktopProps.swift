import AppKit
import SwiftUI
import WebKit

/// Static little objects: no animation timer, tracking poll or access to other apps.
@MainActor
final class MochiDesktopPropsController: NSObject, @preconcurrency NSWindowDelegate {
    static let shared = MochiDesktopPropsController()
    private let ids = ["cup", "cushion", "plant"]
    private var panels: [String: NSPanel] = [:]
    private var marker: NSPanel?
    func sync() {
        let text = UserDefaults.standard.string(forKey: "mochiStudio") ?? "{}"
        let data = text.data(using: .utf8) ?? Data()
        let doc = (try? JSONSerialization.jsonObject(with: data)) as? [String: Any] ?? [:]
        let selected = Set((doc["desktopProps"] as? [String] ?? []).filter { ids.contains($0) })
        for (index, id) in ids.enumerated() {
            guard selected.contains(id) else { panels[id]?.orderOut(nil);continue }
            if let panel = panels[id] { panel.orderFrontRegardless();continue }
            guard let folder = Bundle.main.url(forResource: "mochi-scenes", withExtension: nil), let screen = NSScreen.main ?? NSScreen.screens.first else { continue }
            let frame = screen.visibleFrame, side: CGFloat = 92
            var origin = CGPoint(x: frame.maxX-side*CGFloat(index+2)-24, y: frame.minY+30)
            if let saved = UserDefaults.standard.dictionary(forKey: "mochiPropPositions")?[id] as? [Double], saved.count == 2, saved.allSatisfy(\.isFinite) {
                let point = CGPoint(x: saved[0], y: saved[1])
                if let display = NSScreen.screens.first(where: { $0.visibleFrame.contains(point) })?.visibleFrame { origin = CGPoint(x: min(max(point.x,display.minX),display.maxX-side), y: min(max(point.y,display.minY),display.maxY-side)) }
            }
            let panel = MochiPropPanel(contentRect: CGRect(origin: origin, size: CGSize(width:side,height:side)), styleMask:[.borderless,.nonactivatingPanel], backing:.buffered, defer:false)
            panel.isOpaque = false;panel.backgroundColor = .clear;panel.hasShadow = false;panel.level = .floating
            panel.collectionBehavior = [.canJoinAllSpaces,.stationary,.ignoresCycle,.fullScreenAuxiliary]
            panel.hidesOnDeactivate = false;panel.isMovableByWindowBackground = true;panel.delegate = self
            panel.identifier = NSUserInterfaceItemIdentifier(id)
            let config = WKWebViewConfiguration();config.websiteDataStore = .nonPersistent();config.preferences.javaScriptCanOpenWindowsAutomatically = false
            let view = MochiPropWebView(frame: CGRect(x:0,y:0,width:side,height:side), configuration:config)
            view.underPageBackgroundColor = .clear;view.wantsLayer = true;view.layer?.backgroundColor = NSColor.clear.cgColor
            view.putAway = { [weak self] in self?.putAway(id) }
            var url = URLComponents(url:folder.appendingPathComponent("prop.html"),resolvingAgainstBaseURL:false)!
            url.queryItems = [URLQueryItem(name:"id",value:id)]
            if let address=url.url { view.loadFileURL(address,allowingReadAccessTo:folder) }
            panel.contentView = view;panels[id] = panel;panel.orderFrontRegardless()
        }
    }
    private func putAway(_ id: String) {
        let data = (UserDefaults.standard.string(forKey:"mochiStudio") ?? "{}").data(using:.utf8) ?? Data()
        var doc = (try? JSONSerialization.jsonObject(with:data)) as? [String:Any] ?? [:]
        doc["desktopProps"] = (doc["desktopProps"] as? [String] ?? []).filter { $0 != id }
        if let data=try? JSONSerialization.data(withJSONObject:doc),let text=String(data:data,encoding:.utf8) { UserDefaults.standard.set(text,forKey:"mochiStudio") }
        panels[id]?.orderOut(nil);AppState.shared.objectWillChange.send()
    }
    func windowDidMove(_ notification: Notification) {
        guard let panel=notification.object as? NSPanel,let id=panel.identifier?.rawValue,ids.contains(id) else { return }
        var spots=UserDefaults.standard.dictionary(forKey:"mochiPropPositions") ?? [:]
        spots[id]=[Double(panel.frame.minX),Double(panel.frame.minY)];UserDefaults.standard.set(spots,forKey:"mochiPropPositions")
    }
    func snap(at point: CGPoint?) {
        guard let point else { marker?.orderOut(nil);return }
        if marker == nil {
            let panel=MochiPropPanel(contentRect:CGRect(x:0,y:0,width:96,height:8),styleMask:[.borderless,.nonactivatingPanel],backing:.buffered,defer:false)
            panel.isOpaque=false;panel.backgroundColor = .clear;panel.hasShadow=false;panel.level = .floating;panel.ignoresMouseEvents=true
            panel.collectionBehavior=[.canJoinAllSpaces,.stationary,.ignoresCycle,.fullScreenAuxiliary];panel.hidesOnDeactivate=false
            panel.contentView=NSHostingView(rootView:Capsule().fill(LinearGradient(colors:[Color(hex:"#A7D3C1").opacity(0),Color(hex:"#D8F6E7"),Color(hex:"#A7D3C1").opacity(0)],startPoint:.leading,endPoint:.trailing)).padding(.vertical,2))
            marker=panel
        }
        marker?.setFrameOrigin(CGPoint(x:point.x-48,y:point.y-4));marker?.orderFrontRegardless()
    }
}

private final class MochiPropPanel: NSPanel {
    override var canBecomeKey: Bool { false }
    override var canBecomeMain: Bool { false }
}
private final class MochiPropWebView: WKWebView {
    var putAway: (() -> Void)?
    override func hitTest(_ point: NSPoint) -> NSView? { bounds.contains(point) ? self : nil }
    override func mouseDown(with event: NSEvent) { window?.performDrag(with:event) }
    override func rightMouseDown(with event: NSEvent) {
        let menu=NSMenu();let item=NSMenuItem(title:"↩ Coucou",action:#selector(storeObject),keyEquivalent:"");item.target=self;menu.addItem(item);NSMenu.popUpContextMenu(menu,with:event,for:self)
    }
    @objc private func storeObject() { putAway?() }
}
