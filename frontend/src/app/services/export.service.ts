import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface PlanExportData {
  patientName:  string;
  goal:         string;
  age:          number;
  tmb?:         number;
  tdee?:        number;
  calories:     number;
  protein:      number;
  carbs:        number;
  fat:          number;
  days: {
    name:  string;
    meals: { slot: string; recipe: string; kcal: number; protein: number }[];
  }[];
}

@Injectable({ providedIn: 'root' })
export class ExportService {

  exportPlanPdf(data: PlanExportData): void {
    const pdf  = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const green = [46, 125, 50] as [number, number, number];
    const pageW = pdf.internal.pageSize.getWidth();

    // Header bar
    pdf.setFillColor(...green);
    pdf.rect(0, 0, pageW, 18, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('NutriFlow — Plan Nutricional', 10, 12);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }), pageW - 10, 12, { align: 'right' });

    // Patient info
    pdf.setTextColor(30, 30, 30);
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.text(data.patientName, 10, 28);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Objetivo: ${data.goal}  ·  Edad: ${data.age} años`, 10, 34);

    // Goals chips row
    const chips = [
      { label: 'TMB',          value: `${data.tmb} kcal`     },
      { label: 'TDEE',         value: `${data.tdee} kcal`    },
      { label: 'Meta diaria',  value: `${data.calories} kcal`},
      { label: 'Proteína',     value: `${data.protein} g`    },
      { label: 'Carbohidratos',value: `${data.carbs} g`      },
      { label: 'Grasas',       value: `${data.fat} g`        },
    ];
    const chipW = (pageW - 20) / chips.length;
    chips.forEach((c, i) => {
      const x = 10 + i * chipW;
      pdf.setFillColor(245, 245, 245);
      pdf.roundedRect(x, 38, chipW - 2, 14, 2, 2, 'F');
      pdf.setFontSize(7);
      pdf.setTextColor(120, 120, 120);
      pdf.text(c.label.toUpperCase(), x + (chipW - 2) / 2, 43, { align: 'center' });
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 30, 30);
      pdf.text(c.value, x + (chipW - 2) / 2, 49, { align: 'center' });
      pdf.setFont('helvetica', 'normal');
    });

    // Weekly table
    const dayOrder = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
    const slots    = ['Desayuno', 'Comida', 'Cena'];
    const head     = [['', ...dayOrder]];

    const body = slots.map(slot => {
      const row: string[] = [slot];
      dayOrder.forEach(dayName => {
        const day  = data.days.find(d => d.name === dayName);
        const meal = day?.meals.find(m => m.slot === slot);
        row.push(meal?.recipe ? `${meal.recipe}\n${meal.kcal} kcal · ${meal.protein}g prot` : '—');
      });
      return row;
    });

    autoTable(pdf, {
      startY: 57,
      head,
      body,
      styles:       { fontSize: 7.5, cellPadding: 3, lineColor: [220, 220, 220], lineWidth: 0.2 },
      headStyles:   { fillColor: green, textColor: 255, fontStyle: 'bold', fontSize: 8 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 20, fillColor: [245, 250, 245] } },
      alternateRowStyles: { fillColor: [250, 253, 250] },
      theme: 'grid',
    });

    pdf.save(`plan-${data.patientName.replace(/\s+/g, '-').toLowerCase()}.pdf`);
  }
}
