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

            using (Bitmap src = new Bitmap(inPath)) {
                int minX = src.Width, minY = src.Height, maxX = 0, maxY = 0;
                bool foundPixel = false;

                Bitmap temp = new Bitmap(src.Width, src.Height, PixelFormat.Format32bppArgb);
                for (int y = 0; y < src.Height; y++) {
                    for (int x = 0; x < src.Width; x++) {
                        Color c = src.GetPixel(x, y);
                        if (c.R > 245 && c.G > 245 && c.B > 245) {
                            temp.SetPixel(x, y, Color.Transparent);
                        } else {
                            temp.SetPixel(x, y, c);
                            if (x < minX) minX = x;
                            if (y < minY) minY = y;
                            if (x > maxX) maxX = x;
                            if (y > maxY) maxY = y;
                            foundPixel = true;
                        }
                    }
                }

                if (!foundPixel) {
                    Console.WriteLine("Erro: Nenhum conteúdo encontrado na imagem.");
                    return;
                }

                int width = maxX - minX + 1;
                int height = maxY - minY + 1;
                
                Rectangle cropRect = new Rectangle(minX, minY, width, height);
                
                using (Bitmap cropped = temp.Clone(cropRect, temp.PixelFormat)) {
                    cropped.Save(logoPath, ImageFormat.Png);
                    cropped.Save(iconPath, ImageFormat.Png);
                    Console.WriteLine(string.Format("Sucesso: Logo recortada ({0}x{1}) e salva.", width, height));
                }
            }
        } catch (Exception ex) {
            Console.WriteLine("Erro: " + ex.Message);
        }
    }
}
