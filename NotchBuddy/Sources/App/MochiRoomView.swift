import SwiftUI
import AppKit
import Combine

/// A separate destination: the existing overview and permission cards keep their layout.
struct MochiRoomView: View {
    @ObservedObject var state: AppState
    @Environment(\.islandViewActive) private var active
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @AppStorage("mochiRoomLighting") private var lighting = MochiRoomLighting.automatic.rawValue
    @AppStorage("mochiRoomRain") private var rain = true
    @AppStorage("mochiRoomLamp") private var lamp = true
    @State private var screenPaused = false
    @StateObject private var engine = BotEngine()

    var body: some View {
        VStack(spacing: 6) {
            HStack(spacing: 8) {
                Text("room.title").font(.system(size: 12, weight: .semibold))
                Spacer()
                ForEach(MochiRoomLighting.allCases, id: \.rawValue) { value in
                    Button(action: { lighting = value.rawValue }) {
                        Image(systemName: icon(value))
                            .frame(width: 26, height: 22)
                            .background(lighting == value.rawValue ? Color.white.opacity(0.13) : .clear)
                            .clipShape(Capsule())
                    }
                    .buttonStyle(.plain)
                    .help(label(value))
                    .accessibilityLabel(label(value))
                    .accessibilityValue(lighting == value.rawValue ? String(localized: "room.selected") : "")
                }
                Toggle(isOn: $rain) { Image(systemName: "cloud.rain") }
                    .toggleStyle(.button).help(String(localized: "room.rain"))
                    .accessibilityLabel(String(localized: "room.rain"))
                Toggle(isOn: $lamp) { Image(systemName: "lamp.desk") }
                    .toggleStyle(.button).help(String(localized: "room.lamp"))
                    .accessibilityLabel(String(localized: "room.lamp"))
            }
            .foregroundStyle(Color.white.opacity(0.8))

            // The island keeps inactive destinations mounted. Do not create a clock there.
            if active && state.mode == .expanded && !screenPaused {
                TimelineView(.periodic(from: .now, by: reduceMotion ? 60 : 1.0 / 24.0)) { timeline in
                    let hour = Calendar.current.component(.hour, from: timeline.date)
                    let night = (MochiRoomLighting(rawValue: lighting) ?? .automatic).isNight(hour: hour)
                    Canvas { context, size in
                        let time = reduceMotion ? 0 : timeline.date.timeIntervalSinceReferenceDate
                        var c = context
                        c.scaleBy(x: size.width / 600, y: size.height / 176)
                        MochiRoomDrawing.draw(in: &c, night: night, rain: rain, lamp: lamp, time: time)
                        engine.setOutfit(state.resolvedOutfit, animated: !reduceMotion)
                        if !reduceMotion { MochiFrameClock.advance(engine) }
                        if !state.mochiOnDesktop {
                            var bot = c
                            bot.translateBy(x: 235, y: 54)
                            let botSize = CGSize(width: 104, height: 104)
                            engine.drawHandsBehind(context: bot, size: botSize)
                            engine.drawOutfitBehind(context: bot, size: botSize)
                            engine.draw(context: bot, size: botSize)
                            engine.drawOutfitFront(context: bot, size: botSize)
                            engine.drawHandsAndExtras(context: bot, size: botSize)
                        }
                        // Laptop is in front of Mochi, as on a real desk.
                        MochiRoomDrawing.laptop(in: &c, night: night)
                    }
                    .accessibilityLabel(String(localized: "room.scene"))
                }
                .clipShape(RoundedRectangle(cornerRadius: 14))
            } else {
                Color.clear
            }
        }
        .padding(.horizontal, 14)
        .padding(.bottom, 10)
        .onAppear { if active { engine.setState(state.effectiveState, force: true) } }
        .onChange(of: active) { _, visible in
            if visible { engine.setState(state.effectiveState, force: true) }
        }
        .onChange(of: state.effectiveState) { _, value in
            if active { engine.setState(value) }
        }
        .onReceive(NSWorkspace.shared.notificationCenter.publisher(for: NSWorkspace.screensDidSleepNotification)) { _ in
            screenPaused = true
        }
        .onReceive(NSWorkspace.shared.notificationCenter.publisher(for: NSWorkspace.screensDidWakeNotification)) { _ in
            screenPaused = false
        }
        .onReceive(DistributedNotificationCenter.default().publisher(for: Notification.Name("com.apple.screenIsLocked"))) { _ in
            screenPaused = true
        }
        .onReceive(DistributedNotificationCenter.default().publisher(for: Notification.Name("com.apple.screenIsUnlocked"))) { _ in
            screenPaused = false
        }
    }

