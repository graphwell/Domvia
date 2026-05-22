/**
 * check-db.js — Diagnóstico e correção do Firebase RTDB
 * 
 * Uso:
 *   node check-db.js                        → lista todos os usuários
 *   node check-db.js set-admin <email>       → promove usuário para ADMIN_MASTER
 *   node check-db.js set-role <email> <role> → define role manualmente
 * 
 * Requer: npm install firebase-admin (já instalado no projeto)
 */

// Lê variáveis do .env.local manualmente
const fs = require("fs");
const path = require("path");

function loadEnv(filePath) {
  const lines = fs.readFileSync(filePath, "utf-8").split(/\r?\n/);
  const env = {};
  for (const line of lines) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) env[match[1].trim()] = match[2].trim();
  }
  return env;
}

const envPath = path.join(__dirname, ".env.local");
if (!fs.existsSync(envPath)) {
  console.error("❌ .env.local não encontrado!");
  process.exit(1);
}

const env = loadEnv(envPath);

// Verifica se as credenciais do Admin SDK estão configuradas
const projectId  = env.FIREBASE_PROJECT_ID  || env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = env.FIREBASE_CLIENT_EMAIL;
const privateKey  = env.FIREBASE_PRIVATE_KEY;
const databaseURL = env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;

console.log("\n🔍 Configuração detectada:");
console.log("  Project ID  :", projectId  || "❌ AUSENTE");
console.log("  Database URL:", databaseURL || "❌ AUSENTE");
console.log("  Client Email:", clientEmail || "⚠️  AUSENTE (modo público)");
console.log("  Private Key :", privateKey  ? "✅ Presente" : "⚠️  AUSENTE (modo público)");
console.log("");

// ─── Modo: Firebase Admin SDK (se credenciais disponíveis) ─────────────
if (clientEmail && privateKey && projectId) {
  runWithAdminSDK();
} else {
  // ─── Modo: Fallback REST API (sem credenciais de serviço) ─────────────
  console.log("⚠️  Credenciais FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY não encontradas.");
  console.log("   Usando REST API com dados públicos do Firebase...\n");
  runWithRestAPI();
}

// ══════════════════════════════════════════════════════════════════
// MODO 1: Admin SDK
// ══════════════════════════════════════════════════════════════════
function runWithAdminSDK() {
  let admin;
  try {
    admin = require("firebase-admin");
  } catch (e) {
    console.error("❌ firebase-admin não instalado. Execute: npm install firebase-admin");
    process.exit(1);
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
      databaseURL,
    });
  }

  const db = admin.database();
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === "set-admin" || command === "set-role") {
    const targetEmail = args[1];
    const targetRole  = command === "set-admin" ? "ADMIN_MASTER" : args[2];

    if (!targetEmail) {
      console.error("❌ Forneça o email: node check-db.js set-admin <email>");
      process.exit(1);
    }

    console.log(`🔧 Buscando usuário: ${targetEmail}...`);
    db.ref("users").once("value", (snap) => {
      const users = snap.val() || {};
      const uid = Object.keys(users).find(k => users[k].email === targetEmail);

      if (!uid) {
        console.error(`❌ Usuário não encontrado com email: ${targetEmail}`);
        const emails = Object.values(users).map(u => u.email).filter(Boolean);
        console.log("\n📋 Emails disponíveis:");
        emails.forEach(e => console.log("  -", e));
        process.exit(1);
      }

      const oldRole = users[uid].role;
      db.ref(`users/${uid}/role`).set(targetRole, (err) => {
        if (err) {
          console.error("❌ Erro ao atualizar:", err.message);
        } else {
          console.log(`✅ Role atualizado com sucesso!`);
          console.log(`   UID  : ${uid}`);
          console.log(`   Email: ${targetEmail}`);
          console.log(`   Role : ${oldRole} → ${targetRole}`);
          console.log("\n🚀 Faça login novamente no sistema para aplicar as alterações.");
        }
        process.exit(0);
      });
    });
  } else {
    // Listar todos os usuários
    console.log("📋 Listando todos os usuários no banco de dados...\n");
    db.ref("users").once("value", (snap) => {
      const users = snap.val() || {};
      const total = Object.keys(users).length;

      if (total === 0) {
        console.log("⚠️  Nenhum usuário encontrado no banco de dados!");
        process.exit(0);
      }

      console.log(`Total: ${total} usuário(s)\n`);
      console.log("─".repeat(80));

      Object.entries(users).forEach(([uid, data]) => {
        const u = data;
        const roleIcon = u.role?.startsWith("ADMIN") ? "👑" : "👤";
        console.log(`${roleIcon} ${u.name || "(sem nome)"}`);
        console.log(`   Email   : ${u.email || "?"}`);
        console.log(`   UID     : ${uid}`);
        console.log(`   Role    : ${u.role || "❌ AUSENTE"}`);
        console.log(`   Plan    : ${u.planId || u.plan || "?"}`);
        console.log(`   Credits : ${u.credits ?? "?"}`);
        console.log(`   Status  : ${u.status || "?"}`);
        console.log("─".repeat(80));
      });

      console.log("\n💡 Para promover um usuário a admin:");
      console.log("   node check-db.js set-admin <email>");
      process.exit(0);
    });
  }
}

