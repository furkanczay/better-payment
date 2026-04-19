# Beta Sürüm Yayınlama Kılavuzu

## Yöntem 1: Otomatik Beta Releases (Beta Branch)

### 1. Beta Branch Oluşturma

```bash
git checkout -b beta
git push -u origin beta
```

### 2. Beta için Değişiklik Yapma

```bash
# Değişikliklerinizi yapın
git add .
git commit -m "feat: yeni beta özelliği"
git push origin beta
```

### 3. Release-Please PR'ını Bekleyin

- GitHub Actions otomatik olarak bir PR oluşturacak
- PR'ı merge ettiğinizde beta sürüm yayınlanır
- Sürüm: `1.4.0-beta.0` formatında olur

### 4. Beta Sürümü Yükleme

```bash
npm install better-payment@beta
```

---

## Yöntem 2: Manuel Beta Sürüm (Hızlı)

### 1. package.json'da Beta Versiyonu Ayarlayın

```json
{
  "version": "1.4.0-beta.0"
}
```

### 2. Build ve Test

```bash
npm run build
npm test
```

### 3. NPM'e Beta Tag ile Yayınlayın

```bash
npm publish --tag beta
```

### 4. Kullanıcılar Beta Sürümü Şöyle Yükler

```bash
npm install better-payment@beta
# veya
npm install better-payment@1.4.0-beta.0
```

---

## Yöntem 3: GitHub Release ile Manuel Beta

### 1. Versiyon Güncelleyin

```bash
npm version prerelease --preid=beta
# Örnek: 1.3.0 -> 1.3.1-beta.0
```

### 2. Tag Oluşturun ve Push Edin

```bash
git push --follow-tags
```

### 3. GitHub Release Oluşturun

- GitHub'da Releases sayfasına gidin
- "Draft a new release" tıklayın
- Tag: `v1.4.0-beta.0` seçin
- "This is a pre-release" checkbox'ını işaretleyin
- Publish release

### 4. NPM'e Yayınlayın

```bash
npm publish --tag beta
```

---

## Beta'dan Stable'a Geçiş

### Beta Sürümlerinden Sonra Stable Yayınlama

```bash
# Beta'dan stable'a
git checkout main
git merge beta
npm version 1.4.0  # Beta'yı kaldırın
npm publish --tag latest
```

---

## NPM Tag Yönetimi

### Mevcut Tag'leri Görüntüleme

```bash
npm dist-tag ls better-payment
```

### Latest Tag'ini Değiştirme

```bash
npm dist-tag add better-payment@1.4.0 latest
npm dist-tag add better-payment@1.4.0-beta.0 beta
```

### Beta Tag'ini Kaldırma

```bash
npm dist-tag rm better-payment beta
```

---

## Önerilen Workflow

1. **Development**: `main` branch'te çalışın
2. **Beta Release**: Beta özellikleri için `beta` branch kullanın
3. **Stable Release**: Test edilen beta'ları main'e merge edin

### Versiyonlama Stratejisi

- `1.4.0-beta.0` → İlk beta
- `1.4.0-beta.1` → İkinci beta (düzeltmeler)
- `1.4.0-beta.2` → Üçüncü beta
- `1.4.0` → Stable release

### Kullanıcılar İçin

```bash
# Beta kullanıcıları
npm install better-payment@beta

# Stable kullanıcıları
npm install better-payment
# veya
npm install better-payment@latest
```
