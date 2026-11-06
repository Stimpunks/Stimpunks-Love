// Lift the subject out of one picture with Apple's Vision framework, on this
// Mac, and write it as a PNG with everything else transparent. Used by
// tools/cut-ems-nails.py, which compiles it with swiftc. Nothing is sent
// anywhere: VNGenerateForegroundInstanceMaskRequest runs on the machine.
//
// usage: lift-subject in.png out.png
import Foundation
import Vision
import CoreImage

let args = CommandLine.arguments
guard args.count == 3 else { fputs("usage: lift-subject in.png out.png\n", stderr); exit(2) }
guard let image = CIImage(contentsOf: URL(fileURLWithPath: args[1])) else { fputs("cannot read \(args[1])\n", stderr); exit(1) }
let handler = VNImageRequestHandler(ciImage: image)
let request = VNGenerateForegroundInstanceMaskRequest()
try handler.perform([request])
guard let found = request.results?.first, !found.allInstances.isEmpty else { fputs("no subject in \(args[1])\n", stderr); exit(3) }
let lifted = try found.generateMaskedImage(ofInstances: found.allInstances, from: handler, croppedToInstancesExtent: false)
try CIContext().writePNGRepresentation(of: CIImage(cvPixelBuffer: lifted), to: URL(fileURLWithPath: args[2]),
                                        format: .RGBA8, colorSpace: CGColorSpace(name: CGColorSpace.sRGB)!)
