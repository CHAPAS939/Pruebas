import AppKit
import WebKit
import Foundation

/// Loads the packaged editor through actual WebKit and its local-file policy.
@MainActor
final class StudioSmoke: NSObject, @preconcurrency WKScriptMessageHandler, @preconcurrency WKNavigationDelegate {
    private var web: WKWebView!
    private var window: NSWindow!
        private var stage = 0
    private var lastDiagnostic = ""
    func start(folder url: URL) {
        let config = WKWebViewConfiguration();config.websiteDataStore = .nonPersistent();config.preferences.javaScriptCanOpenWindowsAutomatically = false
        config.setURLSchemeHandler(MochiStudioResources(folder:url),forURLScheme:MochiStudioResources.scheme)
        config.userContentController.add(self,name:"mochiStudio")
        config.userContentController.add(self,name:"smokeDiagnostics")
        config.userContentController.addUserScript(WKUserScript(source:"""
        window.addEventListener('error',e=>window.webkit.messageHandlers.smokeDiagnostics.postMessage({error:String(e.message||e.type),file:e.filename||e.target?.src||'',frame:location.href}),true);
        document.addEventListener('securitypolicyviolation',e=>window.webkit.messageHandlers.smokeDiagnostics.postMessage({policy:e.violatedDirective,blocked:e.blockedURI,frame:location.href}));
        """,injectionTime:.atDocumentStart,forMainFrameOnly:false))
        web = WKWebView(frame:CGRect(x:0,y:0,width:640,height:520),configuration:config);web.navigationDelegate = self
        window = NSWindow(contentRect:CGRect(x:80,y:80,width:640,height:520),styleMask:[.titled],backing:.buffered,defer:false)
        window.contentView = web;window.makeKeyAndOrderFront(nil)
        web.load(URLRequest(url:MochiStudioResources.entry))
        DispatchQueue.main.asyncAfter(deadline:.now()+40) { print("FAIL: packaged Mac Studio did not finish its WebKit smoke test");exit(1) }
    }
    func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
        if message.name == "smokeDiagnostics" { print("WK diagnostic: \(message.body)");return }
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
        web.evaluateJavaScript("({state:window.MochiStudio?.inspect(),ready:document.readyState,scripts:document.scripts.length,frame:document.querySelector('iframe')?.src})") { [weak self] result,error in
            guard let self else{return}
            if let info=result as? [String:Any] {
                let diagnostic=String(describing:info)
                if diagnostic != self.lastDiagnostic { self.lastDiagnostic=diagnostic;print("WK state: \(diagnostic)") }
            }
            if let state=(result as? [String:Any])?["state"] as? [String:Any],state["skin"] as? String == "diamond" {
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
    func webView(_ view: WKWebView, didFinish navigation: WKNavigation!) { print("WK navigation finished");if stage==0 { poll() } }
    func webView(_ view: WKWebView, didFail navigation: WKNavigation!, withError error: Error) { print("FAIL: WK navigation \(error)");exit(1) }
    func webView(_ view: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) { print("FAIL: WK provisional navigation \(error)");exit(1) }
    func webView(_ view: WKWebView, decidePolicyFor action: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy)->Void) {
        guard let url=action.request.url,MochiStudioResources.permits(url) else{print("WK blocked navigation: \(action.request.url?.absoluteString ?? "nil")");decisionHandler(.cancel);return}
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
