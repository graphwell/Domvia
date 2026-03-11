// Rota legada — redireciona para /lead/[linkId]
import { redirect } from "next/navigation";
export default function ImovelPage() {
    redirect("/links");
}
