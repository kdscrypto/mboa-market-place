# Guide de Transition vers le Domaine Personnalisé mboamarket.shop

## ✅ État Actuel
- Code déjà optimisé pour la transition (utilise `window.location.origin`)
- Configuration Supabase locale prête
- URLs de redirection dynamiques implémentées

## 📋 Plan de Transition (À suivre dans l'ordre)

### Étape 1: Préparation
- [x] Vérifier que l'authentification fonctionne sur l'URL Lovable actuelle
- [x] Tester inscription, connexion, récupération de mot de passe

### Étape 2: Connexion du Domaine dans Lovable
1. Aller dans **Lovable Settings > Domains**
2. Cliquer **Connect Domain**
3. Entrer: `mboamarket.shop`
4. Suivre les instructions DNS (automatiques)
5. **⚠️ Attendre la propagation DNS (24-48h)**

### Étape 3: Configuration Supabase (APRÈS propagation DNS)
1. Aller dans **Supabase Dashboard > Authentication > URL Configuration**
2. Changer **Site URL** vers: `https://mboamarket.shop`
3. Dans **Redirect URLs**, ajouter:
   - `https://mboamarket.shop/**`
   - Garder temporairement: `https://mboa-market-place.lovable.app/**`

### Étape 4: Test de la Configuration
1. Sur le nouveau domaine `mboamarket.shop`:
   - Créer un compte test
   - Vérifier l'email de confirmation
   - Tester la connexion
   - Tester la récupération de mot de passe

### Étape 5: Finalisation
- Une fois tous les tests réussis, retirer l'ancienne URL Lovable des redirect URLs Supabase

## 🔧 URLs Importantes à Configurer

### Supabase Site URL:
```
https://mboamarket.shop
```

### Supabase Redirect URLs:
```
https://mboamarket.shop/**
https://mboa-market-place.lovable.app/** (temporaire)
```

## ⚠️ Points d'Attention

1. **Ne PAS changer la configuration Supabase avant la propagation DNS**
2. **Tester sur l'ancien domaine avant la transition**
3. **Garder l'ancienne URL pendant la période de test**
4. **Les emails de confirmation utiliseront automatiquement le bon domaine**

## 🆘 En Cas de Problème

Si les emails n'arrivent pas après la transition:
1. Vérifier la configuration Site URL dans Supabase
2. Vérifier que le domaine est dans les Redirect URLs
3. Attendre la propagation DNS complète (jusqu'à 48h)
4. Tester avec un nouvel email de récupération de mot de passe

## 📱 Vérification Post-Transition

Le code s'adaptera automatiquement car il utilise:
- `window.location.origin` pour les redirections
- Configuration dynamique des URLs d'authentification
- Gestion automatique des domaines dans tous les flux

---

**Status**: ✅ Code prêt pour la transition
**Action requise**: Configuration domaine + Supabase (étapes 2-3)