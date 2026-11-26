/*
 * grille.js — Logique de la grille (aucun affichage ici).
 *
 * Valeurs d'une case :
 *   VIDE   = 0
 *   SOLEIL = 1
 *   LUNE   = 2
 *
 * Règles respectées par la solution générée :
 *   - chaque ligne et chaque colonne contient 3 soleils et 3 lunes ;
 *   - jamais plus de 2 symboles identiques côte à côte (ligne ou colonne).
 *
 * La grille du jour est générée à partir de la date : même graine,
 * donc même grille pour tout le monde le même jour.
 */
var Grille = (function () {
  "use strict";

  var TAILLE = 6;
  var VIDE = 0;
  var SOLEIL = 1;
  var LUNE = 2;
  var NB_CASES_DEPART = 10;
  var NB_SIGNES = 8;

  /* Signes entre cases voisines. */
  var EGAL = "egal";
  var OPPOSE = "oppose";
  var DROITE = "droite";
  var BAS = "bas";

  /* Générateur pseudo-aléatoire déterministe (mulberry32). */
  function creerAleatoire(graine) {
    var etat = graine >>> 0;
    return function () {
      etat = (etat + 0x6d2b79f5) >>> 0;
      var t = etat;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* Graine à partir d'une date : AAAAMMJJ (heure locale). */
  function graineDuJour(date) {
    return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  }

  function melanger(tableau, aleatoire) {
    for (var i = tableau.length - 1; i > 0; i--) {
      var j = Math.floor(aleatoire() * (i + 1));
      var tmp = tableau[i];
      tableau[i] = tableau[j];
      tableau[j] = tmp;
    }
    return tableau;
  }

  function grilleVide() {
    var g = [];
    for (var l = 0; l < TAILLE; l++) {
      var ligne = [];
      for (var c = 0; c < TAILLE; c++) {
        ligne.push(VIDE);
      }
      g.push(ligne);
    }
    return g;
  }

  /* Vérifie qu'on peut poser « valeur » en (l, c), la grille étant remplie ligne par ligne. */
  function placementPossible(g, l, c, valeur) {
    var moitie = TAILLE / 2;
    var nbLigne = 0;
    var nbColonne = 0;
    for (var i = 0; i < TAILLE; i++) {
      if (g[l][i] === valeur) nbLigne++;
      if (g[i][c] === valeur) nbColonne++;
    }
    if (nbLigne >= moitie || nbColonne >= moitie) return false;
    if (c >= 2 && g[l][c - 1] === valeur && g[l][c - 2] === valeur) return false;
    if (l >= 2 && g[l - 1][c] === valeur && g[l - 2][c] === valeur) return false;
    return true;
  }

  function remplir(g, index, aleatoire) {
    if (index === TAILLE * TAILLE) return true;
    var l = Math.floor(index / TAILLE);
    var c = index % TAILLE;
    var choix = melanger([SOLEIL, LUNE], aleatoire);
    for (var k = 0; k < choix.length; k++) {
      if (placementPossible(g, l, c, choix[k])) {
        g[l][c] = choix[k];
        if (remplir(g, index + 1, aleatoire)) return true;
        g[l][c] = VIDE;
      }
    }
    return false;
  }

  /* Choisit les cases de départ révélées à partir de la solution. */
  function choisirCasesDepart(solution, aleatoire) {
    var indices = [];
    for (var i = 0; i < TAILLE * TAILLE; i++) indices.push(i);
    melanger(indices, aleatoire);

    var depart = grilleVide();
    for (var k = 0; k < NB_CASES_DEPART; k++) {
      var l = Math.floor(indices[k] / TAILLE);
      var c = indices[k] % TAILLE;
      depart[l][c] = solution[l][c];
    }
    return depart;
  }

  /*
   * Choisit des signes entre cases voisines, cohérents avec la solution :
   *   « = »  (EGAL)   : les deux cases portent le même symbole ;
   *   « × »  (OPPOSE) : les deux cases portent des symboles différents.
   * Chaque signe : { ligne, colonne, direction, type } où « direction »
   * vaut DROITE (case voisine à droite) ou BAS (case voisine en dessous).
   */
  function choisirSignes(solution, aleatoire) {
    var paires = [];
    for (var l = 0; l < TAILLE; l++) {
      for (var c = 0; c < TAILLE; c++) {
        if (c < TAILLE - 1) paires.push({ ligne: l, colonne: c, direction: DROITE });
        if (l < TAILLE - 1) paires.push({ ligne: l, colonne: c, direction: BAS });
      }
    }
    melanger(paires, aleatoire);

    var signes = [];
    for (var k = 0; k < NB_SIGNES && k < paires.length; k++) {
      var p = paires[k];
      var l2 = p.direction === BAS ? p.ligne + 1 : p.ligne;
      var c2 = p.direction === DROITE ? p.colonne + 1 : p.colonne;
      p.type = solution[p.ligne][p.colonne] === solution[l2][c2] ? EGAL : OPPOSE;
      signes.push(p);
    }
    return signes;
  }

  /*
   * Crée la partie du jour.
   * Renvoie { taille, solution, depart, signes } où « depart » ne contient
   * que les cases de départ (les autres valent VIDE) et « signes » la liste
   * des contraintes « = » / « × » entre cases voisines.
   */
  function creerPartieDuJour(date) {
    var aleatoire = creerAleatoire(graineDuJour(date || new Date()));
    var solution = grilleVide();
    remplir(solution, 0, aleatoire);
    var depart = choisirCasesDepart(solution, aleatoire);
    return {
      taille: TAILLE,
      solution: solution,
      depart: depart,
      signes: choisirSignes(solution, aleatoire)
    };
  }

  return {
    TAILLE: TAILLE,
    VIDE: VIDE,
    SOLEIL: SOLEIL,
    LUNE: LUNE,
    EGAL: EGAL,
    OPPOSE: OPPOSE,
    DROITE: DROITE,
    BAS: BAS,
    creerPartieDuJour: creerPartieDuJour
  };
})();
