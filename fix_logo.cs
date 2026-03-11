using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;

class Program {
    static void Main() {
        try {
            string inPath = @"C:\Users\einst\.gemini\antigravity\brain\df108df2-b693-44c3-8fb9-534af7f90448\domvia_logo_d_spark_1773097374842.png";
            string outDir = @"c:\SOMAR\AG\leadbroker-ai\public";
            string logoPath = Path.Combine(outDir, "logo-domvia.png");
            string iconPath = Path.Combine(outDir, "icon.png");

            if (!Directory.Exists(outDir)) Directory.CreateDirectory(outDir);

            using (Bitmap img = new Bitmap(inPath)) {
                int width = img.Width;
                int height = img.Height;
                Bitmap transparentImg = new Bitmap(width, height, PixelFormat.Format32bppArgb);

                for (int y = 0; y < height; y++) {
                    for (int x = 0; x < width; x++) {
                        Color c = img.GetPixel(x, y);
                        // Se for quase branco, torna transparente
                        if (c.R > 250 && c.G > 250 && c.B > 250) {
                            transparentImg.SetPixel(x, y, Color.FromArgb(0, 255, 255, 255));
                        } else {
                            transparentImg.SetPixel(x, y, c);
                        }
                    }
                }
                transparentImg.Save(logoPath, ImageFormat.Png);
                transparentImg.Save(iconPath, ImageFormat.Png);
                Console.WriteLine("SUCESSO: Logo transparente gerada.");
            }
        } catch (Exception ex) {
            Console.WriteLine("ERRO: " + ex.Message);
        }
    }
}
