/*
 * solveur.js — Solveur de grilles Tango (aucun affichage ici).
 * Chargé avant grille.js, qui l'utilise pour fabriquer la grille du jour.
 *
 * Deux solveurs complémentaires :
 *
 *   1. resoudreLogiquement : résolution « humaine », pas à pas, uniquement
 *      par des règles logiques simples appliquées à une ligne ou une colonne.
 *      Aucune supposition, aucun retour en arrière : chaque case posée est
 *      justifiée par une règle (voir REGLES ci-dessous). Si cette méthode
 *      remplit toute la grille, la grille est résoluble sans deviner.
 *
 *   2. compterSolutions : recherche exhaustive (retour arrière) qui compte
 *      les solutions respectant toutes les règles, jusqu'à une limite.
 *      Sert à vérifier qu'une grille admet exactement une solution.
 *
 * Mêmes conventions que grille.js : VIDE = 0, SOLEIL = 1, LUNE = 2 ;
 * signes { ligne, colonne, direction: "droite" | "bas", type: "egal" | "oppose" }.
 */
var Solveur = (function () {
  "use strict";

  var VIDE = 0;
  var SOLEIL = 1;
  var LUNE = 2;
  var EGAL = "egal";
  var OPPOSE = "oppose";
  var DROITE = "droite";
  var BAS = "bas";

  /* Explication de chaque règle logique (utile pour justifier une déduction, par exemple pour un indice). */
  var REGLES = {
    "signe-egal": "Un signe « = » relie cette case à une case déjà remplie : elle porte le même symbole.",
    "signe-oppose": "Un signe « × » relie cette case à une case déjà remplie : elle porte l'autre symbole.",
    "paire": "Deux symboles identiques se suivent : la case qui les prolonge doit porter l'autre symbole, sinon il y en aurait trois d'affilée.",
    "sandwich": "Cette case est entre deux symboles identiques : elle doit porter l'autre symbole, sinon il y en aurait trois d'affilée.",
    "egal-voisin": "Deux cases reliées par « = » sont identiques ; elles touchent un symbole : elles doivent porter l'autre, sinon il y en aurait trois d'affilée.",
    "compte": "Cette ligne (ou colonne) a déjà son compte de 3 symboles de ce type, en tenant compte des paires « × » qui en contiennent forcément un : les autres cases portent l'autre symbole.",
    "compte-egal": "Ces deux cases reliées par « = » sont identiques ; leur ligne (ou colonne) n'a plus la place pour deux symboles de ce type : elles portent l'autre symbole."
  };

  function oppose(valeur) {
    return valeur === SOLEIL ? LUNE : SOLEIL;
  }

  function copier(grille) {
    var g = [];
    for (var l = 0; l < grille.length; l++) g.push(grille[l].slice());
    return g;
  }

  /* Tableaux taille×taille des signes : liens.droite[l][c] relie (l, c) à (l, c+1), liens.bas[l][c] relie (l, c) à (l+1, c). */
  function construireLiens(taille, signes) {
    var droite = [];
    var bas = [];
    for (var l = 0; l < taille; l++) {
      var ld = [];
      var lb = [];
      for (var c = 0; c < taille; c++) {
        ld.push(null);
        lb.push(null);
      }
      droite.push(ld);
      bas.push(lb);
    }
    for (var i = 0; i < signes.length; i++) {
      var s = signes[i];
      if (s.direction === DROITE) droite[s.ligne][s.colonne] = s.type;
      else bas[s.ligne][s.colonne] = s.type;
    }
    return { droite: droite, bas: bas };
  }

  /*
   * Les 12 « lignes » de la grille (6 lignes + 6 colonnes), chacune avec
   * ses cases dans l'ordre et les signes entre cases consécutives.
   */
  function construireLignes(taille, liens) {
    var lignes = [];
    for (var l = 0; l < taille; l++) {
      var cases = [];
      var signesLigne = [];
      for (var c = 0; c < taille; c++) {
        cases.push({ ligne: l, colonne: c });
        if (c < taille - 1) signesLigne.push(liens.droite[l][c]);
      }
      lignes.push({ nom: "ligne " + (l + 1), cases: cases, liens: signesLigne });
    }
    for (var c2 = 0; c2 < taille; c2++) {
      var casesC = [];
      var signesC = [];
      for (var l2 = 0; l2 < taille; l2++) {
        casesC.push({ ligne: l2, colonne: c2 });
        if (l2 < taille - 1) signesC.push(liens.bas[l2][c2]);
      }
      lignes.push({ nom: "colonne " + (c2 + 1), cases: casesC, liens: signesC });
    }
    return lignes;
  }

  /*
   * Cherche UNE déduction certaine dans une ligne (ou colonne).
   * Renvoie { ligne, colonne, valeur, regle, zone } ou null.
   * Chaque règle ne pose une case que si elle est forcée par les règles du jeu.
   */
  function deduireLigne(g, ligne) {
    var n = ligne.cases.length;
    var moitie = n / 2;
    var v = [];
    for (var k = 0; k < n; k++) v.push(g[ligne.cases[k].ligne][ligne.cases[k].colonne]);
    var liens = ligne.liens;

    function poser(i, valeur, regle) {
      return {
        ligne: ligne.cases[i].ligne,
        colonne: ligne.cases[i].colonne,
        valeur: valeur,
        regle: regle,
        zone: ligne.nom
      };
    }

    var i;

    /* Signes « = » et « × » dont une case est connue. */
    for (i = 0; i < n - 1; i++) {
      if (!liens[i]) continue;
      var memeSymbole = liens[i] === EGAL;
      var regleSigne = memeSymbole ? "signe-egal" : "signe-oppose";
      if (v[i] !== VIDE && v[i + 1] === VIDE) return poser(i + 1, memeSymbole ? v[i] : oppose(v[i]), regleSigne);
      if (v[i] === VIDE && v[i + 1] !== VIDE) return poser(i, memeSymbole ? v[i + 1] : oppose(v[i + 1]), regleSigne);
    }

    /* Paire : X X → les cases qui l'encadrent portent l'autre symbole. */
    for (i = 0; i < n - 1; i++) {
      if (v[i] === VIDE || v[i] !== v[i + 1]) continue;
      if (i - 1 >= 0 && v[i - 1] === VIDE) return poser(i - 1, oppose(v[i]), "paire");
      if (i + 2 < n && v[i + 2] === VIDE) return poser(i + 2, oppose(v[i]), "paire");
    }

    /* Sandwich : X _ X → la case du milieu porte l'autre symbole. */
    for (i = 0; i < n - 2; i++) {
      if (v[i] !== VIDE && v[i] === v[i + 2] && v[i + 1] === VIDE) return poser(i + 1, oppose(v[i]), "sandwich");
    }

    /* Paire « = » de cases vides qui touche un symbole X : la paire porte l'autre symbole. */
    for (i = 0; i < n - 1; i++) {
      if (liens[i] !== EGAL || v[i] !== VIDE || v[i + 1] !== VIDE) continue;
      if (i - 1 >= 0 && v[i - 1] !== VIDE) return poser(i, oppose(v[i - 1]), "egal-voisin");
      if (i + 2 < n && v[i + 2] !== VIDE) return poser(i + 1, oppose(v[i + 2]), "egal-voisin");
    }

    /*
     * Comptage. Les cases vides sont regroupées (sans chevauchement) en :
     *   - paires « × » : contiennent forcément un soleil et une lune ;
     *   - paires « = » : contiennent deux symboles identiques ;
     *   - cases seules.
     */
    var groupes = [];
    i = 0;
    while (i < n) {
      if (v[i] !== VIDE) {
        i++;
      } else if (i + 1 < n && v[i + 1] === VIDE && liens[i]) {
        groupes.push({ type: liens[i], debut: i });
        i += 2;
      } else {
        groupes.push({ type: "seule", debut: i });
        i++;
      }
    }
    var nbOpposes = 0;
    for (var gr = 0; gr < groupes.length; gr++) {
      if (groupes[gr].type === OPPOSE) nbOpposes++;
    }

    var symboles = [SOLEIL, LUNE];
    for (var s = 0; s < symboles.length; s++) {
      var symbole = symboles[s];
      var nbConnus = 0;
      for (i = 0; i < n; i++) {
        if (v[i] === symbole) nbConnus++;
      }
      /* Nombre minimal de « symbole » déjà assuré dans la ligne. */
      var minimum = nbConnus + nbOpposes;
      for (gr = 0; gr < groupes.length; gr++) {
        var groupe = groupes[gr];
        if (groupe.type === OPPOSE) continue;
        if (groupe.type === "seule" && minimum >= moitie) return poser(groupe.debut, oppose(symbole), "compte");
        if (groupe.type === EGAL && minimum + 2 > moitie) return poser(groupe.debut, oppose(symbole), "compte-egal");
      }
    }

    return null;
  }

  /* Vérifie qu'une grille complète respecte toutes les règles. */
  function grilleValide(g, liens) {
    var taille = g.length;
    for (var l = 0; l < taille; l++) {
      for (var c = 0; c < taille; c++) {
        if (g[l][c] === VIDE || !caseCompatible(g, liens, l, c)) return false;
      }
    }
    return true;
  }

  /*
   * Vérifie que la case (l, c), déjà remplie, ne viole aucune règle avec les
   * cases remplies autour d'elle (cases vides ignorées).
   */
  function caseCompatible(g, liens, l, c) {
    var taille = g.length;
    var moitie = taille / 2;
    var valeur = g[l][c];
    var nbLigne = 0;
    var nbColonne = 0;
    for (var i = 0; i < taille; i++) {
      if (g[l][i] === valeur) nbLigne++;
      if (g[i][c] === valeur) nbColonne++;
    }
    if (nbLigne > moitie || nbColonne > moitie) return false;

    /* Trois identiques d'affilée : toutes les fenêtres de 3 cases qui contiennent (l, c). */
    for (var d = -2; d <= 0; d++) {
      var c0 = c + d;
      if (c0 >= 0 && c0 + 2 < taille && g[l][c0] === valeur && g[l][c0 + 1] === valeur && g[l][c0 + 2] === valeur) return false;
      var l0 = l + d;
      if (l0 >= 0 && l0 + 2 < taille && g[l0][c] === valeur && g[l0 + 1][c] === valeur && g[l0 + 2][c] === valeur) return false;
    }

    /* Signes avec les quatre voisines. */
    if (!signeRespecte(liens.droite[l][c], valeur, c + 1 < taille ? g[l][c + 1] : VIDE)) return false;
    if (!signeRespecte(liens.bas[l][c], valeur, l + 1 < taille ? g[l + 1][c] : VIDE)) return false;
    if (c > 0 && !signeRespecte(liens.droite[l][c - 1], valeur, g[l][c - 1])) return false;
    if (l > 0 && !signeRespecte(liens.bas[l - 1][c], valeur, g[l - 1][c])) return false;
    return true;
  }

  function signeRespecte(type, a, b) {
    if (!type || a === VIDE || b === VIDE) return true;
    return type === EGAL ? a === b : a !== b;
  }

  /*
   * Résolution logique pas à pas, sans supposition.
   * Renvoie { resolue, grille, etapes } :
   *   - resolue : vrai si la grille a été entièrement remplie par déductions
   *     et que le résultat respecte toutes les règles ;
   *   - etapes : liste ordonnée des déductions { ligne, colonne, valeur, regle, zone }.
   */
  function resoudreLogiquement(taille, depart, signes) {
    var liens = construireLiens(taille, signes);
    var lignes = construireLignes(taille, liens);
    var g = copier(depart);
    var etapes = [];

    var deduction = prochaineDeductionInterne(g, lignes);
    while (deduction) {
      g[deduction.ligne][deduction.colonne] = deduction.valeur;
      if (!caseCompatible(g, liens, deduction.ligne, deduction.colonne)) {
        return { resolue: false, grille: g, etapes: etapes };
      }
      etapes.push(deduction);
      deduction = prochaineDeductionInterne(g, lignes);
    }
    return { resolue: grilleValide(g, liens), grille: g, etapes: etapes };
  }

  function prochaineDeductionInterne(g, lignes) {
    for (var i = 0; i < lignes.length; i++) {
      var d = deduireLigne(g, lignes[i]);
      if (d) return d;
    }
    return null;
  }

  /* Première déduction logique possible depuis une grille partiellement remplie (ou null). */
  function prochaineDeduction(taille, grille, signes) {
    var liens = construireLiens(taille, signes);
    return prochaineDeductionInterne(grille, construireLignes(taille, liens));
  }

  /*
   * Compte les solutions complètes compatibles avec les cases de départ et
   * les signes, en s'arrêtant dès « limite » solutions trouvées (2 suffit
   * pour savoir si la solution est unique).
   */
  function compterSolutions(taille, depart, signes, limite) {
    var liens = construireLiens(taille, signes);
    var g = copier(depart);
    var total = 0;
    var max = limite || 2;

    function explorer(index) {
      if (total >= max) return;
      if (index === taille * taille) {
        total++;
        return;
      }
      var l = Math.floor(index / taille);
      var c = index % taille;
      if (g[l][c] !== VIDE) {
        if (caseCompatible(g, liens, l, c)) explorer(index + 1);
        return;
      }
      var choix = [SOLEIL, LUNE];
      for (var k = 0; k < choix.length; k++) {
        g[l][c] = choix[k];
        if (caseCompatible(g, liens, l, c)) explorer(index + 1);
        g[l][c] = VIDE;
        if (total >= max) return;
      }
    }

    explorer(0);
    return total;
  }

  return {
    REGLES: REGLES,
    resoudreLogiquement: resoudreLogiquement,
    prochaineDeduction: prochaineDeduction,
    compterSolutions: compterSolutions
  };
})();
