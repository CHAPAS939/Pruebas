import SwiftUI
import AppKit
import WebKit
import Combine
import UniformTypeIdentifiers
import CoreFoundation

/// The same local room, materials, wardrobe and photo editor on both systems.
struct MochiRoomView: View {
    @ObservedObject var state: AppState
    var standalone=false
    var windowActive=true
    @Environment(\.islandViewActive) private var active
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var revision = 0
    var body: some View {
        MochiStudioWebView(state: state, active: standalone ? windowActive : active && state.mode == .expanded, standalone:standalone, reduceMotion: reduceMotion, revision: revision)
            .onReceive(NotificationCenter.default.publisher(for: UserDefaults.didChangeNotification)) { _ in revision &+= 1 }
    }
}

@MainActor
private struct MochiStudioWebView: NSViewRepresentable {
    @ObservedObject var state: AppState
    let active: Bool
    let standalone: Bool
    let reduceMotion: Bool
    let revision: Int
    private static let defaults: [String: Any] = [
        "mochiRoomLighting":"automatic", "mochiRoomRain":true, "mochiRoomLamp":true, "mochiRoomTheme":"sand",
        "mochiRoomPlant":true, "mochiRoomRug":true, "mochiRoomStyle":"cozy", "mochiRoomPlantKind":"auto",
        "mochiRoomRugKind":"auto", "mochiRoomWallDecor":"auto", "mochiRoomDeskFinish":"auto", "mochiRoomPlantPosition":"left",
        "mochiOutfit":"auto", "mochiOutfitGlasses":"none", "mochiOutfitScarf":false, "mochiSkin":"classic", "mochiAccent":"original", "mochiStudio":"{}"
    ]
    private var snapshot: [String: Any] {
        var preferences: [String: Any] = [:]
        for (key, fallback) in Self.defaults { preferences[key] = UserDefaults.standard.object(forKey: key) ?? fallback }
        return ["active":active,"standalone":standalone, "state":state.effectiveState.rawValue, "outfit":state.resolvedOutfit.rawValue, "seasonalOutfit":Outfit.seasonal(for:Date(),calendar:.current).rawValue,
                "language":state.appLanguage.isEmpty ? Locale.preferredLanguages.first ?? "en" : state.appLanguage,
                "reducedMotion":reduceMotion, "preferences":preferences]
    }
    func makeCoordinator() -> Coordinator { Coordinator(self) }
    func makeNSView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration(); configuration.websiteDataStore = .nonPersistent()
        configuration.preferences.javaScriptCanOpenWindowsAutomatically = false
        configuration.userContentController.add(context.coordinator, name: "mochiStudio")
        let folder=Bundle.main.url(forResource:"mochi-scenes",withExtension:nil)
        if let folder { configuration.setURLSchemeHandler(MochiStudioResources(folder:folder),forURLScheme:MochiStudioResources.scheme) }
        let view = WKWebView(frame: .zero, configuration: configuration)
        view.underPageBackgroundColor = .clear; view.wantsLayer = true; view.layer?.backgroundColor = NSColor.clear.cgColor
        view.navigationDelegate = context.coordinator; context.coordinator.webView = view
        if folder != nil { view.load(URLRequest(url:MochiStudioResources.entry)) }
        return view
    }
    func updateNSView(_ view: WKWebView, context: Context) { context.coordinator.parent = self; context.coordinator.push() }
    static func dismantleNSView(_ view: WKWebView, coordinator: Coordinator) {
        coordinator.active = false; view.evaluateJavaScript("window.MochiStudio?.dispose()", completionHandler: nil)
        view.configuration.userContentController.removeScriptMessageHandler(forName: "mochiStudio");view.navigationDelegate = nil;view.stopLoading()
    }
    @MainActor
    final class Coordinator: NSObject, @preconcurrency WKScriptMessageHandler, @preconcurrency WKNavigationDelegate {
        var parent: MochiStudioWebView
        weak var webView: WKWebView?
        var active = true, ready = false, saving = false
        var last: Data?
        init(_ parent: MochiStudioWebView) { self.parent = parent;super.init() }
        func push() {
            guard active, ready, let view = webView, let data = try? JSONSerialization.data(withJSONObject: parent.snapshot, options: .sortedKeys), data != last else { return }
            last = data; view.callAsyncJavaScript("window.MochiStudio.update(snapshot)", arguments: ["snapshot":parent.snapshot], in: nil, in: .page, completionHandler: nil)
        }
        func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
            guard active, message.frameInfo.isMainFrame, let body = message.body as? [String: Any], body["channel"] as? String == "coucou-mochi-studio" else { return }
            if body["event"] as? String == "loaded" { ready = true; last = nil; push() }
            else if body["event"] as? String == "open-studio" { MochiStudioWindowController.shared.open(state:parent.state) }
            else if body["event"] as? String == "text-focus", body["on"] as? Bool == true { webView?.window?.makeKey(); }
            else if body["event"] as? String == "patch", let patch = body["patch"] as? [String: Any] { apply(patch) }
            else if body["event"] as? String == "photo", let id = body["id"] as? Int, let image = body["data"] as? String { savePhoto(image, id: id) }
        }
        private func apply(_ patch: [String: Any]) {
            let choices: [String: [String]] = ["mochiRoomLighting":["automatic","day","night"], "mochiRoomTheme":["sand","sage","rose","midnight"], "mochiRoomStyle":["cozy","gamer","minimalist","mediterranean"], "mochiRoomPlantKind":["auto","leafy","cactus","olive"], "mochiRoomRugKind":["auto","woven","geometric","checker"], "mochiRoomWallDecor":["auto","botanical","prints","neon","none"], "mochiRoomDeskFinish":["auto","wood","white","dark"], "mochiRoomPlantPosition":["left","right","back"], "mochiOutfit":Outfit.allCases.map(\.rawValue), "mochiOutfitGlasses":["none","sunglasses","roundGlasses"], "mochiSkin":MochiSkin.allCases.map(\.rawValue)]
            let booleans: Set<String> = ["mochiRoomPlant","mochiRoomRug","mochiRoomRain","mochiRoomLamp","mochiOutfitScarf"]
            var changed = false
            for (key, value) in patch {
                if let allowed = choices[key], let text = value as? String, allowed.contains(text) {
                    if key == "mochiOutfit", let outfit = Outfit(rawValue: text) { parent.state.mochiOutfitSelection = outfit }
                    UserDefaults.standard.set(text, forKey: key); changed = true
                } else if booleans.contains(key), let bool = value as? NSNumber, CFGetTypeID(bool) == CFBooleanGetTypeID() {
                    UserDefaults.standard.set(bool.boolValue, forKey: key); changed = true
                } else if key == "mochiAccent", let text = value as? String, text == "original" || (text.count == 7 && text.first == "#" && UInt32(text.dropFirst(), radix: 16) != nil) {
                    UserDefaults.standard.set(text, forKey: key); changed = true
                } else if key == "mochiStudio", let text = value as? String, text.utf8.count <= 32768, let data = text.data(using: .utf8), (try? JSONSerialization.jsonObject(with: data)) is [String: Any] {
                    UserDefaults.standard.set(text, forKey: key); changed = true; MochiDesktopPropsController.shared.sync()
                }
            }
            if changed { parent.state.wardrobePreviewOutfit = nil;parent.state.objectWillChange.send();last = nil;push() }
        }
        private func photoResult(id: Int, success: Bool, cancelled: Bool = false) {
            guard active else { return }
            webView?.callAsyncJavaScript("window.MochiStudio.photoSaved(result)", arguments: ["result":["id":id,"success":success,"cancelled":cancelled]], in: nil, in: .page, completionHandler: nil)
        }
        private func savePhoto(_ image: String, id: Int) {
            guard !saving, let data = MochiPhotoLogic.decode(image) else { photoResult(id:id,success:false);return }
            saving = true
            let wasPinned = parent.state.isPinned;if !parent.standalone { parent.state.isPinned = true }
            let panel = NSSavePanel(); panel.allowedContentTypes = [.png];panel.nameFieldStringValue = "Mochi.png";panel.canCreateDirectories = true
            // This explicit save button is the only action that opens a file dialog.
            NSApp.activate(ignoringOtherApps: true)
            let response = panel.runModal()
            defer { saving = false;if !parent.standalone { parent.state.isPinned = wasPinned } }
            guard response == .OK, let url = panel.url else { photoResult(id:id, success:false, cancelled:true);return }
            do { try data.write(to: url, options: .atomic); photoResult(id:id, success:true) }
            catch { photoResult(id:id, success:false) }
        }
        func webView(_ view: WKWebView, decidePolicyFor action: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            guard let url = action.request.url, MochiStudioResources.permits(url) else { decisionHandler(.cancel);return }
            decisionHandler(.allow)
        }
        func webViewWebContentProcessDidTerminate(_ view: WKWebView) { ready = false;last = nil;if active { view.reload() } }
    }
}
