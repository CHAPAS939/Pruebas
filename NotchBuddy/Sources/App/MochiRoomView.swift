import SwiftUI
import AppKit
import Combine

struct MochiRoomView: View {
    @ObservedObject var state: AppState
    @Environment(\.islandViewActive) private var active
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @AppStorage("mochiRoomLighting") private var lighting = MochiRoomLighting.automatic.rawValue
    @AppStorage("mochiRoomRain") private var rain = true
    @AppStorage("mochiRoomLamp") private var lamp = true
    @AppStorage("mochiRoomTheme") private var theme = "sand"
    @AppStorage("mochiRoomPlant") private var plant = true
    @AppStorage("mochiRoomRug") private var rug = true
    @AppStorage("mochiRoomStyle") private var style = "cozy"
    @AppStorage("mochiRoomPlantKind") private var plantKind = "auto"
    @AppStorage("mochiRoomRugKind") private var rugKind = "auto"
    @AppStorage("mochiRoomWallDecor") private var wallDecor = "auto"
    @AppStorage("mochiRoomDeskFinish") private var deskFinish = "auto"
    @AppStorage("mochiRoomPlantPosition") private var plantPosition = "left"
    @AppStorage("mochiOutfitGlasses") private var glasses = "none"
    @AppStorage("mochiOutfitScarf") private var scarf = false
    @State private var activity = "desk"
    @State private var screenPaused = false
    @State private var wardrobe = false
    @State private var hovered: Outfit? = nil
    @StateObject private var engine = BotEngine()

    var body: some View {
        VStack(spacing: 6) {
            HStack(spacing: 8) {
                Text("room.title").font(.system(size: 12, weight: .semibold))
                Spacer()
                ForEach(MochiRoomLighting.allCases, id: \.rawValue) { value in
                    Button(action: { lighting = value.rawValue }) {
                        Image(systemName: icon(value)).frame(width: 26, height: 22)
                            .background(lighting == value.rawValue ? Color.white.opacity(0.13) : .clear).clipShape(Capsule())
                    }.buttonStyle(.plain).help(label(value)).accessibilityLabel(label(value))
                    .accessibilityValue(lighting == value.rawValue ? String(localized: "room.selected") : "")
                }
                Toggle(isOn: $rain) { Image(systemName: "cloud.rain") }.toggleStyle(.button)
                    .help(String(localized: "room.rain")).accessibilityLabel(String(localized: "room.rain"))
                Toggle(isOn: $lamp) { Image(systemName: "lamp.desk") }.toggleStyle(.button)
                    .help(String(localized: "room.lamp")).accessibilityLabel(String(localized: "room.lamp"))
            }.foregroundStyle(Color.white.opacity(0.8))
            HStack(spacing: 8) {
                if active && state.mode == .expanded && !screenPaused {
                    TimelineView(.periodic(from: .now, by: 60)) { timeline in
                        let hour = Calendar.current.component(.hour, from: timeline.date)
                        MochiRoomStage(state: state, engine: engine,
                            night: (MochiRoomLighting(rawValue: lighting) ?? .automatic).isNight(hour: hour),
                            rain: rain, lamp: lamp, reduceMotion: reduceMotion,
                            theme: MochiRoomTheme(rawValue: theme) ?? .sand, plant: plant, rug: rug,
                            outfit: state.resolvedOutfit, showCharacter: wardrobe || !state.mochiOnDesktop,
                            decoration: MochiRoomDecoration(style: style, plantKind: plantKind, rugKind: rugKind, wallDecor: wallDecor, deskFinish: deskFinish, plantPosition: plantPosition),
                            activity: activity, glasses: glasses, scarf: scarf, onInteract: interact)
                            .accessibilityLabel(String(localized: "room.scene"))
                    }.clipShape(RoundedRectangle(cornerRadius: 14))
                } else { Color.clear }
                editor.frame(width: 170)
            }.frame(maxWidth: .infinity, maxHeight: .infinity)
        }
        .padding(.horizontal, 14).padding(.bottom, 10)
        .onAppear { if active { engine.setState(state.effectiveState, force: true) } }
        .onChange(of: active) { _, visible in
            if visible { engine.setState(state.effectiveState, force: true) }
            else { clearPreview(); activity = "desk" }
        }
        .onChange(of: wardrobe) { _, _ in clearPreview() }
        .onDisappear { clearPreview() }
        .onChange(of: state.effectiveState) { _, value in if active { engine.setState(value) } }
        .onReceive(NSWorkspace.shared.notificationCenter.publisher(for: NSWorkspace.screensDidSleepNotification)) { _ in screenPaused = true }
        .onReceive(NSWorkspace.shared.notificationCenter.publisher(for: NSWorkspace.screensDidWakeNotification)) { _ in screenPaused = false }
        .onReceive(DistributedNotificationCenter.default().publisher(for: Notification.Name("com.apple.screenIsLocked"))) { _ in screenPaused = true }
        .onReceive(DistributedNotificationCenter.default().publisher(for: Notification.Name("com.apple.screenIsUnlocked"))) { _ in screenPaused = false }
    }

