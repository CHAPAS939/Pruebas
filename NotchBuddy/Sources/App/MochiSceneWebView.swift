import AppKit
import SwiftUI
import WebKit

/// A bounded display contract. No prompts, commands, filenames, keys or app APIs enter WebKit.
struct MochiSceneSettings: Encodable, Equatable {
    var state: String = "idle"
    var emote: String? = nil
    var paused = true
    var reduceMotion = false
    var night = false
    var rain = true
    var lamp = true
    var character = true
    var perched = false
    var lookX: Double = 0
    var lookY: Double = 0
}

/// The exact same offline geometry is bundled by XcodeGen and by the Windows Vite build.
/// Native controls and window lifecycle stay in AppKit; the page only draws.
struct MochiSceneWebView: NSViewRepresentable {
    enum Kind: String { case home, perch }
    let kind: Kind
    var settings: MochiSceneSettings
    var onReady: (Bool) -> Void
    var onAnchor: (CGPoint) -> Void = { _ in }

    func makeCoordinator() -> Coordinator { Coordinator(self) }

    func makeNSView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .nonPersistent()
        configuration.preferences.javaScriptCanOpenWindowsAutomatically = false
        configuration.userContentController.add(context.coordinator, name: "mochiScene")
        let view = WKWebView(frame: .zero, configuration: configuration)
        view.underPageBackgroundColor = .clear
        view.wantsLayer = true
        view.layer?.backgroundColor = NSColor.clear.cgColor
        view.navigationDelegate = context.coordinator
        context.coordinator.webView = view
        guard let folder = Bundle.main.url(forResource: "mochi-scenes", withExtension: nil),
              var components = URLComponents(url: folder.appendingPathComponent("index.html"), resolvingAgainstBaseURL: false) else {
            DispatchQueue.main.async { onReady(false) }
            return view
        }
        components.queryItems = [URLQueryItem(name: "scene", value: kind.rawValue)]
        context.coordinator.resourceFolder = folder.standardizedFileURL.path + "/"
        if let url = components.url { view.loadFileURL(url, allowingReadAccessTo: folder) }
        return view
    }

    func updateNSView(_ view: WKWebView, context: Context) {
        context.coordinator.parent = self
        context.coordinator.push()
    }

    static func dismantleNSView(_ view: WKWebView, coordinator: Coordinator) {
        coordinator.active = false
        view.evaluateJavaScript("window.MochiScene?.dispose()", completionHandler: nil)
        view.configuration.userContentController.removeScriptMessageHandler(forName: "mochiScene")
        view.navigationDelegate = nil
        view.stopLoading()
    }

    @MainActor
    final class Coordinator: NSObject, @preconcurrency WKScriptMessageHandler, @preconcurrency WKNavigationDelegate {
        var parent: MochiSceneWebView
        weak var webView: WKWebView?
        var resourceFolder = ""
        var active = true
        private var ready = false
        private var lastSettings: MochiSceneSettings?

        init(_ parent: MochiSceneWebView) { self.parent = parent; super.init() }

        func push() {
            guard active, ready, let webView, parent.settings != lastSettings,
                  let data = try? JSONEncoder().encode(parent.settings),
                  let value = try? JSONSerialization.jsonObject(with: data) else { return }
            lastSettings = parent.settings
            webView.callAsyncJavaScript("window.MochiScene.update(settings)", arguments: ["settings": value],
                                        in: nil, contentWorld: .page, completionHandler: nil)
        }

        func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
            guard active, message.frameInfo.isMainFrame,
                  let body = message.body as? [String: Any],
                  body["channel"] as? String == "coucou-mochi-scene" else { return }
            switch body["event"] as? String {
            case "loaded":
                ready = true; lastSettings = nil; push()
            case "ready":
                parent.onReady(true)
            case "fallback":
                ready = false; parent.onReady(false)
            case "anchor":
                if let a = body["anchor"] as? [String: Double], let x = a["x"], let y = a["y"], x.isFinite, y.isFinite {
                    parent.onAnchor(CGPoint(x: min(1, max(0, x)), y: min(1, max(0, y))))
                }
            default: break
            }
        }

        func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction,
                     decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            guard let url = action.request.url, url.isFileURL,
                  url.standardizedFileURL.path.hasPrefix(resourceFolder), !resourceFolder.isEmpty else {
                decisionHandler(.cancel); return
            }
            decisionHandler(.allow)
        }

        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            if active { parent.onReady(false) }
        }

        func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
            ready = false
            if active { parent.onReady(false) }
        }
    }
}
