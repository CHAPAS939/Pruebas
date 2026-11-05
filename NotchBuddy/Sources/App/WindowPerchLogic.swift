import Foundation
#if canImport(CoreGraphics)
import CoreGraphics
#endif

/// Quartz window IDs are transient: never persist a perch across launches.
struct WindowPerchTarget {
    let windowID: UInt32
    let ownerPID: Int32
    var horizontalFraction: CGFloat
}

enum WindowPerchLogic {
    static let edgeTolerance: CGFloat = 34

    /// Quartz is y-down from the menu-bar display; AppKit is y-up from that same display.
    /// Do not flip relative to the display under the cursor (wrong on stacked monitors).
    static func appKitFrame(quartz: CGRect, desktopTop: CGFloat) -> CGRect {
        CGRect(x: quartz.minX, y: desktopTop - quartz.maxY, width: quartz.width, height: quartz.height)
    }

    static func acceptsDrop(_ point: CGPoint, frame: CGRect) -> Bool {
        frame.width >= 100 && frame.height >= 60 &&
        point.x >= frame.minX && point.x <= frame.maxX &&
        abs(point.y - frame.maxY) <= edgeTolerance
    }

    static func fraction(at point: CGPoint, frame: CGRect) -> CGFloat {
        guard frame.width > 0 else { return 0.5 }
        return min(0.88, max(0.12, (point.x - frame.minX) / frame.width))
    }

    /// Mochi's body rests on the title-bar edge and his feet hang below it.
    /// Hide if there is no room above an edge (fullscreen, menu bar, disconnected screen).
    static func origin(frame: CGRect, fraction: CGFloat, panelSize: CGFloat,
                       visibleFrames: [CGRect]) -> CGPoint? {
        guard frame.width >= 100, frame.height >= 60 else { return nil }
        let x = frame.minX + min(0.88, max(0.12, fraction)) * frame.width
        let contact = CGPoint(x: x, y: frame.maxY)
        guard let display = visibleFrames.first(where: { $0.contains(contact) }) else { return nil }
        let y = frame.maxY - panelSize * 0.24
        guard y + panelSize <= display.maxY + 1, display.width >= panelSize else { return nil }
        return CGPoint(x: min(max(x - panelSize / 2, display.minX), display.maxX - panelSize), y: y)
    }

    static func jumpPoint(from: CGPoint, to: CGPoint, progress: Double, arc: CGFloat) -> CGPoint {
        let t = CGFloat(min(1, max(0, progress))), u = t*t*(3-2*t)
        return CGPoint(x: from.x+(to.x-from.x)*u, y: from.y+(to.y-from.y)*u+4*max(0,arc)*t*(1-t))
    }

    static func lean(horizontalDelta: CGFloat, reduceMotion: Bool) -> Double {
        reduceMotion ? 0 : Double(min(0.12, max(-0.12, -horizontalDelta * 0.008)))
    }
}
