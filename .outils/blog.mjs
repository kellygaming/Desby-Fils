// Génère blog.html et les pages d'articles à partir des données ci-dessous.
// Utilisation : node .outils/blog.mjs   (depuis le dossier du site)
import fs from 'node:fs';

const V = 3; // numéro de version du CSS / JS (à augmenter à chaque modification)

const articles = [
  {
    slug: 'grace-divine', theme: 'Chantier', titre: 'Grâce Divine : le chantier de Jacqueville est lancé',
    resume: 'Après plus de deux ans de patience, les engins sont enfin sur le lotissement approuvé Grâce Divine, morcelé en lots de 400 m².',
    couverture: 'blog/gd-2.jpg', tete: 'blog/gd-1.jpg',
    texte: [
      ['grand', 'C\'est un jour que toute l\'équipe attendait. Le lotissement <strong>Grâce Divine</strong>, à Jacqueville, est officiellement approuvé, et le chantier a démarré.'],
      ['', 'Le contrat avait été signé il y a plus de deux ans. Il a fallu patienter, suivre les démarches et attendre le feu vert. Aujourd\'hui, la chargeuse ouvre les voies, les équipes tracent les rues et le site prend forme, lot après lot.'],
      ['citation', 'Dieu merci, en ce jour, nous sommes en train de travailler sur le chantier, bel et bien.', 'La direction, sur le chantier de Jacqueville'],
      ['', 'Le site est morcelé en lots de <strong>400 m²</strong>. Pour réserver le vôtre ou organiser une visite, contactez-nous sur WhatsApp.'],
    ],
    photos: [['blog/gd-1.jpg', 'La chargeuse arrive sur le chantier'], ['blog/gd-2.jpg', 'Tracé des voies au milieu des palmiers']],
    videos: [['grace-divine-chef.mp4', 'blog/gd-video-chef.jpg', 'Le point sur le chantier, en direct de Jacqueville'], ['grace-divine-route.mp4', 'blog/gd-video-route.jpg', 'En route vers le site']],
  },
  {
    slug: 'electrification', theme: 'Viabilisation', titre: 'La lumière arrive sur nos lotissements',
    resume: 'Poteaux en béton, câblage et éclairage public : nos lotissements se dotent du réseau électrique, étape clé de la viabilisation.',
    couverture: 'blog/elec-1.jpg', tete: 'blog/elec-4.jpg',
    texte: [
      ['grand', 'Un terrain viabilisé, c\'est un terrain prêt à vivre. Après le remblayage et le tracé des voies, place à l\'électricité.'],
      ['', 'Les poteaux en béton sont livrés sur site puis dressés le long des futures rues. Nos techniciens, équipés de harnais et de casques, montent ensuite tirer les câbles et installer les lampadaires.'],
      ['', 'Le résultat : des voies éclairées dès la tombée de la nuit, et un réseau prêt à raccorder les maisons. Un vrai plus pour la sécurité et pour la valeur de chaque lot.'],
    ],
    photos: [['blog/elec-1.jpg', 'Installation d\'un lampadaire'], ['blog/elec-2.jpg', 'Raccordement en hauteur'], ['blog/elec-4.jpg', 'Les poteaux en béton livrés sur le site'], ['blog/elec-3.jpg', 'Éclairage public en service']],
  },
  {
    slug: 'bornage', theme: 'Foncier', titre: 'Bornage : chaque lot à sa juste place',
    resume: 'GPS de précision, bornes scellées et visites avec les géomètres : comment nous délimitons chaque parcelle avant de la remettre.',
    couverture: 'blog/born-1.jpg', tete: 'blog/born-3.jpg',
    texte: [
      ['grand', 'Avant de construire, il faut savoir exactement où commence et où s\'arrête son terrain. C\'est tout l\'enjeu du bornage.'],
      ['', 'Avec les géomètres, nous relevons chaque point au GPS de précision. Les bornes en béton, peintes en rouge pour être bien visibles, sont ensuite scellées aux angles de chaque lot.'],
      ['', 'Les clients et partenaires sont invités sur le terrain pour voir leur parcelle délimitée de leurs propres yeux. La confiance, ça se construit aussi comme ça.'],
    ],
    photos: [['blog/born-1.jpg', 'Relevés au GPS de précision'], ['blog/born-2.jpg', 'Scellement d\'une borne'], ['blog/born-3.jpg', 'Visite d\'un partenaire sur le terrain'], ['visite-geometres.jpg', 'Avec l\'équipe de géomètres'], ['visite-geometres-2.jpg', 'Bornage du site au bord de la lagune']],
  },
  {
    slug: 'rencontres', theme: 'Vie de l\'entreprise', titre: 'Rencontres, salons et partenariats',
    resume: 'Signatures de conventions, réunions avec nos partenaires, salons et médias : retour sur la vie de Desby & Fils hors des chantiers.',
    couverture: 'blog/ren-1.jpg', tete: 'blog/ren-2.jpg',
    texte: [
      ['grand', 'Un projet immobilier se joue aussi autour d\'une table. Desby & Fils multiplie les rencontres pour faire avancer ses chantiers.'],
      ['', 'Signature de conventions, comptes rendus de chantier avec nos partenaires et nos mutualistes, présence sur les salons de l\'habitat, passage à l\'Agence Ivoirienne de Presse : chaque rendez-vous est l\'occasion de présenter nos projets et de nouer de nouvelles collaborations.'],
      ['citation', 'Le capital confiance, c\'est notre premier investissement.', 'Desby & Fils SARL'],
    ],
    photos: [['blog/ren-1.jpg', 'Signature d\'une convention de partenariat'], ['blog/ren-2.jpg', 'Compte rendu de chantier avec nos partenaires'], ['blog/ren-3.jpg', 'Sur un salon de l\'habitat'], ['blog/ren-4.jpg', 'Lors d\'une cérémonie officielle'], ['blog/ren-5.jpg', 'De passage à l\'Agence Ivoirienne de Presse'], ['blog/ren-6.jpg', 'À l\'AIP'], ['blog/ren-7.jpg', 'Rencontre avec un partenaire']],
  },
];

