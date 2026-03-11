import { getTemplate, DOCUMENT_TEMPLATES } from "@/lib/document-templates";
import { DocFormClient } from "@/components/documents/DocFormClient";
import { notFound } from "next/navigation";

export function generateStaticParams() {
    return DOCUMENT_TEMPLATES.map((t) => ({ docType: t.id }));
}

export default async function DocTypePage({ params }: { params: Promise<{ docType: string }> }) {
    const { docType } = await params;
    const template = getTemplate(docType);
    if (!template) notFound();
    return <DocFormClient templateId={docType} />;
}
