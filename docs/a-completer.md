# Informations à compléter ou à valider par la cliente

Rien ici ne doit être inventé. Chaque point est visible sur le site ou dans la base sous la forme `[À COMPLÉTER]`, `[prix à valider]` ou une valeur vide.

## Coordonnées et réseaux (table `settings`)

- [ ] **Instagram** : deux identifiants coexistent dans l'ancien site (`mawazo.hair_beauty` et `mawazobeauty`). Lequel garder ?
- [ ] **E-mail** du salon.
- [ ] **Lien Google Maps** (bouton « Itinéraire », masqué tant qu'il est vide).
- [ ] Facebook / TikTok éventuels.
- [ ] Confirmer les horaires : lundi - samedi 9h00 - 19h00, dimanche sur rendez-vous.

## Prix (tables `services` et `products`, colonne `price_needs_review`)

Tous les prix viennent de l'ancien site et sont marqués « à valider ». Les prestations et produits sont **non publiés** dans `seed.sql`.

| Prestation | Prix de l'ancien site |
|---|---|
| Wings | À partir de 50 000 FC |
| Perruques & pose | À partir de 35 000 FC |
| Tissages | À partir de 40 000 FC |
| Braids (tresses) | À partir de 25 000 FC |
| Make-up | À partir de 20 000 FC |
| Nails | À partir de 15 000 FC |

- [ ] Produits avec prix connus à confirmer : Wing Premium (75 000 FC), Wing Bouclé (80 000 FC), Perruque Lace Front (95 000 FC).
- [ ] Produits **sans prix** : Perruque Bob, Escarpins Élégants, Sandales Dorées, Kit Maquillage Pro, Kit soins capillaires.

## Promotions (table `promotions`)

- [ ] **Mardi Promo** : taux (%) ou montant de la réduction, prestations concernées. Pour l'instant en « affichage seul ».
- [ ] **Pack Mariée** : contenu et tarif.
- [ ] **Offre duo** : conditions.
- [ ] Règle de non-cumul (la meilleure promotion l'emporte) : à confirmer.
- [ ] Règle d'arrondi (centaine de FC inférieure) : à confirmer.

## Paiement

- [ ] Numéros **M-Pesa, Orange Money, Airtel Money** du salon.

## Contenus

- [ ] Texte de présentation du salon (section `home_about`).
- [ ] Avis clientes **réels**, avec accord écrit de chaque cliente (les anciens témoignages ne sont pas repris).
- [ ] Photos réelles : voir chaque emplacement « Photo à fournir » sur la maquette (portrait héro, détail, une photo par prestation, 5 réalisations, 4 catégories boutique, salon).
- [ ] Charte : valider la palette (crème, brun, bordeaux) et les polices (Cormorant Garamond + Manrope).
- [ ] Mentions légales : raison sociale, RCCM, responsable de publication.

## Décisions Lean Market

- [ ] Nom de domaine, hébergement (voir CLAUDE.md §12).
- [ ] Offre Supabase (gratuite = mise en pause après inactivité).
