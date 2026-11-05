import Foundation
@main enum MochiPhotoTests {
    static func main() {
        func image(_ width: UInt32, _ height: UInt32) -> String {
            var bytes: [UInt8] = [137,80,78,71,13,10,26,10,0,0,0,13,73,72,68,82]
            for number in [width,height] { bytes += [UInt8((number>>24)&255),UInt8((number>>16)&255),UInt8((number>>8)&255),UInt8(number&255)] }
            bytes += [UInt8](repeating:0,count:9)
            return "data:image/png;base64,"+Data(bytes).base64EncodedString()
        }
        precondition(MochiPhotoLogic.decode(image(1600,1600)) != nil)
        for bad in [image(0,1600),image(1600,5000),"data:text/html;base64,PGgxPg==","data:image/png;base64,invalid",String(repeating:"x",count:10_000_001)] { precondition(MochiPhotoLogic.decode(bad) == nil) }
        if CommandLine.arguments.count > 1 { let data=try! Data(contentsOf:URL(fileURLWithPath:CommandLine.arguments[1]));precondition(MochiPhotoLogic.decode("data:image/png;base64,"+data.base64EncodedString()) != nil) }
        print("PASS: PNG export validation, dimensions, malformed data and size limits")
    }
}
