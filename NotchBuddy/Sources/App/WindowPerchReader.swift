import AppKit

/// Reads geometry and process IDs only. No AX access, titles, screenshots or window contents.
@MainActor
enum WindowPerchReader {
    struct Snapshot {
        let id: CGWindowID
        let pid: pid_t
        let frame: CGRect
        let onScreen: Bool
    }

    private static func snapshot(_ info: [String: Any]) -> Snapshot? {
        guard let id = info[kCGWindowNumber as String] as? UInt32,
              let pid = info[kCGWindowOwnerPID as String] as? Int32,
              pid != ProcessInfo.processInfo.processIdentifier,
              let app = NSRunningApplication(processIdentifier: pid),
              app.activationPolicy == .regular,
              let layer = info[kCGWindowLayer as String] as? Int, layer == 0,
              let bounds = info[kCGWindowBounds as String] as? [String: Any],
              let x = bounds["X"] as? NSNumber, let y = bounds["Y"] as? NSNumber,
              let width = bounds["Width"] as? NSNumber, let height = bounds["Height"] as? NSNumber else { return nil }
        let rect = CGRect(x: x.doubleValue, y: y.doubleValue,
                          width: width.doubleValue, height: height.doubleValue)
        return Snapshot(id: id, pid: pid,
                        frame: WindowPerchLogic.appKitFrame(quartz: rect,
                            desktopTop: IslandWindowController.desktopTop),
                        onScreen: info[kCGWindowIsOnscreen as String] as? Bool ?? false)
    }

    static func onScreenWindows() -> [Snapshot] {
        guard let windows = CGWindowListCopyWindowInfo(
            [.optionOnScreenOnly, .excludeDesktopElements], kCGNullWindowID) as? [[String: Any]] else { return [] }
        return windows.compactMap(snapshot)
    }

    static func window(_ id: CGWindowID) -> Snapshot? {
        guard let windows = CGWindowListCopyWindowInfo(.optionIncludingWindow, id) as? [[String: Any]],
              let info = windows.first else { return nil }
        return snapshot(info)
    }

    static func atTopEdge(_ point: CGPoint) -> Snapshot? {
        // The first visible normal window under the pointer wins; never choose a window
        // behind it just because its edge is close. The 34pt band allows a drop just above.
        for window in onScreenWindows() {
            let hitFrame = window.frame.insetBy(dx: 0, dy: -WindowPerchLogic.edgeTolerance)
            if hitFrame.contains(point) {
                return WindowPerchLogic.acceptsDrop(point, frame: window.frame) ? window : nil
            }
        }
        return nil
    }
}
