/* =====================================================================
   LISTE DES TECHNICIENS – menu déroulant du bon et de l'ordre d'intervention
   Une ligne par technicien :  { nom: "Prénom NOM", mail: "adresse@mail.fr" },
   - Pour ajouter un technicien : copiez une ligne et changez le nom et le mail
   - Pour en retirer un : supprimez sa ligne
   - Le mail est rempli automatiquement dans l'ordre d'intervention (laissez "" si inconnu)
   ===================================================================== */
const TECHNICIENS = [
    { nom: "Sébastien BIGEL",     mail: "sbigel@oci.fr" },
    { nom: "Stéphane RACADOT",    mail: "sracadot@oci.fr" },
    { nom: "Cédric MARIOTTE",     mail: "cmariotte@oci.fr" },
    { nom: "Matéo PERROUIN",      mail: "mperrouin@oci.fr" },
    { nom: "Raphaël CASTELLANOS", mail: "rcastellanos-ext@oci.fr" },
];


/* ---------- Ne pas modifier en dessous ---------- */
// Noms et mails (accepte aussi l'ancien format : simple texte "Prénom NOM")
const TECH_LIST = TECHNICIENS.map(t => typeof t === 'string' ? { nom: t, mail: '' } : { nom: t.nom || '', mail: t.mail || '' }).filter(t => t.nom);
const TECH_NAMES = TECH_LIST.map(t => t.nom);
function techMail(nom) { const t = TECH_LIST.find(x => x.nom === nom); return t ? t.mail : ''; }

// Transforme un champ texte en menu déroulant (+ « Autre… » pour saisir un nom libre).
// Renvoie une fonction à appeler quand la valeur du champ est changée par le code.
function techPicker(input) {
    const key = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .split(/\s+/).filter(Boolean).sort().join(' ');
    const sel = document.createElement('select');
    sel.className = 'tech-select';
    sel.setAttribute('aria-label', 'Technicien');
    const add = (value, label) => { const o = document.createElement('option'); o.value = value; o.textContent = label; sel.appendChild(o); };
    add('', '— Choisir un technicien —');
    TECH_NAMES.forEach(n => add(n, n));
    add('__autre', 'Autre… (saisir le nom)');
    input.before(sel);
    if (!input.placeholder) input.placeholder = 'Nom du technicien';

    function sync() {
        const v = input.value.trim();
        // « CASTELLANOS Raphaël » ou « raphael castellanos » sont reconnus comme « Raphaël CASTELLANOS »
        const known = TECH_NAMES.find(n => key(n) === key(v));
        if (!v) { sel.value = ''; input.hidden = true; }
        else if (known) { sel.value = known; input.value = known; input.hidden = true; }
        else { sel.value = '__autre'; input.hidden = false; }
    }
    sel.addEventListener('change', () => {
        if (sel.value === '__autre') { input.value = ''; input.hidden = false; input.focus(); }
        else { input.value = sel.value; input.hidden = true; }
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    sync();
    return sync;
}
