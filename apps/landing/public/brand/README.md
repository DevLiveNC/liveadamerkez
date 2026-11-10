# Marka varlıkları (yer tutucu)

Logo **kesin değil**. Ürün arayüzü marka-kiti kilitlerini gömmez.

Tek değiştirilebilir kaynak:

| Dosya | Kullanım |
|---|---|
| `logo.svg` | Wordmark. `Logo` bileşeni ve `--am-form-logo` bunu okur. Nav, form, teşekkür, alt bilgi. |
| `icon.svg` | Kare uygulama işareti (PWA / favicon kaynağı). |
| `icon-maskable.svg` | Maskable (güvenli alan ortada). |

Yeni işaret gelince **yalnız bu klasörü** güncelleyin; bileşen yollarına dokunmayın.

PWA PNG’leri `public/icons/` ve `public/favicon-*.png` altındadır — aynı işareti yeni ölçüyle üretip bu dosyaların üzerine yazın. `tokens.json` içindeki `logo.status` silinmez.
