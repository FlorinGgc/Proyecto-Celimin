const translations = {
    es: {
        "app_title": "CELIMIN",
        "app_subtitle": "Centro de Investigación Avanzada del Litio y minerales industriales",
        "nav_dashboard": "Panel Unificado",
        "nav_agenda": "Agenda y Turnos",
        "nav_movements": "Movimientos de Equipos",
        "nav_requests": "Solicitudes",
        "nav_planning": "Planificación",
        "nav_inventory": "Inventario",
        "nav_admin": "Admin y Limpieza",
        "nav_map": "Mapa Interactivo",
        "nav_library": "Biblioteca Digital",
        "nav_logout": "Cerrar Sesión",
        "btn_add_work": "Agendar Trabajo",
        "btn_add_movement": "Mover Equipo",
        "btn_add_request": "Solicitar Insumo",
        "btn_add_planning": "Planificar Actividad",
        "btn_add_cleaning": "Reg. Limpieza",
        "btn_export_pdf": "Exportar PDF General",
        "btn_delete_all": "Eliminar Todo",
        "btn_new_record": "Nuevo Registro",
        "btn_new_user": "Registrar Usuario",
        "btn_new_lab": "Nuevo Lab/Sede",
        "btn_new_turn": "Nuevo Turno",
        "btn_new_usage": "Registrar Uso",
        "table_type_title": "TIPO / TÍTULO",
        "table_date": "FECHA",
        "table_time": "HORA",
        "table_supplies": "INSUMOS / DETALLE",
        "table_equipment": "EQUIPO / RESPONSABLE",
        "table_actions": "ACCIONES",
        "dashboard_title": "Gestión de trabajos, movimientos y solicitudes",
        "modal_agendar_title": "Agendar Trabajo",
        "form_title_item": "Título del Trabajo / Ítem",
        "form_date": "Fecha a Agendar",
        "form_time_start": "Hora Inicio",
        "form_time_end": "Hora Fin",
        "form_equipment": "Seleccionar Equipo",
        "form_supplies": "Seleccionar Insumos / Reactivos",
        "form_responsible": "Responsable",
        "btn_cancel": "Cancelar",
        "btn_save": "Guardar",
        "lang_es": "Español",
        "lang_en": "Inglés",
        "sidebar_title": "Sistema de Gestión",
        "search_placeholder": "Buscar...",
        "summary_title": "Panel de Resumen",
        "stat_total_items": "Ítems Totales",
        "stat_stock_alerts": "Alertas Stock",
        "stat_movements_today": "Movimientos Hoy",
        "header_title": "Dashboard General",
        "header_subtitle": "Resumen del estado del laboratorio"
    },
    en: {
        "app_title": "CELIMIN",
        "app_subtitle": "Advanced Lithium and Industrial Minerals Research Center",
        "nav_dashboard": "Unified Panel",
        "nav_agenda": "Agenda & Shifts",
        "nav_movements": "Equipment Movements",
        "nav_requests": "Requests",
        "nav_planning": "Planning",
        "nav_inventory": "Inventory",
        "nav_admin": "Admin & Cleaning",
        "nav_map": "Interactive Map",
        "nav_library": "Digital Library",
        "nav_logout": "Log Out",
        "btn_add_work": "Schedule Work",
        "btn_add_movement": "Move Equipment",
        "btn_add_request": "Request Supply",
        "btn_add_planning": "Plan Activity",
        "btn_add_cleaning": "Log Cleaning",
        "btn_export_pdf": "Export Master PDF",
        "btn_delete_all": "Delete All",
        "btn_new_record": "New Record",
        "btn_new_user": "Register User",
        "btn_new_lab": "New Lab/Site",
        "btn_new_turn": "New Shift",
        "btn_new_usage": "Log Usage",
        "table_type_title": "TYPE / TITLE",
        "table_date": "DATE",
        "table_time": "TIME",
        "table_supplies": "SUPPLIES / DETAILS",
        "table_equipment": "EQUIPMENT / PERSON",
        "table_actions": "ACTIONS",
        "dashboard_title": "Management of work, movements, and requests",
        "modal_agendar_title": "Schedule Work",
        "form_title_item": "Work Title / Item",
        "form_date": "Schedule Date",
        "form_time_start": "Start Time",
        "form_time_end": "End Time",
        "form_equipment": "Select Equipment",
        "form_supplies": "Select Supplies / Reagents",
        "form_responsible": "Person in Charge",
        "btn_cancel": "Cancel",
        "btn_save": "Save",
        "lang_es": "Spanish",
        "lang_en": "English",
        "sidebar_title": "Management System",
        "search_placeholder": "Search...",
        "summary_title": "Summary Panel",
        "stat_total_items": "Total Items",
        "stat_stock_alerts": "Stock Alerts",
        "stat_movements_today": "Movements Today",
        "header_title": "General Dashboard",
        "header_subtitle": "Laboratory Status Summary"
    }
};

let currentLang = localStorage.getItem('app_lang') || 'es';

function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    localStorage.setItem('app_lang', lang);
    applyTranslations();
}

function applyTranslations() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang] && translations[currentLang][key]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                if (el.type === 'button' || el.type === 'submit') {
                    el.value = translations[currentLang][key];
                } else {
                    el.placeholder = translations[currentLang][key];
                }
            } else {
                el.textContent = translations[currentLang][key];
            }
        }
    });

    window.dispatchEvent(new Event('languageChanged'));
}

window.t = function(key) {
    return (translations[currentLang] && translations[currentLang][key]) || key;
}

window.toggleLanguage = function() {
    const newLang = currentLang === 'es' ? 'en' : 'es';
    setLanguage(newLang);
    updateLangButtonUI(newLang);
}

function updateLangButtonUI(lang) {
    const btn = document.getElementById('btn-toggle-lang');
    if (btn) {
        btn.innerHTML = lang === 'es' 
            ? '<i class="fas fa-globe"></i> EN' 
            : '<i class="fas fa-globe"></i> ES';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    applyTranslations();
    updateLangButtonUI(currentLang);
});
