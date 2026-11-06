import Foundation

@main enum MochiRoomTests {
    static func main() {
        for hour in 0..<24 {
            precondition(MochiRoomLighting.automatic.isNight(hour: hour) == (hour < 7 || hour >= 19))
            precondition(!MochiRoomLighting.day.isNight(hour: hour))
            precondition(MochiRoomLighting.night.isNight(hour: hour))
        }
        precondition(MochiRoomLighting(rawValue: "obsolete") == nil)
        for i in 0..<32 {
            let y = MochiRoomLogic.rainOffset(index: i, time: 100_000, height: 109)
            precondition(y >= 0 && y < 109)
        }
        precondition(MochiRoomLogic.rainOffset(index: 1, time: 0, height: 0) == 0)
        print("MochiRoom: lighting boundaries, overrides and rain bounds passed")
    }
}
