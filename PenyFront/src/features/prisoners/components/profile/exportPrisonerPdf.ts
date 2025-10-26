import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { CompletePrisonerProfile } from '../../../../shared/types';


export function exportPrisonerPdf(profile: CompletePrisonerProfile, fecha: string) {
  const doc = new jsPDF();

  // Fondo militar verde
  doc.setFillColor(34, 49, 34); // Verde militar
  doc.rect(0, 0, 210, 297, 'F');

  // Encabezado
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text('INFORME PENITENCIARIO', 60, 20);

  doc.setFontSize(12);
  doc.setTextColor(200, 255, 200);
  doc.text('Centro Penitenciario - SIGEPEN', 60, 28);

  doc.setDrawColor(80, 120, 80);
  doc.line(14, 34, 195, 34); // Línea separadora

  // Datos principales
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(`Nombre: ${profile.identity?.first_name ?? ''} ${profile.identity?.surname ?? ''}`, 14, 42);
  doc.text(`Registro: ${profile.prisoner.registration_number ?? ''}`, 14, 50);
  doc.text(`Estado: ${profile.prisoner.status ?? ''}`, 14, 58);
  doc.text(`Expediente: ${profile.prisoner.fiscal_file_number ?? ''}`, 14, 66);
  doc.text(`Fecha de exportación: ${new Date().toLocaleString('es-ES')}`, 14, 74);

  // Tabla de detalles
  autoTable(doc, {
    startY: 80,
    head: [['Campo', 'Valor']],
    body: [
      // ...tus campos
    ],
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 2, fillColor: [34, 49, 34], textColor: 255 },
    headStyles: { fillColor: [80, 120, 80], textColor: 255 },
    alternateRowStyles: { fillColor: [44, 59, 44] },
  });

  // Pie de página
  doc.setFontSize(10);
  doc.setTextColor(200, 255, 200);
  doc.text('SIGEPEN - Sistema de Gestión Penitenciaria', 14, 285);

  doc.save(`recluso_${profile.prisoner.registration_number ?? 'perfil'}_${fecha}.pdf`);
}