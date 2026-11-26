/*
 * main.js — Affichage de la grille (aucune règle du jeu ici).
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

  function afficherGrille(conteneur, partie) {
    conteneur.textContent = "";
    for (var l = 0; l < partie.taille; l++) {
      var ligne = document.createElement("div");
      ligne.className = "grille__ligne";
      ligne.setAttribute("role", "row");

      for (var c = 0; c < partie.taille; c++) {
        var valeur = partie.depart[l][c];
        var caseEl = document.createElement("div");
        caseEl.className = "case";
        caseEl.setAttribute("role", "gridcell");
        caseEl.dataset.ligne = String(l);
        caseEl.dataset.colonne = String(c);

        var description = "Ligne " + (l + 1) + ", colonne " + (c + 1) + " : " + nomSymbole(valeur);
        if (valeur !== Grille.VIDE) {
          caseEl.classList.add("case--depart");
          caseEl.appendChild(creerSymbole(valeur));
          description += " (case de départ)";
        }
        caseEl.setAttribute("aria-label", description);
        ligne.appendChild(caseEl);
      }
      conteneur.appendChild(ligne);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var conteneur = document.getElementById("grille");
    if (!conteneur) return;
    afficherGrille(conteneur, Grille.creerPartieDuJour(new Date()));
  });
})();