    private var editor: some View {
        VStack(spacing: 8) {
            Picker("", selection: $wardrobe) {
                Text("Decorate").tag(false)
                Text("Wardrobe").tag(true)
            }.pickerStyle(.segmented).labelsHidden()
            ScrollView(.vertical, showsIndicators: false) {
                if wardrobe {
                    VStack(alignment: .leading, spacing: 5) {
                        Text((hovered ?? state.mochiOutfitSelection).displayName)
                            .font(.system(size: 10)).foregroundStyle(.secondary).lineLimit(1)
                        MochiOutfitCombinationControls()
                        LazyVGrid(columns: Array(repeating: GridItem(.fixed(30), spacing: 5), count: 4), spacing: 5) {
                            ForEach(Outfit.allCases, id: \.rawValue) { outfit in
                                Button {
                                    state.mochiOutfitSelection = outfit
                                    SoundEngine.shared.play("pop")
                                } label: {
                                    Canvas { context, size in
                                        drawOutfitIcon(context: context, size: size, outfit: outfit,
                                            seasonal: Outfit.seasonal(for: Date(), calendar: .current))
                                    }.frame(width: 30, height: 30)
                                    .background(Color.white.opacity(state.mochiOutfitSelection == outfit ? 0.17 : 0.05))
                                    .clipShape(RoundedRectangle(cornerRadius: 7))
                                    .overlay(RoundedRectangle(cornerRadius: 7).stroke(Color.white.opacity(state.mochiOutfitSelection == outfit ? 0.4 : 0.08)))
                                }.buttonStyle(.plain).help(outfit.displayName).accessibilityLabel(outfit.displayName)
                                .accessibilityValue(state.mochiOutfitSelection == outfit ? String(localized: "room.selected") : "")
                                .onHover { on in
                                    hovered = on ? outfit : nil
                                    state.wardrobePreviewOutfit = on ? Outfit.resolved(selection: outfit, date: Date(), calendar: .current) : nil
                                }
                            }
                        }
                    }
                } else {
                    VStack(alignment: .leading, spacing: 8) {
                        MochiRoomStyleControls()
                        Text("Color palette").font(.system(size: 10)).foregroundStyle(.secondary)
                        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 5) {
                            ForEach(MochiRoomTheme.allCases, id: \.rawValue) { value in
                                Button { theme = value.rawValue } label: {
                                    HStack(spacing: 5) {
                                        Circle().fill(Color(hex: value.swatch)).frame(width: 13, height: 13)
                                        Text(value.title).font(.system(size: 10)).lineLimit(1)
                                    }.frame(maxWidth: .infinity, alignment: .leading).padding(6)
                                    .background(Color.white.opacity(theme == value.rawValue ? 0.14 : 0.04))
                                    .clipShape(RoundedRectangle(cornerRadius: 8))
                                }.buttonStyle(.plain).accessibilityLabel(value.title)
                                .accessibilityValue(theme == value.rawValue ? String(localized: "room.selected") : "")
                            }
                        }
                        HStack(spacing: 5) {
                            Toggle("Plant", isOn: $plant)
                            Toggle("Rug", isOn: $rug)
                        }.toggleStyle(.button).font(.system(size: 10))
                    }
                }
            }
        }.frame(maxHeight: .infinity, alignment: .top)
    }
    private func interact(_ id: String) {
        switch id { case "lamp": lamp.toggle(); case "window": rain.toggle(); case "rest": activity = "rest"; case "plant": if plant { activity = "plant" }; default: activity = "desk" }
    }
    private func clearPreview() { hovered = nil; state.wardrobePreviewOutfit = nil }
    private func icon(_ value: MochiRoomLighting) -> String {
        switch value { case .automatic: "clock"; case .day: "sun.max"; case .night: "moon.stars" }
    }
    private func label(_ value: MochiRoomLighting) -> String {
        switch value { case .automatic: String(localized: "room.auto"); case .day: String(localized: "room.day"); case .night: String(localized: "room.night") }
    }
}

