import Foundation

/// Local, deterministic preferences. No agent, network or location dependency.
enum MochiRoomLighting: String, CaseIterable {
    case automatic, day, night

    func isNight(hour: Int) -> Bool {
        switch self {
        case .automatic: return hour < 7 || hour >= 19
        case .day: return false
        case .night: return true
        }
    }
}

enum MochiRoomLogic {
    static func rainOffset(index: Int, time: Double, height: Double) -> Double {
        guard height > 0 else { return 0 }
        return (Double(index * 37) + time * 95).truncatingRemainder(dividingBy: height)
    }
}

/// Stable preference values shared with the Windows scene contract.
enum MochiRoomTheme: String, CaseIterable {
    case sand, sage, rose, midnight
    var wall: String {
        switch self { case .sand: "#E8D9C7"; case .sage: "#d2dcc8"; case .rose: "#ead5d2"; case .midnight: "#737e91" }
    }
    var swatch: String {
        switch self { case .sand: "#d7bf9f"; case .sage: "#a9bb99"; case .rose: "#d2aaa9"; case .midnight: "#65748b" }
    }
}

struct MochiRoomDecoration: Equatable {
    var style = "cozy"
    var plantKind = "auto"
    var rugKind = "auto"
    var wallDecor = "auto"
    var deskFinish = "auto"
    var plantPosition = "left"
}
