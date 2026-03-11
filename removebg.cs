using System;
using System.Drawing;
using System.Drawing.Imaging;

class Program {
    static void Main() {
        try {
            string inPath = @"C:\Users\einst\.gemini\antigravity\brain\df108df2-b693-44c3-8fb9-534af7f90448\media__1773097916120.png";
            string outPath1 = @"c:\SOMAR\AG\leadbroker-ai\public\logo-domvia.png";
            string outPath2 = @"c:\SOMAR\AG\leadbroker-ai\public\icon.png";
            
            using (Bitmap img = new Bitmap(inPath)) {
                int width = img.Width;
                int height = img.Height;

                for (int x = 0; x < width; x++) {
                    for (int y = 0; y < height; y++) {
                        Color c = img.GetPixel(x, y);
                        if (c.R > 240 && c.G > 240 && c.B > 240) {
                            img.SetPixel(x, y, Color.Transparent);
                        }
                    }
                }
                img.Save(outPath1, ImageFormat.Png);
                img.Save(outPath2, ImageFormat.Png);
                Console.WriteLine("Background removed successfully");
            }
        } catch (Exception ex) {
            Console.WriteLine("Error: " + ex.Message);
        }
    }
}
