const Jimp = require("jimp");

async function removeWhite() {
    try {
        const image = await Jimp.read("C:\\Users\\einst\\.gemini\\antigravity\\brain\\df108df2-b693-44c3-8fb9-534af7f90448\\domvia_logo_d_spark_1773097374842.png");

        // Scan the image pixels
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
            const r = this.bitmap.data[idx + 0];
            const g = this.bitmap.data[idx + 1];
            const b = this.bitmap.data[idx + 2];

            // Se for branco ou cinza bem claro
            if (r > 245 && g > 245 && b > 245) {
                this.bitmap.data[idx + 3] = 0; // Transparente
            }
        });

        await image.writeAsync("c:\\SOMAR\\AG\\leadbroker-ai\\public\\logo-domvia.png");
        await image.writeAsync("c:\\SOMAR\\AG\\leadbroker-ai\\public\\icon.png");

        console.log("Transparência aplicada com sucesso!");
    } catch (e) {
        console.error("Erro processando imagem:", e);
    }
}

removeWhite();