private struct MochiRoomStage: View {
    @ObservedObject var state: AppState
    let engine: BotEngine
    let night: Bool
    let rain: Bool
    let lamp: Bool
    let reduceMotion: Bool
    let theme: MochiRoomTheme
    let plant: Bool
    let rug: Bool
    let outfit: Outfit
    let showCharacter: Bool
    let decoration: MochiRoomDecoration
    let activity: String
    let glasses: String
    let scarf: Bool
    let onInteract: (String) -> Void
    @State private var targets: [String: CGPoint] = [:]
    @State private var hovered: String? = nil
    @State private var sceneReady = false
    var body: some View {
        ZStack {
            if !sceneReady { fallback }
            MochiSceneWebView(kind: .home,
                settings: MochiSceneSettings(state: state.effectiveState.rawValue,
                    paused: false, reduceMotion: reduceMotion, night: night, rain: rain, lamp: lamp,
                    character: showCharacter, outfit: outfit.rawValue, theme: theme.rawValue, plant: plant, rug: rug,
                    roomStyle: decoration.style, plantKind: decoration.plantKind, rugKind: decoration.rugKind,
                    wallDecor: decoration.wallDecor, deskFinish: decoration.deskFinish, plantPosition: decoration.plantPosition,
                    activity: activity, glasses: glasses, scarf: scarf),
                onReady: { sceneReady = $0 }, onTargets: { targets = $0 })
                .opacity(sceneReady ? 1 : 0)
            VStack { Spacer(); HStack { Text("Tap the objects").font(.system(size: 9)).foregroundStyle(Color(hex: "#56614F")).padding(5).background(Color.white.opacity(0.88)).clipShape(Capsule()); Spacer() } }.padding(8).allowsHitTesting(false)
            GeometryReader { geometry in
                let points = sceneReady ? targets : fallbackTargets
                ForEach(["lamp", "window", "desk", "rest", "plant"], id: \.self) { id in
                    if let p = points[id], id != "plant" || plant {
                        Button { onInteract(id) } label: {
                            Image(systemName: "plus").font(.system(size: 11, weight: .semibold))
                                .foregroundStyle(Color(hex: "#54634B"))
                                .frame(width: 28, height: 28).background(Color.white.opacity(0.9)).clipShape(Circle())
                                .opacity(hovered == id ? 1 : 0.01)
                        }.buttonStyle(.plain).help(interactionTitle(id)).accessibilityLabel(interactionTitle(id))
                        .onHover { hovered = $0 ? id : nil }
                        .position(x: p.x * geometry.size.width, y: p.y * geometry.size.height)
                    }
                }
            }
        }.frame(maxWidth: .infinity, maxHeight: .infinity)
    }
    private var fallbackTargets: [String: CGPoint] {
        ["lamp": CGPoint(x: 230.0/600, y: 100.0/176), "window": CGPoint(x: 480.0/600, y: 65.0/176),
         "desk": CGPoint(x: 300.0/600, y: 125.0/176), "rest": CGPoint(x: 530.0/600, y: 155.0/176), "plant": CGPoint(x: 107.0/600, y: 125.0/176)]
    }
    private func interactionTitle(_ id: String) -> String {
        switch id {
        case "lamp": String(localized: "room.lamp")
        case "window": String(localized: "room.rain")
        case "rest": String(localized: "Rest on the cushion")
        case "plant": String(localized: "Water the plant")
        default: String(localized: "Work at the desk")
        }
    }
    private var fallback: some View {
        TimelineView(.periodic(from: .now, by: reduceMotion ? 60 : 1.0 / 24.0)) { timeline in
            Canvas { context, size in
                let time = reduceMotion ? 0 : timeline.date.timeIntervalSinceReferenceDate
                var c = context
                c.scaleBy(x: size.width / 600, y: size.height / 176)
                MochiRoomDrawing.draw(in: &c, night: night, rain: rain, lamp: lamp, time: time, theme: theme, plant: plant, rug: rug)
                engine.setOutfit(outfit, animated: !reduceMotion)
                if !reduceMotion { MochiFrameClock.advance(engine) }
                if showCharacter {
                    var bot = c; bot.translateBy(x: activity == "rest" ? 460 : activity == "plant" ? 115 : 235, y: activity == "desk" ? 54 : 82)
                    let botSize = CGSize(width: 104, height: 104)
                    engine.drawHandsBehind(context: bot, size: botSize)
                    engine.drawOutfitBehind(context: bot, size: botSize)
                    engine.draw(context: bot, size: botSize)
                    engine.drawOutfitFront(context: bot, size: botSize)
                    engine.drawHandsAndExtras(context: bot, size: botSize)
                }
                MochiRoomDrawing.laptop(in: &c, night: night)
            }
        }
    }
}

