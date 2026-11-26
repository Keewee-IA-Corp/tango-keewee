/*
 * main.js — Affichage de la grille et saisie du joueur (aucune règle du jeu ici).
 * Dépend de grille.js, chargé avant ce fichier.
 */
(function () {
  "use strict";

  var SVG_NS = "http://www.w3.org/2000/svg";

  /* Dessine un soleil (disque) ou une lune (croissant) en SVG. */
  function creerSymbole(valeur) {
    var svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");

    var forme;
    if (valeur === Grille.SOLEIL) {
      svg.setAttribute("class", "symbole symbole--soleil");
      forme = document.createElementNS(SVG_NS, "circle");
      forme.setAttribute("cx", "12");
      forme.setAttribute("cy", "12");
      forme.setAttribute("r", "8");
    } else {
      svg.setAttribute("class", "symbole symbole--lune");
      forme = document.createElementNS(SVG_NS, "path");
      /* Croissant : grand cercle (centre 12,12 ; rayon 8) privé d'un cercle décalé en haut à droite. */
      forme.setAttribute("d", "M11.31 4.03 A8 8 0 1 0 19.77 13.9 A6.5 6.5 0 0 1 11.31 4.03 Z");
    }
    svg.appendChild(forme);
    return svg;
  }

  function nomSymbole(valeur) {
    if (valeur === Grille.SOLEIL) return "soleil";
    if (valeur === Grille.LUNE) return "lune";
    return "vide";
  }

  /*
   * Crée le petit signe « = » ou « × » posé à cheval sur la bordure entre
   * une case et sa voisine (à droite ou en dessous). Purement visuel :
   * il est décrit dans l'aria-label des cases et ne capte pas les clics.
   */
  function creerSigne(signe) {
    var el = document.createElement("span");
    el.className = "signe signe--" + signe.direction;
    el.setAttribute("aria-hidden", "true");
    el.textContent = signe.type === Grille.EGAL ? "=" : "×";
    return el;
  }

  function texteSigne(signe) {
    return signe.type === Grille.EGAL ? "signe égal" : "signe opposé";
  }

  /* Tableau 6×6 de listes vides : les descriptions des signes de chaque case. */
  function creerTextesSignes(taille) {
    var textes = [];
    for (var l = 0; l < taille; l++) {
      var ligne = [];
      for (var c = 0; c < taille; c++) ligne.push([]);
      textes.push(ligne);
    }
    return textes;
  }

  /* Texte lu par les lecteurs d'écran pour une case. */
  function libelleCase(l, c, valeur, depart, textesSignes) {
    var texte = "Ligne " + (l + 1) + ", colonne " + (c + 1) + " : " + nomSymbole(valeur);
    if (depart) texte += " (case de départ)";
    var signes = textesSignes[l][c];
    for (var i = 0; i < signes.length; i++) texte += ", " + signes[i];
    return texte;
  }

  function trouverCase(conteneur, l, c) {
    return conteneur.querySelector('.case[data-ligne="' + l + '"][data-colonne="' + c + '"]');
  }

  /* Élément qui porte l'aria-label : le bouton pour une case à remplir, la case elle-même sinon. */
  function elementLibelle(caseEl) {
    return caseEl.querySelector(".case__bouton") || caseEl;
  }

  /* Ajoute un signe à la grille affichée et mémorise sa description pour les deux cases. */
  function afficherSigne(conteneur, signe, textesSignes) {
    var l2 = signe.direction === Grille.BAS ? signe.ligne + 1 : signe.ligne;
    var c2 = signe.direction === Grille.DROITE ? signe.colonne + 1 : signe.colonne;
    var caseA = trouverCase(conteneur, signe.ligne, signe.colonne);
    var caseB = trouverCase(conteneur, l2, c2);
    if (!caseA || !caseB) return;

    caseA.appendChild(creerSigne(signe));

    var versB = signe.direction === Grille.DROITE ? "la case à droite" : "la case en dessous";
    var versA = signe.direction === Grille.DROITE ? "la case à gauche" : "la case au-dessus";
    textesSignes[signe.ligne][signe.colonne].push(texteSigne(signe) + " avec " + versB);
    textesSignes[l2][c2].push(texteSigne(signe) + " avec " + versA);
  }

  /* Remplace le symbole affiché dans un bouton de case par celui de « valeur ». */
  function afficherValeurBouton(bouton, valeur) {
    var ancien = bouton.querySelector(".symbole");
    if (ancien) bouton.removeChild(ancien);
    if (valeur !== Grille.VIDE) bouton.appendChild(creerSymbole(valeur));
  }

  function annoncer(zone, texte) {
    if (zone) zone.textContent = texte;
  }

  function afficherGrille(conteneur, partie, etat, zoneAnnonce) {
    var textesSignes = creerTextesSignes(partie.taille);
    conteneur.textContent = "";

    for (var l = 0; l < partie.taille; l++) {
      var ligne = document.createElement("div");
      ligne.className = "grille__ligne";
      ligne.setAttribute("role", "row");

      for (var c = 0; c < partie.taille; c++) {
        var caseEl = document.createElement("div");
        caseEl.className = "case";
        caseEl.setAttribute("role", "gridcell");
        caseEl.dataset.ligne = String(l);
        caseEl.dataset.colonne = String(c);

        if (Grille.estCaseDepart(partie, l, c)) {
          /* Case de départ : non modifiable, donc pas de bouton. */
          caseEl.classList.add("case--depart");
          caseEl.appendChild(creerSymbole(partie.depart[l][c]));
        } else {
          /* Case à remplir : un bouton, utilisable à la souris, au doigt et au clavier. */
          var bouton = document.createElement("button");
          bouton.type = "button";
          bouton.className = "case__bouton";
          afficherValeurBouton(bouton, etat[l][c]);
          caseEl.appendChild(bouton);
        }
        ligne.appendChild(caseEl);
      }
      conteneur.appendChild(ligne);
    }

    var signes = partie.signes || [];
    for (var s = 0; s < signes.length; s++) {
      afficherSigne(conteneur, signes[s], textesSignes);
    }

    /* Libellés accessibles, une fois les signes connus. */
    for (var l3 = 0; l3 < partie.taille; l3++) {
      for (var c3 = 0; c3 < partie.taille; c3++) {
        var el = trouverCase(conteneur, l3, c3);
        elementLibelle(el).setAttribute(
          "aria-label",
          libelleCase(l3, c3, etat[l3][c3], Grille.estCaseDepart(partie, l3, c3), textesSignes)
        );
      }
    }

    /* Un seul écouteur pour toute la grille : clic souris, tap mobile ou Entrée/Espace au clavier. */
    conteneur.addEventListener("click", function (evenement) {
      var bouton = evenement.target.closest ? evenement.target.closest(".case__bouton") : null;
      if (!bouton || !conteneur.contains(bouton)) return;
      var caseCliquee = bouton.parentNode;
      var lc = Number(caseCliquee.dataset.ligne);
      var cc = Number(caseCliquee.dataset.colonne);

      var nouvelle = Grille.changerCase(partie, etat, lc, cc);
      if (nouvelle === null) return; /* case de départ : rien ne change */

      afficherValeurBouton(bouton, nouvelle);
      var libelle = libelleCase(lc, cc, nouvelle, false, textesSignes);
      bouton.setAttribute("aria-label", libelle);
      annoncer(zoneAnnonce, "Ligne " + (lc + 1) + ", colonne " + (cc + 1) + " : " + nomSymbole(nouvelle));
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var conteneur = document.getElementById("grille");
    if (!conteneur) return;
    var partie = Grille.creerPartieDuJour(new Date());
    var etat = Grille.creerEtatJeu(partie);
    afficherGrille(conteneur, partie, etat, document.getElementById("annonce-grille"));
  });
})();