const esc = s => s.replace(/&(?!amp;|#|[a-z]+;)/g, '&amp;').replace(/"/g, '&quot;');
const WA = 'https://wa.me/2250709362503';
const icoWa = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1a15 15 0 0 1-6.6-5.8c-.5-.7-.9-1.6-.9-2.5 0-.9.5-1.4.7-1.6.2-.2.4-.3.6-.3h.4c.2 0 .3 0 .5.4l.7 1.7c.1.2.1.3 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.1 1 2.1 1.3 2.4 1.4.3.1.5.1.6-.1l.9-1c.2-.2.4-.2.6-.1l1.6.8c.3.1.5.2.5.3.1.2.1.7-.1 1.2Z"/></svg>';
const fleche = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

const tete = (titre, desc, image, sombre) => `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(titre)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="theme-color" content="#f7f1e6">
  <link rel="icon" href="assets/img/logo.svg" type="image/svg+xml">
  <meta property="og:title" content="${esc(titre)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:image" content="assets/img/${image}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;800;900&family=Manrope:wght@400;500;600;700;800&family=Saira+Stencil+One&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/style.css?v=${V}">
</head>
<body>

<header class="entete${sombre ? ' entete--sombre est-solide' : ''}" id="entete">
  <div class="conteneur">
    <a class="marque" href="index.html" aria-label="Desby & Fils — accueil">
      <img src="assets/img/logo.svg" alt="">
      <span>Desby &amp; Fils<small>Bâtiment &amp; Services</small></span>
    </a>
    <button class="burger" id="burger" aria-label="Ouvrir le menu" aria-expanded="false"><span></span><span></span><span></span></button>
    <nav class="nav" id="nav">
      <a href="index.html">Accueil</a>
      <a href="a-propos.html">À propos</a>
      <a href="blog.html" aria-current="page">Blog</a>
      <a href="contact.html">Contact</a>
      <a class="btn" href="contact.html">Nous contacter</a>
    </nav>
  </div>
</header>
`;

const pied = `
<footer class="pied">
  <div class="conteneur">
    <div class="pied__grille">
      <div class="pied__marque">
        <img src="assets/img/logo.svg" alt="Desby & Fils SARL">
        <p>Aménagement foncier, BTP, génie civil et services. Partenaire sûr de votre investissement immobilier.</p>
      </div>
      <div><h4>Navigation</h4><ul><li><a href="index.html">Accueil</a></li><li><a href="a-propos.html">À propos</a></li><li><a href="blog.html">Blog</a></li><li><a href="index.html#lotissements">Lotissements</a></li><li><a href="contact.html">Contact</a></li></ul></div>
      <div><h4>Métiers</h4><ul><li>Aménagement foncier</li><li>BTP · Génie civil</li><li>Location de machines</li><li>Fourniture bâtiment</li></ul></div>
      <div><h4>Contact</h4><ul>
        <li>Siège social : Cocody Angré 7ème tranche, Abidjan</li>
        <li><a href="tel:+2250709362503">07 09 36 25 03</a></li>
        <li><a href="mailto:jeanlouisdesby@gmail.com">jeanlouisdesby@gmail.com</a></li>
      </ul></div>
    </div>
    <div class="pied__bas"><span>© <span data-annee>2026</span> Desby &amp; Fils SARL. Tous droits réservés.</span><span>Abidjan · Côte d'Ivoire</span></div>
  </div>
</footer>

<a class="wa-flottant" href="${WA}" target="_blank" rel="noopener" aria-label="Écrire sur WhatsApp">${icoWa}</a>

<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="https://unpkg.com/lenis@1.1.13/dist/lenis.min.js"></script>
<script src="assets/js/main.js?v=${V}"></script>
</body>
</html>
`;

const nbMedias = a => a.photos.length + (a.videos?.length || 0);
const icoPhotos = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="m21 17-5-5-8 7"/></svg>';

// ---------- page Blog ----------
const cartes = articles.map(a => `        <a class="carte-article revele" href="article-${a.slug}.html">
          <div class="carte-article__photo"><img src="assets/img/${a.couverture}" alt="" loading="lazy">
            <span class="carte-article__nb">${icoPhotos}${nbMedias(a)} ${a.videos ? 'photos et vidéos' : 'photos'}</span></div>
          <div class="carte-article__corps">
            <span class="carte-article__theme">${a.theme}</span>
            <h2>${a.titre}</h2>
            <p>${a.resume}</p>
            <span class="carte-article__lire">Voir l'album ${fleche}</span>
          </div>
        </a>`).join('\n');

fs.writeFileSync('blog.html', tete('Blog — Desby & Fils SARL', 'Les nouvelles de nos chantiers en images : lotissements, viabilisation, bornage et partenariats de Desby & Fils SARL.', 'blog/gd-1.jpg', true) + `
<main>
  <section class="bandeau-page">
    <img class="bandeau-page__deco" src="assets/img/logo.svg" alt="">
    <div class="conteneur">
      <span class="surtitre revele">Le blog</span>
      <h1 class="revele">Nos chantiers <br>en <em>images</em></h1>
      <p class="lead revele">Suivez l'avancée de nos lotissements et la vie de l'entreprise. Touchez un article pour ouvrir son album photo.</p>
    </div>
  </section>

  <section class="section" style="padding-top:clamp(50px,8vh,90px)">
    <div class="conteneur">
      <div class="articles">
${cartes}
      </div>
    </div>
  </section>
</main>
` + pied);

// ---------- pages d'articles ----------
const bloc = ([type, t, auteur]) => type === 'citation'
  ? `        <blockquote class="revele">« ${t} »<cite>${auteur}</cite></blockquote>`
  : `        <p class="revele${type ? ' ' + type : ''}">${t}</p>`;

for (const a of articles) {
  const autres = articles.filter(x => x !== a).map(x => `        <a href="article-${x.slug}.html"><img src="assets/img/${x.couverture}" alt="" loading="lazy"><span><small>${x.theme}</small><strong>${x.titre}</strong></span></a>`).join('\n');
  const album = a.photos.map(([s, c]) => `        <button type="button" class="revele"><img src="assets/img/${s}" alt="${esc(c)}" loading="lazy"><span>${c}</span></button>`).join('\n');
  const videos = a.videos ? `
      <div class="videos">
${a.videos.map(([v, p, c]) => `        <figure class="revele"><div class="video"><video src="assets/video/${v}" poster="assets/img/${p}" controls playsinline preload="none"></video><img class="marque-eau" src="assets/img/logo.svg" alt="" aria-hidden="true"></div><figcaption>${c}</figcaption></figure>`).join('\n')}
      </div>` : '';
  fs.writeFileSync(`article-${a.slug}.html`, tete(`${a.titre} — Desby & Fils SARL`, a.resume, a.couverture, false) + `
<main>
  <section class="article-tete">
    <img src="assets/img/${a.tete}" alt="">
    <div class="conteneur">
      <a class="retour" href="blog.html"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>Tous les articles</a><br>
      <span class="surtitre">${a.theme}</span>
      <h1>${a.titre}</h1>
    </div>
  </section>

  <section class="section">
    <div class="conteneur">
      <div class="article-texte">
${a.texte.map(bloc).join('\n')}
      </div>${videos}
      <div class="album" data-album>
${album}
      </div>
    </div>
  </section>

  <section class="section section--sable">
    <div class="conteneur">
      <span class="surtitre revele">À lire aussi</span>
      <div class="autres">
${autres}
      </div>
    </div>
  </section>

  <section class="section cta">
    <div class="cta__fond"><img src="assets/img/chantier-engins.jpg" alt="" data-parallaxe-img></div>
    <div class="conteneur">
      <div>
        <h2 class="revele">Un lot vous intéresse ?</h2>
        <p class="revele">Écrivez-nous, nous vous répondons rapidement et organisons une visite du site.</p>
      </div>
      <div class="cta__actions revele">
        <a class="btn btn--clair" href="contact.html">Nous contacter</a>
        <a class="btn btn--whatsapp" href="${WA}" target="_blank" rel="noopener">WhatsApp</a>
      </div>
    </div>
  </section>
</main>
` + pied);
}
console.log('blog.html +', articles.length, 'articles');
