import SwiftUI

enum MochiSkin: String, CaseIterable {
    case classic, diamond, opal, obsidian, gold, galaxy, jelly, lava
    var dark: Bool { [MochiSkin.diamond, .obsidian, .galaxy, .lava].contains(self) }
    var title: String {
        switch self {
        case .classic: String(localized: "Classic")
        case .diamond: String(localized: "Diamonds")
        case .opal: String(localized: "Opal")
        case .obsidian: String(localized: "Obsidian")
        case .gold: String(localized: "Gold")
        case .galaxy: String(localized: "Galaxy")
        case .jelly: String(localized: "Jelly")
        case .lava: String(localized: "Lava")
        }
    }
    var colors: [String] {
        switch self {
        case .classic: ["#EDEDEF", "#C4C5CA"]
        case .diamond: ["#343342", "#10131C"]
        case .opal: ["#FFF1F5", "#B7C9E7"]
        case .obsidian: ["#66617F", "#151B31"]
        case .gold: ["#FFF1B0", "#A67125"]
        case .galaxy: ["#55447E", "#171E43"]
        case .jelly: ["#FFE0ED", "#DB81B0"]
        case .lava: ["#493148", "#172031"]
        }
    }
    static func accessoryHue(_ value: String) -> Double {
        guard value.count == 7, value.first == "#", let hex = UInt32(value.dropFirst(), radix: 16) else { return 0 }
        let r = Double((hex >> 16) & 255) / 255, g = Double((hex >> 8) & 255) / 255, b = Double(hex & 255) / 255
        let hi = max(r, g, b), lo = min(r, g, b), d = hi - lo
        guard d > 0.01 else { return 0 }
        let h = hi == r ? (g - b) / d : hi == g ? (b - r) / d + 2 : (r - g) / d + 4
        return (h * 60 + 360).truncatingRemainder(dividingBy: 360) - 345
    }
    func draw(context: inout GraphicsContext, path: Path, rx: CGFloat, ry: CGFloat) {
        var c = context; c.clip(to: path)
        c.fill(path, with: .linearGradient(Gradient(colors: colors.map { Color(hex: $0) }), startPoint: CGPoint(x: rx, y: -ry), endPoint: CGPoint(x: -rx, y: ry)))
        if self == .diamond {
            for row in -3...3 { for col in -4...4 {
                let x = CGFloat(col)*rx*0.22 + CGFloat(row%2)*rx*0.07, y = CGFloat(row)*ry*0.25
                if abs(abs(x/rx)-0.37)<0.16 && abs(y/ry-0.12)<0.24 { continue }
                let w = rx*0.047, h = ry*0.067
                var left = Path();left.move(to:CGPoint(x:x,y:y-h));left.addLine(to:CGPoint(x:x,y:y+h));left.addLine(to:CGPoint(x:x-w,y:y));left.closeSubpath()
                c.fill(left,with:.color(Color(hex:"#F3FCFF")))
                var right = Path();right.move(to:CGPoint(x:x,y:y-h));right.addLine(to:CGPoint(x:x+w,y:y));right.addLine(to:CGPoint(x:x,y:y+h));right.closeSubpath()
                c.fill(right,with:.color(Color(hex:"#C2E9FF")))
                var top = Path();top.move(to:CGPoint(x:x,y:y-h));top.addLine(to:CGPoint(x:x+w,y:y));top.addLine(to:CGPoint(x:x-w,y:y));top.closeSubpath()
                c.fill(top,with:.color(.white))
                if (row+col)%4 == 0 {
                    var gleam = Path();gleam.move(to:CGPoint(x:x-w*1.5,y:y));gleam.addLine(to:CGPoint(x:x+w*1.5,y:y));gleam.move(to:CGPoint(x:x,y:y-h*1.5));gleam.addLine(to:CGPoint(x:x,y:y+h*1.5))
                    c.stroke(gleam,with:.color(.white),lineWidth:max(0.6,rx*0.015))
                }
            }}
        } else if self == .obsidian {
            let tones = self == .diamond ? ["#EAFFFF", "#A4CBDC", "#D1DFF5", "#98C9D4", "#EEF2FF"] : ["#3C3D59", "#71718B", "#222C48", "#545571", "#2D3755"]
            for row in -2..<3 { for col in -2..<3 {
                let x = CGFloat(col) * rx * 0.55, y = CGFloat(row) * ry * 0.65, w = rx * 0.6, h = ry * 0.7
                var triangle = Path(); triangle.move(to: CGPoint(x: x, y: y)); triangle.addLine(to: CGPoint(x: x+w, y: y+h*0.2)); triangle.addLine(to: CGPoint(x: x+w*0.25, y: y+h)); triangle.closeSubpath()
                c.fill(triangle, with: .color(Color(hex: tones[((row+2)*7+col+2)%tones.count])))
                var other = Path(); other.move(to: CGPoint(x: x+w, y: y+h*0.2)); other.addLine(to: CGPoint(x: x+w*1.1, y: y+h)); other.addLine(to: CGPoint(x: x+w*0.25, y: y+h)); other.closeSubpath()
                c.fill(other, with: .color(Color(hex: tones[((row+2)*3+col+3)%tones.count])))
            }}
        } else if self == .galaxy {
            for i in 0..<26 {
                let x = (CGFloat((i*37)%101)/50-1)*rx, y = (CGFloat((i*53)%103)/51-1)*ry, r = rx * (i%7 == 0 ? 0.025 : 0.012)
                c.fill(Path(ellipseIn: CGRect(x: x-r, y: y-r, width: r*2, height: r*2)), with: .color(Color(hex: i%3 == 0 ? "#8ED7FB" : "#FFF3F5")))
            }
        } else if self == .lava {
            for i in 0..<8 {
                let x = CGFloat(i)/4
                var vein = Path(); vein.move(to: CGPoint(x: (x-1)*rx, y: -ry)); vein.addLine(to: CGPoint(x: (x-0.9)*rx, y: -ry*0.3)); vein.addLine(to: CGPoint(x: (x-1.15)*rx, y: ry*0.3)); vein.addLine(to: CGPoint(x: (x-0.85)*rx, y: ry))
                c.stroke(vein, with: .color(Color(hex: i%2 == 0 ? "#ED6D56" : "#FFA760")), lineWidth: rx*0.035)
            }
        } else if self == .opal {
            for (i, color) in ["#A5E6DF", "#EDB5DB", "#B7B6EF", "#FFDEA5"].enumerated() {
                var shimmer = c; shimmer.opacity = 0.3; shimmer.rotate(by: .radians(-0.65))
                shimmer.fill(Path(ellipseIn: CGRect(x: (CGFloat(i)-2)*rx*0.5, y: -ry*1.4, width: rx*0.9, height: ry*2.8)), with: .color(Color(hex: color)))
            }
        } else if self == .jelly {
            for i in 0..<5 {
                let x = (CGFloat((i*37)%97)/50-1)*rx, y = (CGFloat((i*19)%71)/45-0.7)*ry, r = rx * (0.035+CGFloat(i)*0.008)
                c.stroke(Path(ellipseIn: CGRect(x: x-r, y: y-r, width: r*2, height: r*2)), with: .color(.white.opacity(0.45)), lineWidth: rx*0.025)
            }
        }
        c.fill(path, with: .linearGradient(Gradient(stops: [.init(color: .clear, location: 0.3), .init(color: .white.opacity(self == .diamond ? 0.03 : 0.55), location: 0.4), .init(color: .clear, location: 0.48)]), startPoint: CGPoint(x: -rx, y: -ry), endPoint: CGPoint(x: rx, y: ry)))
    }
}