/// All furniture, weather and light are drawn in code, like Mochi himself.
enum MochiRoomDrawing {
    static func draw(in c: inout GraphicsContext, night: Bool, rain: Bool, lamp: Bool, time: Double, theme: MochiRoomTheme = .sand, plant: Bool = true, rug: Bool = true) {
        let wall = Color(hex: night ? "#282333" : theme.wall)
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
        if rug {
        c.fill(Path(ellipseIn: CGRect(x: 167, y: 149, width: 221, height: 22)), with: .color(Color(hex: "#B58E7C").opacity(0.55)))
        }
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
        if plant {
        c.fill(Path(roundedRect: CGRect(x: 92, y: 123, width: 29, height: 29), cornerRadius: 5), with: .color(Color(hex: "#BC8870")))
        for i in 0..<5 {
            var leaf = c
            leaf.translateBy(x: 107, y: 126); leaf.rotate(by: .degrees(Double(i - 2) * 25))
            leaf.fill(Path(ellipseIn: CGRect(x: -5, y: -36, width: 10, height: 37)), with: .color(Color(hex: i % 2 == 0 ? "#77917C" : "#9BA786")))
        }
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

private extension MochiRoomTheme {
    var title: String {
        switch self {
        case .sand: String(localized: "Sand")
        case .sage: String(localized: "Sage")
        case .rose: String(localized: "Rose")
        case .midnight: String(localized: "Midnight")
        }
    }
}

private struct MochiRoomStyleControls: View {
    @AppStorage("mochiRoomStyle") private var style = "cozy"
    @AppStorage("mochiRoomPlantKind") private var plantKind = "auto"
    @AppStorage("mochiRoomRugKind") private var rugKind = "auto"
    @AppStorage("mochiRoomWallDecor") private var wallDecor = "auto"
    @AppStorage("mochiRoomDeskFinish") private var deskFinish = "auto"
    @AppStorage("mochiRoomPlantPosition") private var plantPosition = "left"
    @AppStorage("mochiRoomPlant") private var plant = true
    @AppStorage("mochiRoomRug") private var rug = true
    private var styles: [(String, String)] {
        [("cozy", String(localized: "Cozy")), ("gamer", String(localized: "Gamer")),
         ("minimalist", String(localized: "Minimalist")), ("mediterranean", String(localized: "Mediterranean"))]
    }
    var body: some View {
        VStack(alignment: .leading, spacing: 7) {
            Text("Room style").foregroundStyle(.secondary)
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 5) {
                ForEach(styles, id: \.0) { item in
                    Button { style = item.0 } label: {
                        Text(item.1).lineLimit(2).frame(maxWidth: .infinity, minHeight: 28, alignment: .leading).padding(5)
                            .background(Color.white.opacity(style == item.0 ? 0.16 : 0.05)).clipShape(RoundedRectangle(cornerRadius: 8))
                    }.buttonStyle(.plain).accessibilityValue(style == item.0 ? String(localized: "room.selected") : "")
                }
            }
            choice(String(localized: "Plant type"), selection: $plantKind, options: [
                ("auto", String(localized: "Automatic")), ("leafy", String(localized: "Leafy plant")), ("cactus", String(localized: "Cactus")), ("olive", String(localized: "Olive tree"))])
            choice(String(localized: "Rug pattern"), selection: $rugKind, options: [
                ("auto", String(localized: "Automatic")), ("woven", String(localized: "Woven")), ("geometric", String(localized: "Geometric")), ("checker", String(localized: "Checkerboard"))])
            choice(String(localized: "Wall decoration"), selection: $wallDecor, options: [
                ("auto", String(localized: "Automatic")), ("botanical", String(localized: "Botanical")), ("prints", String(localized: "Art prints")), ("neon", String(localized: "Neon")), ("none", String(localized: "None"))])
            choice(String(localized: "Desk finish"), selection: $deskFinish, options: [
                ("auto", String(localized: "Automatic")), ("wood", String(localized: "Wood")), ("white", String(localized: "White")), ("dark", String(localized: "Dark"))])
            choice(String(localized: "Plant position"), selection: $plantPosition, options: [
                ("left", String(localized: "Left")), ("right", String(localized: "Right")), ("back", String(localized: "Back"))])
            Button("Reset decoration") {
                plantKind = "auto"; rugKind = "auto"; wallDecor = "auto"; deskFinish = "auto"; plantPosition = "left"; plant = true; rug = true
            }.buttonStyle(.plain).foregroundStyle(.secondary).padding(.vertical, 5)
        }.font(.system(size: 10))
    }
    private func choice(_ title: String, selection: Binding<String>, options: [(String, String)]) -> some View {
        Button {
            let index = options.firstIndex { $0.0 == selection.wrappedValue } ?? 0
            selection.wrappedValue = options[(index + 1) % options.count].0
        } label: {
            HStack { Text(title); Spacer(minLength: 4); Text(options.first { $0.0 == selection.wrappedValue }?.1 ?? options[0].1).foregroundStyle(.secondary) }
                .padding(6).background(Color.white.opacity(0.04)).clipShape(RoundedRectangle(cornerRadius: 7))
        }.buttonStyle(.plain).accessibilityLabel(title)
    }
}
