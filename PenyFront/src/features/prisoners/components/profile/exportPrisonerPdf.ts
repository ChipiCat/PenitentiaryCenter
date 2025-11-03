import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import type { CompletePrisonerProfile } from "../../../../shared/types";

export async function exportPrisonerPdf(
  profile: CompletePrisonerProfile,
  fecha: string
) {
  const doc = new jsPDF();

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(2);
  doc.rect(20, 20, 170, 250);

  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("POLICÍA BOLIVIANA", 70, 40);

  doc.addImage("https://i.ibb.co/zWFtDg3k/image.png", "PNG", 45, 50, 120, 100);

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("INFORME PENITENCIARIO", 105, 160, { align: "center" });
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("DIRECCIÓN NACIONAL DE SEGURIDAD PENITENCIARIA Y", 105, 175, {
    align: "center",
  });
  doc.text("DIRECCIÓN DE ESTABLECIMIENTOS PENITENCIARIOS", 105, 185, {
    align: "center",
  });
  doc.text("Cochabamba – Bolivia", 105, 210, { align: "center" });
  doc.text("2025", 105, 220, { align: "center" });
  doc.setFontSize(10);
  doc.text("1.", 105, 260, { align: "center" });

  doc.addPage();

  doc.addImage(
    "https://i.postimg.cc/MGz1ytkr/image.png",
    "PNG",
    14,
    14,
    18,
    18
  );

  doc.setFontSize(14);
  doc.setTextColor(34, 49, 34);
  doc.text("INFORME PENITENCIARIO", 105, 20, { align: "center" });

  doc.setFontSize(12);
  doc.setTextColor(80, 120, 80);
  doc.text("Centro Penitenciario - SIGEPEN", 105, 28, { align: "center" });

  doc.setDrawColor(80, 120, 80);
  doc.setLineWidth(3);
  doc.line(14, 34, 196, 34);

  doc.setFontSize(12);
  doc.setTextColor(34, 49, 34);
  doc.text(
    `Nombre: ${profile.identity?.first_name ?? ""} ${
      profile.identity?.surname ?? ""
    }`,
    14,
    44
  );
  doc.text(`Registro: ${profile.prisoner.registration_number ?? ""}`, 14, 52);
  doc.text(`Estado: ${profile.prisoner.status ?? ""}`, 14, 60);
  doc.text(`Expediente: ${profile.prisoner.fiscal_file_number ?? ""}`, 14, 68);
  doc.text(
    `Fecha de exportación: ${new Date().toLocaleString("es-ES")}`,
    14,
    76
  );

  if (profile.identity?.photo_file?.url) {
    const base64Foto = await fetch(profile.identity.photo_file.url)
      .then((response) => response.blob())
      .then(
        (blob) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          })
      );
    doc.addImage(base64Foto, "JPEG", 150, 38, 40, 40);
  }

  let finalY = 80;
  autoTable(doc, {
    startY: finalY,
    head: [["Campo", "Valor"]],
    body: [
      [
        "Número de Registro",
        profile.prisoner.registration_number ?? "No disponible",
      ],
      [
        "Fecha de Ingreso",
        profile.prisoner.admission_date
          ? new Date(profile.prisoner.admission_date).toLocaleDateString(
              "es-ES"
            )
          : "No disponible",
      ],
      [
        "Expediente Fiscal",
        profile.prisoner.fiscal_file_number ?? "No disponible",
      ],
      ["Registrado el", profile.prisoner.createdAt ?? "No disponible"],
      [
        "Categoría",
        profile.penitentiary?.category
          ? profile.penitentiary.category.replace(/([a-z])([A-Z])/g, "$1 $2")
          : "No disponible",
      ],
    ],
    theme: "grid",
    styles: {
      fontSize: 10,
      cellPadding: 2,
      fillColor: [255, 255, 255],
      textColor: 34,
    },
    headStyles: { fillColor: [80, 120, 80], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { top: 80 },
    didDrawPage: (data: unknown) => {
      const cursor = (data as { cursor?: { y?: number } }).cursor;
      if (cursor && typeof cursor.y === "number") finalY = cursor.y;
    },
  });

  autoTable(doc, {
    startY: finalY + 8,
    head: [["Campo", "Valor"]],
    body: [
      [
        "Nombre",
        `${profile.identity?.first_name ?? "No disponible"} ${
          profile.identity?.surname ?? ""
        }`,
      ],
      [
        "Fecha de nacimiento",
        profile.identity?.birth_date
          ? new Date(profile.identity.birth_date).toLocaleDateString("es-ES")
          : "No disponible",
      ],
      ["Nacionalidad", profile.identity?.nationality ?? "No disponible"],
      ["Residencia", profile.identity?.residence ?? "No disponible"],
      ["Género", profile.personal?.gender ?? "No disponible"],
      ["Estado civil", profile.personal?.marital_status ?? "No disponible"],
      ["Nivel educativo", profile.personal?.education_level ?? "No disponible"],
      ["Ocupación", profile.personal?.occupation ?? "No disponible"],
      [
        "Contacto de emergencia",
        profile.personal?.emergency_contact ?? "No disponible",
      ],
      [
        "Teléfono de emergencia",
        profile.personal?.emergency_phone ?? "No disponible",
      ],
     
      ["Nombre del padre", profile.personal?.father_name ?? "No disponible"],
      ["Nombre de la madre", profile.personal?.mother_name ?? "No disponible"],
      [
        "Tipo de documento",
        profile.personal?.id_document_type ?? "No disponible",
      ],
      [
        "Número de documento",
        profile.personal?.id_document_number ?? "No disponible",
      ],
      ["Idiomas", profile.personal?.languages ?? "No disponible"],
      ["Registro", profile.prisoner.registration_number ?? "No disponible"],
      ["Estado", profile.prisoner.status ?? "No disponible"],
      ["Expediente", profile.prisoner.fiscal_file_number ?? "No disponible"],
      [
        "Fecha de ingreso",
        profile.prisoner.admission_date
          ? new Date(profile.prisoner.admission_date).toLocaleDateString(
              "es-ES"
            )
          : "No disponible",
      ],
      [
        "Categoría",
        profile.penitentiary?.category
          ? profile.penitentiary.category.replace(/([a-z])([A-Z])/g, "$1 $2")
          : "No disponible",
      ],
      ["Edificio", profile.penitentiary?.building_number ?? "No disponible"],
      ["Celda", profile.penitentiary?.cell_number ?? "No disponible"],
      ["Cama", profile.penitentiary?.bed_number ?? "No disponible"],
      [
        "Casos",
        profile.cases && profile.cases.length > 0
          ? profile.cases.map((c) => c.crime).join(", ")
          : "No hay casos registrados",
      ],
      [
        "Registros médicos",
        profile.medical_records && profile.medical_records.length > 0
          ? profile.medical_records
              .map(
                (m) =>
                  `Dr. ${m.doctor_name}, ${
                    m.examination_date
                      ? new Date(m.examination_date).toLocaleDateString("es-ES")
                      : m.examination_date
                  }${m.reference_number ? ", Ref: " + m.reference_number : ""}${
                    m.notes ? ", Notas: " + m.notes : ""
                  }`
              )
              .join("; ")
          : "No hay registros médicos",
      ],
      [
        "Pertenencias",
        profile.belongings && profile.belongings.length > 0
          ? profile.belongings
              .map(
                (b) =>
                  `${b.description} (Cantidad: ${b.quantity}${
                    b.condition ? ", Estado: " + b.condition : ""
                  }${b.is_returned ? ", Devuelto" : ", No devuelto"})`
              )
              .join("; ")
          : "No hay pertenencias registradas",
      ],
      [
        "Contactos",
        profile.contacts && profile.contacts.length > 0
          ? profile.contacts
              .map(
                (c) =>
                  c.name + (c.relationship ? " (" + c.relationship + ")" : "")
              )
              .join("; ")
          : "No hay contactos registrados",
      ],
      [
        "Hijos",
        profile.children && profile.children.length > 0
          ? profile.children
              .map(
                (h) =>
                  `${h.full_name}${
                    h.birth_date ? " (Nacimiento: " + h.birth_date + ")" : ""
                  }`
              )
              .join("; ")
          : "No hay hijos registrados",
      ],
    ],
    theme: "grid",
    styles: {
      fontSize: 10,
      cellPadding: 2,
      fillColor: [255, 255, 255],
      textColor: 34,
    },
    headStyles: { fillColor: [80, 120, 80], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    didDrawPage: (data: unknown) => {
      const cursor = (data as { cursor?: { y?: number } }).cursor;
      if (cursor && typeof cursor.y === "number") finalY = cursor.y;
    },
  });

  const lastTableY = finalY + 8;
  autoTable(doc, {
    startY: lastTableY,
    head: [["Contactos de Emergencia"]],
    body:
      profile.contacts && profile.contacts.length > 0
        ? profile.contacts.map((c) => [
            `${c.name}${c.relationship ? " (" + c.relationship + ")" : ""}`,
          ])
        : [["No hay contactos de emergencia registrados"]],
    theme: "grid",
    styles: {
      fontSize: 10,
      cellPadding: 2,
      fillColor: [255, 255, 255],
      textColor: 34,
    },
    headStyles: { fillColor: [80, 120, 80], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  doc.setFontSize(10);
  doc.setTextColor(80, 120, 80);
  doc.text("SIGEPEN - Sistema de Gestión Penitenciaria", 14, 285);

  doc.save(
    `recluso_${profile.prisoner.registration_number ?? "perfil"}_${fecha}.pdf`
  );
}
