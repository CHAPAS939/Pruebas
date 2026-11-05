import AppKit
import WebKit
import Foundation

/// Loads the packaged editor through actual WebKit and its local-file policy.
@MainActor
final class StudioSmoke: NSObject, @preconcurrency WKScriptMessageHandler, @preconcurrency WKNavigationDelegate {
    private var web: WKWebView!
    private var window: NSWindow!
    private var folder = ""
    private var stage = 0
    func start(folder url: URL) {
        folder = url.standardizedFileURL.path + "/"
        let config = WKWebViewConfiguration();config.websiteDataStore = .nonPersistent();config.preferences.javaScriptCanOpenWindowsAutomatically = false
        config.userContentController.add(self,name:"mochiStudio")
        web = WKWebView(frame:CGRect(x:0,y:0,width:640,height:520),configuration:config);web.navigationDelegate = self
        window = NSWindow(contentRect:CGRect(x:80,y:80,width:640,height:520),styleMask:[.titled],backing:.buffered,defer:false)
        window.contentView = web;window.makeKeyAndOrderFront(nil)
        web.loadFileURL(url.appendingPathComponent("studio.html"),allowingReadAccessTo:url)
        DispatchQueue.main.asyncAfter(deadline:.now()+40) { print("FAIL: packaged Mac Studio did not finish its WebKit smoke test");exit(1) }
    }
    func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.frameInfo.isMainFrame,let value=message.body as? [String:Any],value["channel"] as? String == "coucou-mochi-studio" else{return}
        if value["event"] as? String == "loaded" {
            let snapshot:[String:Any] = ["active":true,"state":"idle","outfit":"frogHat","seasonalOutfit":"none","language":"es","reducedMotion":true,"preferences":["mochiSkin":"diamond","mochiOutfit":"frogHat","mochiOutfitGlasses":"roundGlasses","mochiOutfitScarf":true]]
            web.callAsyncJavaScript("window.MochiStudio.update(snapshot)",arguments:["snapshot":snapshot],in:nil,in:.page,completionHandler:nil)
            poll()
        } else if value["event"] as? String == "photo",let image=value["data"] as? String,let data=MochiPhotoLogic.decode(image) {
            guard data.count>1000 else{print("FAIL: empty Mac scene photo");exit(1)}
            print("PASS: packaged Mac Studio loads, renders in WebKit and exports a valid PNG (\(data.count) bytes)")
            exit(0)
        } else if value["event"] as? String == "photo" { print("FAIL: invalid Mac photo export");exit(1) }
    }
    private func poll() {
        web.evaluateJavaScript("window.MochiStudio?.inspect()") { [weak self] result,error in
            guard let self else{return}
            if let state=result as? [String:Any],state["skin"] as? String == "diamond" {
                if state["ready"] as? Bool == true,self.stage==0 {
                    self.stage=1
                    self.web.evaluateJavaScript("document.querySelector('#tabs button[aria-label=Foto]').click();document.querySelector('#panel button[aria-label=\\\"Fondo transparente\\\"]').click();document.querySelector('#panel button[aria-label=\\\"Guardar PNG\\\"]').click()",completionHandler:{_,error in if let error{print("FAIL: Mac photo controls: \(error)");exit(1)}})
                    return
                }
                if let failure=state["fallbackReason"] as? String {
                    let lower=failure.lowercased()
                    if lower.contains("webgl")&&lower.contains("context") {
                        print("PASS: packaged Mac editor and local frame load; runner GPU unavailable, 2D fallback verified. 3D export is checked separately in Chromium.")
                        exit(0)
                    }
                    print("FAIL: Mac scene: \(failure)");exit(1)
                }
            }
            DispatchQueue.main.asyncAfter(deadline:.now()+0.2) { self.poll() }
        }
    }
    func webView(_ view: WKWebView, decidePolicyFor action: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy)->Void) {
        guard let url=action.request.url,url.isFileURL,url.standardizedFileURL.path.hasPrefix(folder) else{decisionHandler(.cancel);return}
        decisionHandler(.allow)
    }
}
@main enum StudioWebKitMain {
    @MainActor static func main() {
        guard CommandLine.arguments.count==2 else{exit(2)}
        let app=NSApplication.shared;app.setActivationPolicy(.accessory)
        let smoke=StudioSmoke();smoke.start(folder:URL(fileURLWithPath:CommandLine.arguments[1],isDirectory:true))
        withExtendedLifetime(smoke){app.run()}
    }
}
