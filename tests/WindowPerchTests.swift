import Foundation

@main enum WindowPerchTests {
    static func main() {
        let display = CGRect(x: 0, y: 0, width: 1440, height: 875)
        let window = CGRect(x: 200, y: 100, width: 700, height: 500)
        precondition(WindowPerchLogic.acceptsDrop(CGPoint(x: 500, y: 602), frame: window))
        precondition(!WindowPerchLogic.acceptsDrop(CGPoint(x: 500, y: 300), frame: window))
        precondition(!WindowPerchLogic.acceptsDrop(CGPoint(x: 950, y: 602), frame: window))
        let initial = WindowPerchLogic.origin(frame: window, fraction: 0.5, panelSize: 120, visibleFrames: [display])!
        let moved = WindowPerchLogic.origin(frame: window.offsetBy(dx: 80, dy: -20), fraction: 0.5, panelSize: 120, visibleFrames: [display])!
        precondition(abs(moved.x - initial.x - 80) < 0.001 && abs(moved.y - initial.y + 20) < 0.001)
        let secondary = CGRect(x: -1280, y: -300, width: 1280, height: 1000)
        let remote = CGRect(x: -1200, y: -200, width: 800, height: 500)
        precondition(WindowPerchLogic.origin(frame: remote, fraction: 0.6, panelSize: 120, visibleFrames: [display, secondary]) != nil)
        precondition(WindowPerchLogic.origin(frame: remote, fraction: 0.6, panelSize: 120, visibleFrames: [display]) == nil)
        precondition(WindowPerchLogic.origin(frame: display, fraction: 0.5, panelSize: 120, visibleFrames: [display]) == nil)
        let flipped = WindowPerchLogic.appKitFrame(quartz: CGRect(x: -500, y: 100, width: 400, height: 300), desktopTop: 900)
        precondition(flipped.origin == CGPoint(x: -500, y: 500))
        precondition(WindowPerchLogic.fraction(at: CGPoint(x: 200, y: 600), frame: window) == 0.12)
        precondition(WindowPerchLogic.lean(horizontalDelta: 300, reduceMotion: false) == -0.12)
        precondition(WindowPerchLogic.lean(horizontalDelta: 300, reduceMotion: true) == 0)
        print("WindowPerch: edge drops, movement, displays, coordinate conversion and reduced motion passed")
    }
}
