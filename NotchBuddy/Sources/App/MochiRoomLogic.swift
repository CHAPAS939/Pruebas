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
