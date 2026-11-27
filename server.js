const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const FICHIER = path.join(__dirname, 'commandes.json');
const MOT_DE_PASSE = process.env.ADMIN_PASSWORD || 'changez-moi';

function lire() {
  try { return JSON.parse(fs.readFileSync(FICHIER, 'utf8')); }
  catch (e) { return {}; }
}
function ecrire(data) {
  fs.writeFileSync(FICHIER, JSON.stringify(data, null, 2));
}

app.post('/api/commandes', (req, res) => {
  const toutes = lire();
  const numero = 'LE-' + Math.floor(10000 + Math.random() * 90000);
  toutes[numero] = { ...req.body, numero, etape: 0, date: new Date().toISOString() };
  ecrire(toutes);
  res.json({ numero });
});

app.get('/api/commandes/:numero', (req, res) => {
  const c = lire()[req.params.numero.toUpperCase()];
  if (!c) return res.status(404).json({ erreur: 'Introuvable' });
  res.json({ numero: c.numero, service: c.service, depart: c.depart, arrivee: c.arrivee, prix: c.prix, etape: c.etape });
});

app.get('/api/admin/commandes', (req, res) => {
  if (req.headers['x-mot-de-passe'] !== MOT_DE_PASSE) return res.status(401).json({ erreur: 'Accès refusé' });
  res.json(Object.values(lire()).reverse());
});

app.post('/api/admin/commandes/:numero/etape', (req, res) => {
  if (req.headers['x-mot-de-passe'] !== MOT_DE_PASSE) return res.status(401).json({ erreur: 'Accès refusé' });
  const toutes = lire();
  const c = toutes[req.params.numero];
  if (!c) return res.status(404).json({ erreur: 'Introuvable' });
  c.etape = Math.max(0, Math.min(4, parseInt(req.body.etape, 10) || 0));
  ecrire(toutes);
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Livraison Express sur le port ' + PORT));