// ══════════════════════════════════════════════════════════════════
// MODO 2: REST API (sem Admin SDK credentials)
// ══════════════════════════════════════════════════════════════════
async function runWithRestAPI() {
  if (!databaseURL) {
    console.error("❌ NEXT_PUBLIC_FIREBASE_DATABASE_URL não configurado no .env.local");
    console.log("\n📝 Adicione ao .env.local:");
    console.log("   NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://seu-projeto-default-rtdb.firebaseio.com");
    process.exit(1);
  }

  console.log("⚠️  AVISO: Sem Admin SDK, só é possível ler dados se as regras do RTDB permitirem leitura pública.");
  console.log("   Para acesso completo, adicione ao .env.local:");
  console.log("   FIREBASE_PROJECT_ID=<seu-project-id>");
  console.log("   FIREBASE_CLIENT_EMAIL=<service-account-email>");
  console.log("   FIREBASE_PRIVATE_KEY=<private-key>\n");

  try {
    const url = `${databaseURL}/users.json`;
    console.log(`🌐 Acessando: ${url}\n`);

    const response = await fetch(url);
    if (!response.ok) {
      const text = await response.text();
      console.error("❌ Erro HTTP:", response.status, text);
      console.log("\n💡 Provavelmente as regras do Firebase bloqueiam leitura sem autenticação.");
      console.log("   Configure as credenciais do Admin SDK para acesso total.");
      process.exit(1);
    }

    const users = await response.json();
    if (!users) {
      console.log("⚠️  Nenhum usuário encontrado ou acesso negado.");
      process.exit(0);
    }

    const total = Object.keys(users).length;
    console.log(`✅ Conexão OK! Total: ${total} usuário(s)\n`);
    console.log("─".repeat(80));

    Object.entries(users).forEach(([uid, data]) => {
      const u = data;
      const roleIcon = u.role?.startsWith("ADMIN") ? "👑" : "👤";
      console.log(`${roleIcon} ${u.name || "(sem nome)"}`);
      console.log(`   Email: ${u.email || "?"}`);
      console.log(`   UID  : ${uid}`);
      console.log(`   Role : ${u.role || "❌ AUSENTE"}`);
      console.log(`   Plan : ${u.planId || u.plan || "?"}`);
      console.log("─".repeat(80));
    });

    console.log("\n💡 Para promover um usuário a admin, configure o Admin SDK e use:");
    console.log("   node check-db.js set-admin <email>");
  } catch (err) {
    console.error("❌ Erro ao acessar o banco:", err.message);
  }
}
