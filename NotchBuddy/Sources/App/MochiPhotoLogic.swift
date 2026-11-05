import Foundation

/// A local photo is accepted only as a bounded PNG. The native dialog chooses its path.
enum MochiPhotoLogic {
    static func decode(_ image: String) -> Data? {
        let prefix = "data:image/png;base64,"
        guard image.utf8.count <= 10_000_000, image.hasPrefix(prefix),
              let data = Data(base64Encoded: String(image.dropFirst(prefix.count))), data.count >= 33 else { return nil }
        let header = Array(data.prefix(24))
        guard Array(header.prefix(8)) == [137,80,78,71,13,10,26,10], Array(header[12..<16]) == [73,72,68,82] else { return nil }
        let width = header[16..<20].reduce(UInt32(0)) { ($0 << 8) | UInt32($1) }
        let height = header[20..<24].reduce(UInt32(0)) { ($0 << 8) | UInt32($1) }
        guard (1...4096).contains(width), (1...4096).contains(height) else { return nil }
        return data
    }
}
