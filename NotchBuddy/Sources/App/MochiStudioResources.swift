import Foundation
import WebKit

/// Give the sandboxed frame a local origin without WebKit's file-subframe restrictions.
/// Only flat, bundled scene assets can be read; this never opens a network listener.
final class MochiStudioResources: NSObject, WKURLSchemeHandler {
    static let scheme = "coucou-mochi"
    static let entry = URL(string: "coucou-mochi://studio/studio.html")!
    private let folder: URL
    init(folder: URL) { self.folder=folder.standardizedFileURL;super.init() }
    static func permits(_ url: URL) -> Bool {
        let name=url.lastPathComponent
        return url.scheme == scheme && url.host == "studio" && url.path == "/"+name
            && ["html","js","css"].contains(url.pathExtension.lowercased())
    }
    func webView(_ webView: WKWebView, start urlSchemeTask: WKURLSchemeTask) {
        guard let url=urlSchemeTask.request.url,Self.permits(url),
              let data=try? Data(contentsOf:folder.appendingPathComponent(url.lastPathComponent)) else {
            urlSchemeTask.didFailWithError(URLError(.fileDoesNotExist));return
        }
        let mime=["html":"text/html; charset=utf-8","js":"text/javascript; charset=utf-8","css":"text/css; charset=utf-8"][url.pathExtension.lowercased()]!
        let response=HTTPURLResponse(url:url,statusCode:200,httpVersion:"HTTP/1.1",headerFields:["Content-Type":mime,"Access-Control-Allow-Origin":"*","Cache-Control":"no-store"])!
        urlSchemeTask.didReceive(response);urlSchemeTask.didReceive(data);urlSchemeTask.didFinish()
    }
    func webView(_ webView: WKWebView, stop urlSchemeTask: WKURLSchemeTask) {}
}
