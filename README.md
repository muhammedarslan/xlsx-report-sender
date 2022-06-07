# XLSX Report Automation

Excel üzerindeki belirlenen formattaki raporlarının haftalık sıklıkta belirli filtreler uygulanarak mail listesindeki kişilere gönderilmesini sağlayan otomasyon uygulaması.

## Teknolojiler

**api:** Node.js, Express

**job:** Node.js, Selenium

## Ortam Değişkenleri

Aşağıdaki ortam değişkenlerinin **.env** dosyasında düzenlenmesi gerekmektedir.

`basePath`
`expressPort`
`dbConn`
`dbHost`
`dbName`
`dbUser`
`dbPass`

## Rapor Değişkenleri

Aşağıdaki ortam değişkenleri excel raporlarını temsil eder, düzenlenmesi gerekmektedir.

`reportFileRep1`
`reportFileRep2`

## Kurulum

Projeyi klonlayın

```bash
  git clone https://github.com/muhammedarslan/xlsx-report-notifier
```

Aşağıdaki dizinlerde gerekli paketleri yükleyin

```bash
  cd api
  npm install
  cd .. && cd app
  npm install
  cd .. && cd job
  npm install
```

app/src/environments klasörü içerisindeki angular değişkenlerini düzenleyin ve build alın

```bash
  cd app
  ng build --prod
```

Express uygulamasını pm2 işlem yöneticisinde başlatın

```bash
  cd api
  npx pm2 start index.js
```

## Görev Çalıştırma

**job** dizinine gidin ve node uygulamasını çalıştırın

```bash
  cd job
  npm start
```