    private func icon(_ value: MochiRoomLighting) -> String {
        switch value { case .automatic: "clock"; case .day: "sun.max"; case .night: "moon.stars" }
    }

    private func label(_ value: MochiRoomLighting) -> String {
        switch value {
        case .automatic: String(localized: "room.auto")
        case .day: String(localized: "room.day")
        case .night: String(localized: "room.night")
        }
    }
}

/// All furniture, weather and light are drawn in code, like Mochi himself.
enum MochiRoomDrawing {
    static func draw(in c: inout GraphicsContext, night: Bool, rain: Bool, lamp: Bool, time: Double) {
        let wall = Color(hex: night ? "#282333" : "#E8D9C7")
        let wood = Color(hex: night ? "#725143" : "#B78A66")
        c.fill(Path(CGRect(x: 0, y: 0, width: 600, height: 176)), with: .color(wall))
        c.fill(Path(CGRect(x: 0, y: 144, width: 600, height: 32)), with: .color(wood.opacity(0.7)))
        for x in stride(from: 0, to: 600, by: 60) {
            c.fill(Path(CGRect(x: CGFloat(x), y: 145, width: 1, height: 31)), with: .color(.black.opacity(0.08)))
        }

        // The outside world stays behind the glass.
        let window = CGRect(x: 394, y: 16, width: 164, height: 109)
        c.fill(Path(roundedRect: window.insetBy(dx: -6, dy: -6), cornerRadius: 12), with: .color(wood))
        var sky = c
        sky.clip(to: Path(roundedRect: window, cornerRadius: 7))
        sky.fill(Path(window), with: .linearGradient(
            Gradient(colors: [Color(hex: night ? "#17243B" : "#9DC8CE"), Color(hex: night ? "#5B526F" : "#ECD9B9")]),
            startPoint: window.origin, endPoint: CGPoint(x: 394, y: 125)))
        sky.fill(Path(ellipseIn: CGRect(x: 510, y: 28, width: 23, height: 23)), with: .color(Color(hex: night ? "#F3E6C8" : "#FFF2C5")))
        if night {
            for i in 0..<12 {
                let x = 404 + (i * 29) % 138, y = 23 + (i * 17) % 50
                sky.fill(Path(ellipseIn: CGRect(x: CGFloat(x), y: CGFloat(y), width: 1.7, height: 1.7)), with: .color(.white.opacity(0.6)))
            }
        }
        var hills = Path()
        hills.move(to: CGPoint(x: 394, y: 110))
        hills.addQuadCurve(to: CGPoint(x: 558, y: 102), control: CGPoint(x: 470, y: 53))
        hills.addLine(to: CGPoint(x: 558, y: 125)); hills.addLine(to: CGPoint(x: 394, y: 125))
        sky.fill(hills, with: .color(Color(hex: night ? "#263C44" : "#839D8B")))
        if rain {
            for i in 0..<32 {
                let x = Double(398 + (i * 23) % 158)
                let y = 16 + MochiRoomLogic.rainOffset(index: i, time: time, height: 109)
                var drop = Path(); drop.move(to: CGPoint(x: x, y: y))
                drop.addLine(to: CGPoint(x: x - 2, y: y + 9))
                sky.stroke(drop, with: .color(.white.opacity(0.25)), lineWidth: 0.8)
            }
        }
        c.fill(Path(CGRect(x: 473, y: 16, width: 4, height: 109)), with: .color(wood))
        c.fill(Path(roundedRect: CGRect(x: 385, y: 124, width: 183, height: 6), cornerRadius: 2), with: .color(wood))

        // Shelf, books and a tiny framed picture.
        c.fill(Path(roundedRect: CGRect(x: 43, y: 48, width: 131, height: 5), cornerRadius: 2), with: .color(wood))
        for (i, hex) in ["#829D8B", "#C58C77", "#CBB892", "#9B9AB5"].enumerated() {
            c.fill(Path(roundedRect: CGRect(x: CGFloat(51 + i * 15), y: CGFloat(22 + i % 2 * 5), width: 11, height: CGFloat(26 - i % 2 * 5)), cornerRadius: 1), with: .color(Color(hex: hex)))
        }
        c.fill(Path(roundedRect: CGRect(x: 126, y: 17, width: 31, height: 31), cornerRadius: 3), with: .color(wood))
        c.fill(Path(CGRect(x: 130, y: 21, width: 23, height: 23)), with: .color(Color(hex: "#D6C3A7")))
        c.fill(Path(ellipseIn: CGRect(x: 136, y: 27, width: 11, height: 11)), with: .color(Color(hex: "#C28E67")))

        // Desk and rug.
        c.fill(Path(ellipseIn: CGRect(x: 167, y: 149, width: 221, height: 22)), with: .color(Color(hex: "#B58E7C").opacity(0.55)))
        c.fill(Path(roundedRect: CGRect(x: 180, y: 127, width: 193, height: 8), cornerRadius: 3), with: .color(wood))
        for x in [191, 352] { c.fill(Path(CGRect(x: CGFloat(x), y: 135, width: 6, height: 31)), with: .color(wood)) }
        // Lamp's glow is static light, not a costly blur over the whole island.
        if lamp {
            c.fill(Path(ellipseIn: CGRect(x: 164, y: 58, width: 131, height: 92)), with: .radialGradient(
                Gradient(colors: [Color(hex: "#FFC76C").opacity(0.28), .clear]),
                center: CGPoint(x: 219, y: 97), startRadius: 0, endRadius: 70))
        }
        var stem = Path(); stem.move(to: CGPoint(x: 209, y: 126)); stem.addLine(to: CGPoint(x: 209, y: 84)); stem.addLine(to: CGPoint(x: 227, y: 71))
        c.stroke(stem, with: .color(Color(hex: "#B5AE98")), style: StrokeStyle(lineWidth: 3, lineCap: .round))
        c.fill(Path(roundedRect: CGRect(x: 215, y: 68, width: 30, height: 13), cornerRadius: 6), with: .color(Color(hex: lamp ? "#F1C980" : "#8B8377")))
        c.fill(Path(ellipseIn: CGRect(x: 198, y: 123, width: 24, height: 4)), with: .color(Color(hex: "#B5AE98")))
        // Plant.
        c.fill(Path(roundedRect: CGRect(x: 92, y: 123, width: 29, height: 29), cornerRadius: 5), with: .color(Color(hex: "#BC8870")))
        for i in 0..<5 {
            var leaf = c
            leaf.translateBy(x: 107, y: 126); leaf.rotate(by: .degrees(Double(i - 2) * 25))
            leaf.fill(Path(ellipseIn: CGRect(x: -5, y: -36, width: 10, height: 37)), with: .color(Color(hex: i % 2 == 0 ? "#77917C" : "#9BA786")))
        }
        // Cup and steam.
        c.stroke(Path(ellipseIn: CGRect(x: 342, y: 116, width: 10, height: 8)), with: .color(Color(hex: "#D7BBA0")), lineWidth: 2)
        c.fill(Path(roundedRect: CGRect(x: 331, y: 113, width: 14, height: 14), cornerRadius: 3), with: .color(Color(hex: "#D7BBA0")))
        for i in 0..<2 {
            var steam = Path(); let x = 335 + Double(i * 5)
            steam.move(to: CGPoint(x: x, y: 109))
            steam.addQuadCurve(to: CGPoint(x: x + sin(time * 1.3 + Double(i)) * 3, y: 97), control: CGPoint(x: x - 4, y: 103))
            c.stroke(steam, with: .color(.white.opacity(0.22)), lineWidth: 1)
        }
    }

    static func laptop(in c: inout GraphicsContext, night: Bool) {
        c.fill(Path(roundedRect: CGRect(x: 270, y: 108, width: 49, height: 21), cornerRadius: 3), with: .color(Color(hex: night ? "#737487" : "#9B9AA0")))
        c.fill(Path(ellipseIn: CGRect(x: 291, y: 115, width: 6, height: 6)), with: .color(.white.opacity(0.5)))
        c.fill(Path(roundedRect: CGRect(x: 265, y: 127, width: 59, height: 3), cornerRadius: 1), with: .color(Color(hex: "#B8B3B8")))
    }
}
